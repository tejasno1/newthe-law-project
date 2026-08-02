import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-bold text-gray-900 dark:text-white mt-10 mb-3 scroll-mt-28 border-b border-gray-100 dark:border-gray-700 pb-2">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{children}</p>;
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 dark:bg-gray-800 pt-28 pb-10 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Refund & Cancellation Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last Updated: 21 July 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="space-y-2">

          <P>At The Law Project, we are committed to delivering our services with quality and transparency. Please read this policy carefully before making a payment.</P>

          <H2 id="all-sales-final">All Sales Are Final</H2>
          <P>All payments made for our services are final and non-refundable. Once a payment is completed, we do not offer refunds under any circumstances, except as required by applicable law.</P>

          <H2 id="non-cancellable">Non-Cancellable Services</H2>
          <P>Our services are non-cancellable once an order or payment has been confirmed. We encourage customers to review all service details carefully before making a payment.</P>

          <H2 id="failed-transactions">Failed or Duplicate Transactions</H2>
          <P>In the rare event of a duplicate payment or a transaction that was charged but where the service was not activated due to a technical error, please contact us within <strong className="text-gray-800 dark:text-gray-200">7 days</strong>. Verified duplicate or erroneous charges will be reversed to your original payment method within <strong className="text-gray-800 dark:text-gray-200">7–10 business days</strong>.</P>

          <H2 id="contact">How to Contact Us</H2>
          <P>For any questions regarding this policy, please reach out:</P>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">The Law Project</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Email:</span> thelawproject.in@gmail.com</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span> +91 99502 36296</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Address:</span> G-6, Ground Floor, Lily Mangalam, Mangalam Anand Appartment, Sanganer Muhana, Jaipur, Rajasthan, India</p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-6 py-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                By completing a payment, you acknowledge that you have read, understood, and agreed to this Refund & Cancellation Policy.
              </p>
              <p className="text-xs text-gray-500 mt-4">© The Law Project. All Rights Reserved.</p>
            </div>
          </div>

        </article>
      </div>

      <Footer />
    </main>
  );
}
