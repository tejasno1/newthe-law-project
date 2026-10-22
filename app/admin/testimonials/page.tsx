import { getAllTestimonialsAdmin } from "@/lib/testimonials";
import TestimonialsAdminClient from "./TestimonialsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Testimonials</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Add, edit, and publish student testimonials shown on the homepage.
        </p>
      </div>
      <TestimonialsAdminClient testimonials={testimonials} />
    </>
  );
}
