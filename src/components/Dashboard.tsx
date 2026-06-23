"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Platform, Post } from "@/lib/types";
import DateGroup from "./DateGroup";

type Tab = "active" | "archive";
const PLATFORMS: Platform[] = ["Instagram", "LinkedIn", "X", "Newsletter"];

export default function Dashboard({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [tab, setTab] = useState<Tab>("active");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { posts: Post[] };
        setPosts(data.posts);
        setLastSync(new Date());
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh leve a cada 60s — reflete o que o n8n atualizar no Airtable.
  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const setStatusLocal = useCallback((id: string, post: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? post : p)));
  }, []);

  const patch = useCallback(
    async (id: string, status: "Posted" | "Ready") => {
      // atualização otimista
      const today = new Date().toISOString().slice(0, 10);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status, postedAt: status === "Posted" ? today : null }
            : p
        )
      );
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = (await res.json()) as { post: Post };
        setStatusLocal(id, data.post);
      } else {
        await refresh(); // reverte para o estado real em caso de erro
      }
    },
    [refresh, setStatusLocal]
  );

  const onMarkDone = useCallback((id: string) => patch(id, "Posted"), [patch]);
  const onReopen = useCallback((id: string) => patch(id, "Ready"), [patch]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const inTab = tab === "archive" ? p.status === "Posted" : p.status !== "Posted";
      const inPlatform = platform === "all" || p.platform === platform;
      return inTab && inPlatform;
    });
  }, [posts, tab, platform]);

  const grouped = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of filtered) {
      const key = p.date ?? "__none__";
      (map.get(key) ?? map.set(key, []).get(key)!).push(p);
    }
    // arquivo: mais recente primeiro; ativos: mais próximo primeiro
    const keys = [...map.keys()].sort((a, b) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return tab === "archive" ? b.localeCompare(a) : a.localeCompare(b);
    });
    return keys.map((k) => ({ date: k === "__none__" ? null : k, items: map.get(k)! }));
  }, [filtered, tab]);

  const activeCount = posts.filter((p) => p.status !== "Posted").length;
  const archiveCount = posts.filter((p) => p.status === "Posted").length;

  return (
    <div>
      {/* Abas + ações */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-card border-[0.5px] border-white/12 p-1">
          <TabButton active={tab === "active"} onClick={() => setTab("active")}>
            Ativos <Count>{activeCount}</Count>
          </TabButton>
          <TabButton active={tab === "archive"} onClick={() => setTab("archive")}>
            Arquivo <Count>{archiveCount}</Count>
          </TabButton>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-midgray">
            Sincronizado {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="rounded-tag border-[0.5px] border-white/15 px-3 py-1.5 text-xs font-medium text-offwhite transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-50"
          >
            {refreshing ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
      </div>

      {/* Filtro de plataforma */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <FilterChip active={platform === "all"} onClick={() => setPlatform("all")}>
          Todas
        </FilterChip>
        {PLATFORMS.map((pf) => (
          <FilterChip key={pf} active={platform === pf} onClick={() => setPlatform(pf)}>
            {pf}
          </FilterChip>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-card border-[0.5px] border-white/12 bg-graphite p-10 text-center text-sm text-midgray">
          {tab === "archive"
            ? "Nada publicado ainda. O que você marcar como feito aparece aqui."
            : "Nenhum post pendente com esse filtro. 🎉"}
        </div>
      ) : (
        grouped.map((g) => (
          <DateGroup
            key={g.date ?? "none"}
            date={g.date}
            posts={g.items}
            onMarkDone={onMarkDone}
            onReopen={onReopen}
          />
        ))
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[8px] px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-amber text-ink" : "text-midgray hover:text-offwhite"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="ml-1 text-xs opacity-70">{children}</span>;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-tag border-[0.5px] px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-amber bg-amber/10 text-amber"
          : "border-white/12 text-midgray hover:border-white/30 hover:text-offwhite"
      }`}
    >
      {children}
    </button>
  );
}
