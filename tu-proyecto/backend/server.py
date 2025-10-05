# backend/server.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import os, csv, re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- CSV
BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "data", "publications.csv")

FALLBACK_DATA: List[Dict] = [
    {"id": 1, "title": "Efectos de la microgravedad en células madre", "url": "https://ejemplo.test/microgravedad-celulas", "source": "ejemplo.test"},
    {"id": 2, "title": "Microbioma de astronautas en la ISS", "url": "https://ejemplo.test/microbioma-iss", "source": "ejemplo.test"},
]

def load_csv_or_fallback() -> List[Dict]:
    data: List[Dict] = []
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader):
                    title = (row.get("title") or row.get("Title") or "").strip()
                    url = (row.get("url") or row.get("link") or row.get("URL") or "").strip()
                    source = (row.get("source") or row.get("domain") or "").strip() or None
                    if title and url:
                        data.append({"id": i+1, "title": title, "url": url, "source": source})
        except Exception:
            data = FALLBACK_DATA
    else:
        data = FALLBACK_DATA
    return data

DATA = load_csv_or_fallback()

def score_match(title: str, terms: List[str]) -> int:
    t = title.lower()
    s = 0
    for w in terms:
        if w in t: s += 2
        if re.search(rf"\b{re.escape(w)}\b", t): s += 3
    if terms and t.startswith(terms[0]): s += 3
    return s

@app.get("/api/health")
def health():
    return {"ok": True, "count": len(DATA)}

@app.get("/api/search")
def search(q: str = Query("", min_length=0)):
    q = (q or "").strip().lower()
    if not q:
        return []
    terms = [w for w in q.split() if w]
    results = [item for item in DATA if all(w in (item["title"] or "").lower() for w in terms)]
    results.sort(key=lambda it: score_match(it["title"], terms), reverse=True)
    return results

# /api/summarize (si tienes backend/summary.py con summarize_url_dict)
try:
    from summary import summarize_url_dict
    @app.get("/api/summarize")
    def summarize(url: str = Query(...)):
        return summarize_url_dict(url)
except Exception:
    pass
