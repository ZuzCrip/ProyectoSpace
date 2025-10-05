// src/api/client.ts
export type APISearchResult = {
  id?: string | number;
  title: string;
  url: string;
  source?: string;
  summary?: string;
};

export async function apiSearch(query: string): Promise<APISearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  // Normaliza por si faltan campos
  return (Array.isArray(data) ? data : []).map((r, idx) => ({
    id: r.id ?? idx,
    title: r.title ?? "Sin título",
    url: r.url ?? r.link ?? "#",
    source: r.source ?? r.domain ?? undefined,
    summary: r.summary ?? undefined,
  }));
}
