import { NextRequest, NextResponse } from "next/server";
import { getProgramme } from "@/lib/programmes";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const prog = await getProgramme(params.slug);
  if (!prog) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(prog);
}
