import type { Status } from "@/lib/types";

const STYLES: Record<Status, string> = {
  Draft: "border-white/15 text-midgray",
  Ready: "border-amber/60 text-amber",
  Scheduled: "border-sky-400/50 text-sky-300",
  Posted: "border-emerald-400/50 text-emerald-300",
};

const LABELS: Record<Status, string> = {
  Draft: "Rascunho",
  Ready: "Pronto",
  Scheduled: "Agendado",
  Posted: "Publicado",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-tag border-[0.5px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
