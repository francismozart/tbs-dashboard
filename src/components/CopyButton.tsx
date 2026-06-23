"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copiar",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback para contextos sem clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-tag border-[0.5px] px-2.5 py-1 text-xs font-medium transition-colors ${
        copied
          ? "border-amber bg-amber text-ink"
          : "border-white/15 text-offwhite hover:border-amber/60 hover:text-amber"
      } ${className}`}
      aria-live="polite"
    >
      {copied ? "Copiado!" : label}
    </button>
  );
}
