import { NextResponse } from "next/server";
import { getAllPublishedTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await getAllPublishedTestimonials();
  return NextResponse.json(testimonials);
}
