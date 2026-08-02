import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MockTestCatalog from "@/components/MockTestCatalog";
import PageHeroBanner from "@/components/PageHeroBanner";
import { getAllMockTests } from "@/lib/mockTests";

export const revalidate = 300;

export default async function MockTestPage() {
  const tests = await getAllMockTests();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <PageHeroBanner
        title="Practice Tests"
        subtitle="Build confidence with exam-style mock tests designed to strengthen your preparation and improve your performance."
        variant="tests"
      />

      <section className="pt-8 pb-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MockTestCatalog tests={tests} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
