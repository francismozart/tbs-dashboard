"use client";

import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

function formatDate(iso: string | null): string {
  if (!iso) return "Sem data";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function DateGroup({
  date,
  posts,
  onMarkDone,
  onReopen,
}: {
  date: string | null;
  posts: Post[];
  onMarkDone: (id: string) => Promise<void>;
  onReopen: (id: string) => Promise<void>;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-amber">
          {formatDate(date)}
        </h2>
        <span className="text-xs text-midgray">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onMarkDone={onMarkDone}
            onReopen={onReopen}
          />
        ))}
      </div>
    </section>
  );
}
