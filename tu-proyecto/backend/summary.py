from openai import OpenAI
import os, time, re, io
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import trafilatura

load_dotenv()
API_KEY = os.getenv("API_KEY")
client = OpenAI(api_key=API_KEY, base_url="https://openrouter.ai/api/v1")
model = "google/gemini-2.0-flash-exp:free"

SYSTEM_CONTENT = (
    "Eres una IA especializada en resumir artículos web. "
    "Explica ideas principales y secundarias, hechos, datos y conclusiones, en lenguaje claro. "
    "Si el artículo es técnico/científico, simplifica conceptos. "
    "Formato de salida:\n"
    "**Título del artículo:** [extraído del input o inferido]\n"
    "**Fuente:** [link o dominio del artículo]\n"
    "**Resumen:** [párrafos claros, bien estructurados]"
)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)

def is_pdf_url(url: str) -> bool:
    # Detecta por extensión o cabecera más adelante
    return url.lower().split("?")[0].endswith(".pdf")

def domain_of(url: str) -> str:
    try:
        return urlparse(url).netloc or "(desconocido)"
    except:
        return "(desconocido)"

def fetch_html(url: str) -> str:
    r = requests.get(url, headers={"User-Agent": UA}, timeout=20)
    r.raise_for_status()
    return r.text

def fetch_pdf_text(url: str) -> str:
    r = requests.get(url, headers={"User-Agent": UA}, timeout=30)
    r.raise_for_status()
    bio = io.BytesIO(r.content)
    reader = PdfReader(bio)
    pages = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n".join(pages)

def extract_text_from_url(url: str) -> tuple[str, str, str]:
    """
    Devuelve (titulo, fuente, texto).
    Usa trafilatura para HTML y PyPDF2 para PDF.
    """
    src = domain_of(url)

    # Intento 1: si es PDF directo
    if is_pdf_url(url):
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Artículo (PDF)"
        return title, src, pdf_text

    # Intento 2: HTML con verificación de Content-Type
    r = requests.get(url, headers={"User-Agent": UA}, timeout=20)
    r.raise_for_status()
    ctype = r.headers.get("Content-Type", "")
    if "pdf" in ctype.lower():
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Artículo (PDF)"
        return title, src, pdf_text

    html = r.text

    # Trafilatura: mejor que BeautifulSoup para artículo principal
    downloaded = trafilatura.extract(html, include_comments=False, favor_recall=True)
    if not downloaded or len(downloaded.strip()) < 300:
        # fallback: si vino vacío, intenta fetch_url+extract de trafilatura
        fetched = trafilatura.fetch_url(url)
        downloaded = trafilatura.extract(fetched, include_comments=False, favor_recall=True) if fetched else None

    text = (downloaded or "").strip()
    # Título: intenta meta/og; trafilatura no siempre da título, lo inferimos simple
    title = infer_title_from_html(html) or "Artículo"

    return title, src, text

def infer_title_from_html(html: str) -> str | None:
    m = re.search(r"<title>(.*?)</title>", html, flags=re.I|re.S)
    if m:
        return clean_inline(m.group(1))
    # fallback simple a og:title
    m2 = re.search(r'property=["\']og:title["\']\s+content=["\'](.*?)["\']', html, flags=re.I|re.S)
    if m2:
        return clean_inline(m2.group(1))
    return None

def infer_title_from_text(text: str) -> str | None:
    # Heurística mínima: primera línea significativa (PDFs)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return None
    cand = lines[0]
    # Evita títulos absurdamente largos
    return cand[:140]

def clean_inline(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s

def summarize_url(url: str, max_chars: int = 12000) -> str:
    title, src, body = extract_text_from_url(url)

    if not body or len(body) < 200:
        return (
            f"**Título del artículo:** {title}\n"
            f"**Fuente:** {src}\n"
            f"**Resumen:** No fue posible extraer suficiente contenido del artículo."
        )

    # Recorta para no exceder límites del modelo (ajusta si tu modelo permite más)
    body = body[:max_chars]

    messages = [
        {"role": "system", "content": SYSTEM_CONTENT},
        {
            "role": "user",
            "content": (
                f"Título: {title}\n"
                f"Enlace: {url}\n"
                f"Fuente: {src}\n\n"
                f"Contenido del artículo:\n{body}"
            )
        }
    ]

    retry_delay = 2
    max_attempts = 4
    last_err = None

    for _ in range(max_attempts):
        try:
            chat = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3
            )
            content = chat.choices[0].message.content
            if content and content.strip():
                return content
        except Exception as e:
            last_err = str(e)
        time.sleep(retry_delay)

    return (
        f"**Título del artículo:** {title}\n"
        f"**Fuente:** {src}\n"
        f"**Resumen:** No fue posible generar el resumen. Error: {last_err or 'desconocido'}"
    )

# ---------- Ejemplo de uso ----------
# print(summarize_url("https://www.nasa.gov/ames/space-biosciences/space-biosciences-publications/"))

# --- NUEVO: util para devolver dict listo para el front ---
def summarize_url_dict(url: str, max_chars: int = 12000) -> dict:
    title, src, body = extract_text_from_url(url)
    if not body or len(body) < 200:
        return {"title": title or "Artículo", "source": src, "summary": "No fue posible extraer suficiente contenido del artículo."}

    body = body[:max_chars]
    messages = [
        {"role": "system", "content": SYSTEM_CONTENT},
        {"role": "user", "content": f"Título: {title}\nEnlace: {url}\nFuente: {src}\n\nContenido del artículo:\n{body}"}
    ]

    retry_delay = 2
    max_attempts = 4
    last_err = None
    for _ in range(max_attempts):
        try:
            chat = client.chat.completions.create(model=model, messages=messages, temperature=0.3)
            content = chat.choices[0].message.content
            if content and content.strip():
                return {"title": title or "Artículo", "source": src, "summary": content.strip()}
        except Exception as e:
            last_err = str(e)
        time.sleep(retry_delay)

    return {"title": title or "Artículo", "source": src, "summary": f"No fue posible generar el resumen. Error: {last_err or 'desconocido'}"}
