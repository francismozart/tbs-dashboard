"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import CopyButton from "./CopyButton";
import StatusBadge from "./StatusBadge";

export default function PostCard({
  post,
  onMarkDone,
  onReopen,
}: {
  post: Post;
  onMarkDone: (id: string) => Promise<void>;
  onReopen: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const isPosted = post.status === "Posted";

  async function toggle() {
    setBusy(true);
    try {
      if (isPosted) await onReopen(post.id);
      else await onMarkDone(post.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-card border-[0.5px] border-white/12 bg-graphite p-4 transition-colors hover:border-white/25">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {post.platform && <Tag>{post.platform}</Tag>}
            {post.format && <Tag muted>{post.format}</Tag>}
            <StatusBadge status={post.status} />
          </div>
          <h3 className="truncate text-base font-medium tracking-tightish text-offwhite">
            {post.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`shrink-0 rounded-tag border-[0.5px] px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            isPosted
              ? "border-white/15 text-midgray hover:border-white/40 hover:text-offwhite"
              : "border-emerald-400/50 text-emerald-300 hover:bg-emerald-400 hover:text-ink"
          }`}
        >
          {busy ? "…" : isPosted ? "Reabrir" : "Marcar feito"}
        </button>
      </div>

      {post.hooks.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-midgray">
            Hooks
          </p>
          <ul className="space-y-1.5">
            {post.hooks.map((hook, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 rounded-tag bg-ink/60 px-2.5 py-1.5"
              >
                <span className="text-sm text-offwhite/90">{hook}</span>
                <CopyButton text={hook} label="Copiar" className="shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.content && (
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-midgray">
              Conteúdo
            </p>
            <CopyButton text={post.content} label="Copiar conteúdo" />
          </div>
          <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-tag bg-ink/60 p-3 font-sans text-sm leading-relaxed text-offwhite/90">
            {post.content}
          </pre>
        </div>
      )}

      {post.imagePrompt && (
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-midgray">
              Prompt de imagem
            </p>
            <CopyButton text={post.imagePrompt} label="Copiar prompt" />
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-tag border-[0.5px] border-amber/25 bg-ink/60 p-3 font-sans text-sm leading-relaxed text-amber/90">
            {post.imagePrompt}
          </pre>
        </div>
      )}

      {(post.link || post.notes || post.postedAt) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-[0.5px] border-white/10 pt-2.5 text-xs text-midgray">
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber hover:underline"
            >
              Abrir link ↗
            </a>
          )}
          {post.postedAt && <span>Publicado em {post.postedAt}</span>}
          {post.notes && <span className="truncate">📝 {post.notes}</span>}
        </div>
      )}
    </article>
  );
}

function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`rounded-tag border-[0.5px] px-2 py-0.5 text-[11px] font-medium ${
        muted ? "border-white/12 text-midgray" : "border-amber/50 text-amber"
      }`}
    >
      {children}
    </span>
  );
}
