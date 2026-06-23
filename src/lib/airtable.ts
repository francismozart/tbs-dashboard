import "server-only";
import type { Post, Status } from "./types";

const API = "https://api.airtable.com/v0";

function config() {
  const key = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Posts";
  if (!key || !baseId) {
    throw new Error(
      "Airtable não configurado. Defina AIRTABLE_API_KEY e AIRTABLE_BASE_ID em .env.local (ou nas env vars da Vercel)."
    );
  }
  return { key, baseId, table };
}

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function mapRecord(r: AirtableRecord): Post {
  const f = r.fields;
  const hooksRaw = str(f["Hooks"]);
  return {
    id: r.id,
    title: str(f["Title"]) || "(sem título)",
    date: (f["Date"] as string) ?? null,
    platform: (f["Platform"] as Post["platform"]) ?? null,
    format: (f["Format"] as Post["format"]) ?? null,
    hooks: hooksRaw
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean),
    content: str(f["Content"]),
    imagePrompt: str(f["Image Prompt"]),
    status: ((f["Status"] as Status) ?? "Draft"),
    link: (f["Link"] as string) || null,
    notes: str(f["Notes"]),
    postedAt: (f["Posted At"] as string) ?? null,
  };
}

/** Lista todos os posts, ordenados por Date crescente (próximo a postar no topo). */
export async function listPosts(): Promise<Post[]> {
  const { key, baseId, table } = config();
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${API}/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable list falhou (${res.status}): ${body}`);
    }
    const data = (await res.json()) as { records: AirtableRecord[]; offset?: string };
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  const posts = records.map(mapRecord);
  posts.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // sem data vai pro fim
    if (!b.date) return -1;
    return a.date.localeCompare(b.date); // crescente: mais próximo primeiro
  });
  return posts;
}

/** Atualiza o status de um post. Ao virar "Posted", carimba Posted At; ao reabrir, limpa. */
export async function updateStatus(id: string, status: Status): Promise<Post> {
  const { key, baseId, table } = config();
  const fields: Record<string, unknown> = { Status: status };
  fields["Posted At"] = status === "Posted" ? new Date().toISOString().slice(0, 10) : null;

  const res = await fetch(`${API}/${baseId}/${encodeURIComponent(table)}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable update falhou (${res.status}): ${body}`);
  }
  return mapRecord((await res.json()) as AirtableRecord);
}
