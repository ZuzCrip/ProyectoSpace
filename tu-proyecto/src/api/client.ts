// src/api/client.ts
export type APISearchResult = {
  id?: string | number;
  title: string;
  url: string;
  source?: string;
  summary?: string;
};

export async function apiSearch(query: string): Promise<APISearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((r: any, idx: number) => ({
    id: r.id ?? idx,
    title: r.title ?? "Sin título",
    url: r.url ?? r.link ?? "#",
    source: r.source ?? r.domain ?? undefined,
  }));
}

export async function apiSummarize(url: string): Promise<{title?:string; source?:string; summary:string}> {
  const res = await fetch(`/api/summarize?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
