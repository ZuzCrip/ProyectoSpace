# summary.py
from __future__ import annotations

import io
import os
import re
import time
from typing import Dict, List, Tuple, Optional
from urllib.parse import urlparse

import requests
import trafilatura
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from openai import OpenAI

# ============================================================================
# Configuración
# ============================================================================
load_dotenv()

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("Falta API_KEY en .env")

BASE_URL = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-4o-mini")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)

DEFAULT_TIMEOUT = 30
MAX_ATTEMPTS = 4
RETRY_DELAY = 2
MAX_CHARS_DEFAULT = 12_000

# ============================================================================
# Utilidades de red y parsing
# ============================================================================
def is_pdf_url(url: str) -> bool:
    return url.lower().split("?")[0].endswith(".pdf")

def domain_of(url: str) -> str:
    try:
        return urlparse(url).netloc or "(desconocido)"
    except Exception:
        return "(desconocido)"

def fetch_pdf_text(url: str, timeout: int = DEFAULT_TIMEOUT) -> str:
    r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
    r.raise_for_status()
    bio = io.BytesIO(r.content)
    reader = PdfReader(bio)
    pages: List[str] = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n".join(pages)

def clean_inline(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def infer_title_from_html(html: str) -> Optional[str]:
    m = re.search(r"<title>(.*?)</title>", html, flags=re.I | re.S)
    if m:
        return clean_inline(m.group(1))
    m2 = re.search(
        r'property=["\']og:title["\']\s+content=["\'](.*?)["\']',
        html,
        flags=re.I | re.S,
    )
    if m2:
        return clean_inline(m2.group(1))
    return None

def infer_title_from_text(text: str) -> Optional[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return None
    return lines[0][:140]

def extract_text_from_url(url: str, max_html_timeout: int = DEFAULT_TIMEOUT) -> Tuple[str, str, str]:
    """
    Devuelve (titulo, fuente, texto) desde una URL HTML o PDF.
    - HTML: usa trafilatura
    - PDF: usa PyPDF2
    """
    src = domain_of(url)

    # 1) PDF por extensión
    if is_pdf_url(url):
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Artículo (PDF)"
        return title, src, pdf_text

    # 2) HEAD/GET para revisar Content-Type
    r = requests.get(url, headers={"User-Agent": UA}, timeout=max_html_timeout)
    r.raise_for_status()
    ctype = (r.headers.get("Content-Type") or "").lower()
    if "pdf" in ctype:
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Artículo (PDF)"
        return title, src, pdf_text

    html = r.text

    # 3) HTML → trafilatura
    downloaded = trafilatura.extract(html, include_comments=False, favor_recall=True)
    if not downloaded or len(downloaded.strip()) < 300:
        fetched = trafilatura.fetch_url(url)
        downloaded = trafilatura.extract(
            fetched, include_comments=False, favor_recall=True
        ) if fetched else None

    text = (downloaded or "").strip()
    title = infer_title_from_html(html) or "Artículo"
    return title, src, text

# ============================================================================
# Prompt base y variantes por tipo de usuario
# ============================================================================
BASE_SYSTEM = (
    "Eres una IA especializada en resumir artículos web. "
    "Explica ideas principales y secundarias, hechos, datos y conclusiones, en lenguaje claro. "
    "Si el artículo es técnico/científico, simplifica conceptos. "
    "Mantén neutralidad y precisión."
)

def system_by_user_type(user_type: str, personalize: bool = False) -> str:
    ut = (user_type or "").strip().lower()

    if ut in {"estudiante", "student"}:
        # Incluye un bloque adicional 'Según tus preferencias'
        base = (
            BASE_SYSTEM + "\n"
            "FORMATO DE SALIDA:\n"
            "**Título del artículo:** [extraído]\n"
            "**Fuente:** [dominio]\n"
            "**Resumen:**\n"
            "- 5–7 viñetas con ideas clave.\n"
            "- Define términos técnicos de forma simple.\n"
            "- Si aplica, 1 ejemplo corto.\n"
        )
        if personalize:
            base += (
                "\n**Según tus preferencias:**\n"
                "🔎 Conecta cada interés del usuario con el tema del artículo (1–2 líneas por interés).\n"
                "✨ Usa lenguaje motivador y cercano; evita jergas.\n"
                "➡️ Formato: 3–6 bullets; cada uno inicia con un emoji y una palabra-gancho ('Aplicación:', 'Dato:', 'Tip:', 'Curiosidad:').\n"
                "🧩 Menciona explícitamente el interés en **negrita** y cómo se relaciona con el título/hallazgos.\n"
                "🎯 Añade 1 acción sugerida ('Prueba:', 'Explora:', 'Compara:') alineada a sus intereses.\n"
            )
        return base

    if ut in {"cientifico", "científico", "scientist"}:
        return (
            BASE_SYSTEM + "\n"
            "FORMATO DE SALIDA:\n"
            "**Título del artículo:** [extraído]\n"
            "**Fuente:** [dominio]\n"
            "**Resumen:**\n"
            "1) Objetivo\n"
            "2) Metodología (diseño, muestra, instrumentos)\n"
            "3) Resultados (incluye cifras/efectos si aparecen)\n"
            "4) Limitaciones\n"
            "5) Implicaciones\n"
            "6) Cita(s) clave (estilo breve APA si aparecen)\n"
        )

    if ut in {"educador", "docente", "teacher"}:
        return (
            BASE_SYSTEM + "\n"
            "FORMATO DE SALIDA:\n"
            "**Título del artículo:** [extraído]\n"
            "**Fuente:** [dominio]\n"
            "**Resumen:**\n"
            "- Objetivo de aprendizaje (1–2 oraciones)\n"
            "- Ideas clave para clase (3–5 puntos)\n"
            "- Actividades sugeridas (2 breves)\n"
            "- Preguntas de discusión (3)\n"
            "- Evaluación rápida (1 instrumento breve)\n"
            "- Conexiones curriculares/STEAM si aplica\n"
        )

    # entusiasta (default)
    return (
        BASE_SYSTEM + "\n"
        "FORMATO DE SALIDA:\n"
        "**Título del artículo:** [extraído]\n"
        "**Fuente:** [dominio]\n"
        "**Resumen:**\n"
        "• Explicación accesible (2–3 párrafos) con analogías simples.\n"
        "• 3 conclusiones clave ('takeaways').\n"
        "• Por qué importa/impacto.\n"
    )

def build_user_context_block(user_context: Dict, article_title: str) -> str:
    """
    Texto de contexto para guiar la sección personalizada del perfil 'estudiante'.
    """
    name = (user_context.get("name") or "").strip()
    interests: List[str] = user_context.get("interests") or []
    experience = (user_context.get("experience") or "").strip()

    return (
        "Contexto del usuario:\n"
        f"- Nombre: {name or '(no especificado)'}\n"
        f"- Intereses: {', '.join(interests) if interests else '(no especificados)'}\n"
        f"- Experiencia: {experience or '(no especificada)'}\n"
        f"- Tópico del artículo: {article_title}\n"
        "Instrucciones:\n"
        "- Usa los intereses EXACTOS para la sección '**Según tus preferencias**' si el perfil es 'estudiante'.\n"
        "- Enlaza cada interés con el título/tema del artículo y sus hallazgos de forma atractiva y clara.\n"
        "- Evita lenguaje técnico innecesario; prioriza motivación y claridad.\n"
    )

# ============================================================================
# Funciones principales
# ============================================================================
def summarize_url_dict(
    url: str,
    user_type: str = "entusiasta",
    user_context: Optional[Dict] = None,
    max_chars: int = MAX_CHARS_DEFAULT,
) -> Dict[str, str]:
    """
    Devuelve un diccionario listo para el frontend:
    { title, source, summary }
    """
    title, src, body = extract_text_from_url(url)
    if not body or len(body) < 200:
        return {
            "title": title or "Artículo",
            "source": src,
            "summary": "No fue posible extraer suficiente contenido del artículo.",
        }

    body = body[:max_chars]
    personalize = (user_type or "").strip().lower() in {"estudiante", "student"}
    system_prompt = system_by_user_type(user_type, personalize=personalize)

    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

    if personalize and user_context:
        messages.append({
            "role": "user",
            "content": build_user_context_block(user_context, title)
        })

    messages.append({
        "role": "user",
        "content": (
            f"Título: {title}\n"
            f"Enlace: {url}\n"
            f"Fuente: {src}\n\n"
            f"Contenido del artículo:\n{body}"
        ),
    })

    last_err = None
    for _ in range(MAX_ATTEMPTS):
        try:
            chat = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.3,
            )
            content = chat.choices[0].message.content
            if content and content.strip():
                return {
                    "title": title or "Artículo",
                    "source": src,
                    "summary": content.strip(),
                }
        except Exception as e:
            last_err = str(e)
        time.sleep(RETRY_DELAY)

    return {
        "title": title or "Artículo",
        "source": src,
        "summary": f"No fue posible generar el resumen. Error: {last_err or 'desconocido'}",
    }

def summarize_url(
    url: str,
    user_type: str = "entusiasta",
    user_context: Optional[Dict] = None,
    max_chars: int = MAX_CHARS_DEFAULT,
) -> str:
    """
    Devuelve bloque de texto con:
    **Título del artículo:** ...
    **Fuente:** ...
    **Resumen:** ...
    """
    out = summarize_url_dict(url, user_type=user_type, user_context=user_context, max_chars=max_chars)
    return (
        f"**Título del artículo:** {out.get('title', 'Artículo')}\n"
        f"**Fuente:** {out.get('source', '(desconocido)')}\n"
        f"**Resumen:** {out.get('summary', '')}"
    )
