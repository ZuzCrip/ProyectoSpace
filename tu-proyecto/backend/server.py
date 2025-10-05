# backend/server.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse
from typing import List, Dict
import os, csv, re

app = FastAPI()  # 👈👈 IMPORTANTE: variable "app" a nivel de módulo

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "data", os.getenv("CSV_FILE", "SB_publication_PMC.csv"))

def _first_nonempty(d: dict, keys: list[str]) -> str:
    for k in keys:
        v = d.get(k)
        if v is not None:
            v = v.strip()
            if v:
                return v
    return ""

def _domain(u: str) -> str | None:
    try:
        return urlparse(u).netloc or None
    except:
        return None

def load_csv_or_fallback() -> List[Dict]:
    data: List[Dict] = []
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader):
                    title = _first_nonempty(row, ["title","Title"])
                    url   = _first_nonempty(row, ["url","URL","Url","link","Link","HREF","Href"])
                    if not title or not url:
                        continue
                    source = _first_nonempty(row, ["source","Source","domain","Domain"]) or _domain(url)
                    data.append({"id": i+1, "title": title, "url": url, "source": source})
        except Exception as e:
            print("[CSV] Error leyendo CSV:", e)
    if not data:
        data = [
            {"id": 1, "title": "Fila de ejemplo", "url": "https://example.org/a", "source": "example.org"},
        ]
    return data

DATA = load_csv_or_fallback()

def score_match(title: str, terms: List[str]) -> int:
    t = (title or "").lower()
    s = 0
    for w in terms:
        if w in t: s += 2
        if re.search(rf"\b{re.escape(w)}\b", t): s += 3
    if terms and t.startswith(terms[0]): s += 3
    return s

@app.get("/api/health")
def health():
    return {"ok": True, "count": len(DATA), "csv": os.path.basename(CSV_PATH)}

@app.get("/api/search")
def search(q: str = Query("", min_length=0)):
    q = (q or "").strip().lower()
    if not q:
        return []
    terms = [w for w in q.split() if w]
    results = [item for item in DATA if all(w in (item["title"] or "").lower() for w in terms)]
    results.sort(key=lambda it: score_match(it["title"], terms), reverse=True)
    return results

# /api/summarize (si tienes summary.py)
try:
    from summary import summarize_url_dict

    @app.get("/api/summarize")
    def summarize(url: str = Query(...)):
        if not url.lower().startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="URL inválida")
        try:
            return summarize_url_dict(url)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"No se pudo resumir la URL: {e}")
except Exception as e:
    print("[summary] Endpoint de resumen desactivado:", e)
