import { NextRequest, NextResponse } from "next/server";
import { updateStatus } from "@/lib/airtable";
import { STATUSES, type Status } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { status?: string };
    const status = body.status as Status;
    if (!status || !STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status inválido. Use um de: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    const post = await updateStatus(id, status);
    return NextResponse.json({ post });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
