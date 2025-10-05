// src/pages/ArticlePage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiSummarize } from "@/api/client";

export default function ArticlePage() {
  const [sp] = useSearchParams();
  const url = sp.get("url") || "";
  const title = sp.get("title") || "Artículo";
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [summary, setSummary] = useState<string>("");

  useEffect(()=>{
    let mounted = true;
    async function run(){
      setLoading(true); setErr(null);
      try {
        const data = await apiSummarize(url);
        if (mounted) setSummary((data?.summary || "").replace(/\n/g, "<br/>"));
      } catch(e:any){
        if (mounted) setErr(e?.message || "Error al resumir.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (url) run();
    return ()=>{ mounted = false; }
  }, [url]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mb-4">
        <Link to="/" className="text-sm underline">← Volver</Link>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="text-sm text-gray-600 mb-4">
        Fuente original: <a href={url} target="_blank" rel="noreferrer" className="underline">{url}</a>
      </div>
      {loading && <div>Generando resumen…</div>}
      {err && <div className="text-red-600">⚠ {err}</div>}
      {!loading && !err && (
        <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: summary || "No se pudo generar el resumen." }} />
      )}
    </div>
  );
}
