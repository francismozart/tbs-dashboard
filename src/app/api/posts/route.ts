import { NextResponse } from "next/server";
import { listPosts } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await listPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
