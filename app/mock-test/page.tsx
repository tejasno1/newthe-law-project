import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MockTestCatalog from "@/components/MockTestCatalog";
import { getAllMockTests } from "@/lib/mockTests";

export default async function MockTestPage() {
  const tests = await getAllMockTests();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <section className="pt-28 sm:pt-24 pb-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Practice tests</h1>
            <p className="text-gray-500 dark:text-gray-400">
              From law entrance preparation to professional legal development, attempt full-length and sectional practice tests under real exam conditions and get a detailed performance report.
            </p>
          </div>

          <MockTestCatalog tests={tests} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
