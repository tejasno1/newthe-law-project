import { supabaseService } from "@/lib/supabase/service";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar_url: string | null;
  rating: number;
  body: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export async function getAllPublishedTestimonials(): Promise<Testimonial[]> {
  const { data } = await supabaseService
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Testimonial[];
}

export async function getAllTestimonialsAdmin(): Promise<Testimonial[]> {
  const { data } = await supabaseService
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Testimonial[];
}
