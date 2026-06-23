import Dashboard from "@/components/Dashboard";
import { listPosts } from "@/lib/airtable";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let posts: Post[] = [];
  let error: string | null = null;
  try {
    posts = await listPosts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro ao carregar o Airtable.";
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold tracking-tightish">The Brevio Sync</h1>
            <p className="text-sm text-midgray">Content Dashboard</p>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-card border-[0.5px] border-amber/40 bg-graphite p-6 text-sm">
          <p className="mb-1 font-medium text-amber">Não foi possível carregar os posts.</p>
          <p className="text-midgray">{error}</p>
        </div>
      ) : (
        <Dashboard initialPosts={posts} />
      )}
    </main>
  );
}

function BrandMark() {
  // "O Filtro" — 3 barras que afunilam + gota âmbar.
  return (
    <div className="flex h-11 w-11 flex-col items-center justify-center gap-[3px] rounded-[10px] bg-ink">
      <span className="h-[3px] w-[26px] rounded-full bg-amber" />
      <span className="h-[3px] w-[19px] rounded-full bg-amber/75" />
      <span className="h-[3px] w-[12px] rounded-full bg-amber/50" />
    </div>
  );
}
