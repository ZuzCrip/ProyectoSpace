// src/pages/WelcomePageES.tsx
import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiSearch, APISearchResult } from "@/api/client";

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

interface Props {
  onSearch?: (query: string) => void;
  userData: UserData;
  onBack?: () => void;
}

export default function WelcomePageES({ onSearch, userData, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<APISearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const baseSuggestions = ["microgravedad","biología espacial","radiación y células","cultivo de plantas","microbioma en órbita"];
  const interestSuggestions: Record<string,string[]> = {
    "Microgravedad y células": ["efectos microgravedad", "células en gravedad cero"],
    "Biología de plantas espaciales": ["agricultura espacial", "plantas ISS"],
  };
  const suggestions = useMemo(() => {
    const p = new Set(baseSuggestions);
    userData.interests.forEach(i => (interestSuggestions[i]||[]).forEach(s => p.add(s)));
    return Array.from(p).slice(0,6);
  }, [userData.interests]);

  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean).slice(0,6), [query]);
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlight = (text: string) => {
    if (!terms.length) return text;
    const pattern = new RegExp(`(${terms.map(t=>escapeRegExp(t)).join("|")})`,"ig");
    const parts = text.split(pattern);
    return (
      <>
        {parts.map((p, i) => pattern.test(p) ? <mark key={i} className="bg-emerald-200 rounded px-1">{p}</mark> : <span key={i}>{p}</span>)}
      </>
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(null);
    try {
      const data = await apiSearch(q);
      // ranking sencillo por coincidencia en título
      const qLower = q.toLowerCase();
      const score = (t:string) => {
        const w = qLower.split(/\s+/).filter(Boolean);
        let s=0; const T = t.toLowerCase();
        for (const x of w) {
          if (T.includes(x)) s+=2;
          if (new RegExp(`\\b${escapeRegExp(x)}\\b`,"i").test(T)) s+=3;
        }
        if (w[0] && T.startsWith(w[0])) s+=3;
        return s;
      };
      setResults([...data].sort((a,b)=>score(a.title)-score(b.title)).reverse());
      onSearch?.(q);
    } catch (err:any) {
      setError(err?.message || "Ocurrió un error al buscar.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(s: string) {
    setQuery(s);
    inputRef.current?.focus();
  }

  function openArticle(r: APISearchResult) {
    const url = `/article?url=${encodeURIComponent(r.url)}&title=${encodeURIComponent(r.title)}`;
    navigate(url);
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">NASA BioSpace</h1>
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl">
        <input
          ref={inputRef}
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Buscar por título…"
          className="flex-1 p-3 rounded border"
        />
        <button className="px-5 py-2 rounded bg-black text-white" type="submit">Buscar</button>
      </form>

      {suggestions.length>0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s,i)=>(
            <button key={i} onClick={()=>handleSuggestionClick(s)} className="px-3 py-1 text-sm bg-emerald-100 rounded-full">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading && <div>Buscando…</div>}
        {error && <div className="text-red-600">⚠ {error}</div>}
        {!loading && !error && results.length>0 && (
          <ul className="divide-y">
            {results.map((r, idx)=>(
              <li key={r.id ?? idx} className="py-3">
                <button onClick={()=>openArticle(r)} className="text-left font-semibold hover:underline">
                  {highlight(r.title)}
                </button>
                <div className="text-xs text-gray-600">{r.source || new URL(r.url).hostname}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
