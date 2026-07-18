import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const toc = [
  { id: "introduction", label: "1. Introduction" },
  { id: "general", label: "2. General principles" },
  { id: "live", label: "3. Live online courses" },
  { id: "recorded", label: "4. Recorded courses" },
  { id: "digital", label: "5. Digital products" },
  { id: "mentorship", label: "6. Mentorship programmes" },
  { id: "subscriptions", label: "7. Subscriptions" },
  { id: "books", label: "8. Books & physical products" },
  { id: "promotional", label: "9. Promotional offers" },
  { id: "transfer", label: "10. Transfer of enrolment" },
  { id: "change", label: "11. Change of course" },
  { id: "cancellation", label: "12. Cancellation by TLP" },
  { id: "norefund", label: "13. No-Refund Circumstances" },
  { id: "exceptional", label: "14. Exceptional circumstances" },
  { id: "procedure", label: "15. Refund Procedure" },
  { id: "contact", label: "16. Contact" },
  { id: "amendments", label: "17. Policy amendments" },
];

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

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4 pl-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-sm text-amber-800 mb-4 leading-relaxed">
      {children}
    </div>
  );
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 dark:bg-gray-800 pt-28 pb-10 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Refund & cancellation policy</h1>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400 mt-3">
            <span><span className="font-medium text-gray-700 dark:text-gray-300">Effective Date:</span> ____________</span>
            <span><span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span> ____________</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sticky TOC */}
          <aside className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Contents</p>
              <nav className="space-y-0.5">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded px-2 py-1 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0 max-w-3xl">

            <H2 id="introduction">1. Introduction</H2>
            <P>At The Law Project, we are committed to providing quality legal education through live classes, recorded courses, mentorship programmes, subscriptions, books, test series, workshops and other learning resources.</P>
            <P>Since many of our Services involve immediate allocation of faculty time, digital access, intellectual property and educational resources, this Refund & Cancellation Policy governs every request relating to cancellation, withdrawal, refund, transfer or modification of enrolments.</P>
            <P>By enrolling in any Course or purchasing any Product or Service, you acknowledge that you have read, understood and agreed to this Policy.</P>

            <H2 id="general">2. General principles</H2>
            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-semibold text-gray-800 dark:text-gray-200">2.1</span> Every refund request shall be considered strictly in accordance with this Policy.</p>
              <p><span className="font-semibold text-gray-800 dark:text-gray-200">2.2</span> Refunds shall not be granted merely because a User changes his or her mind after enrolment.</p>
              <p><span className="font-semibold text-gray-800 dark:text-gray-200">2.3</span> Refunds, wherever applicable, shall ordinarily be processed through the original mode of payment.</p>
              <p><span className="font-semibold text-gray-800 dark:text-gray-200">2.4</span> The Law Project reserves the right to verify the identity of the applicant before processing any refund.</p>
              <p><span className="font-semibold text-gray-800 dark:text-gray-200">2.5</span> Any approved refund may take up to <strong>15 business days</strong> to be processed, subject to banking and payment gateway timelines.</p>
            </div>

            <H2 id="live">3. Live online courses</H2>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Before Commencement</p>
            <P>Unless otherwise specified on the relevant Course page, a student may request cancellation before the commencement of the Course. If approved, the following deductions may apply:</P>
            <Ul items={["Administrative Charges", "Payment Gateway Charges", "Taxes, where applicable"]} />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">After Commencement</p>
            <InfoBox>
              Once the first live class has commenced, refunds shall ordinarily not be granted. This is because academic resources, faculty allocation, study plans and classroom seats are committed upon commencement of the Course.
            </InfoBox>

            <H2 id="recorded">4. Recorded courses</H2>
            <P>Recorded Courses are digital educational products. Upon successful payment and grant of access, the User receives immediate access to proprietary educational content. Accordingly:</P>
            <Ul items={["Recorded Courses are non-refundable.", "Recorded Courses are non-transferable.", "Recorded Courses are non-exchangeable."]} />
            <P>This policy applies irrespective of the extent to which the User has viewed the Course.</P>

            <H2 id="digital">5. Digital products</H2>
            <P>The following digital products are non-refundable once access has been granted:</P>
            <Ul items={["Digital Books", "PDFs", "Notes", "Question Banks", "Mock Tests", "Test Series", "Digital Libraries", "Current Affairs Compendiums", "Study Material", "Practice Sheets", "Downloadable Resources", "AI Learning Resources"]} />

            <H2 id="mentorship">6. Mentorship programmes</H2>
            <P>Mentorship involves advance allocation of mentor time and academic planning. Accordingly, mentorship fees are ordinarily non-refundable after confirmation of enrolment.</P>
            <P>Where mentorship has not commenced, requests may be considered solely at the discretion of The Law Project.</P>

            <H2 id="subscriptions">7. Subscriptions</H2>
            <P>Subscription plans are non-refundable after activation. Cancellation of a subscription shall terminate future renewals, if any, but shall not ordinarily entitle the User to a refund for the unused portion of the subscription period.</P>

            <H2 id="books">8. Books & physical products</H2>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Damaged or Incorrect Delivery</p>
            <P>Where a physical book or product is delivered in a damaged condition or an incorrect item is supplied, the User shall notify The Law Project within <strong>seven (7) days</strong> of delivery. Upon verification, The Law Project may replace the product or issue a refund, where replacement is not reasonably possible.</P>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Non-Delivery</p>
            <P>Where a shipment is lost due to reasons attributable to The Law Project or its logistics partner, a replacement or refund may be offered.</P>

            <H2 id="promotional">9. Promotional offers</H2>
            <P>Admissions secured under launch offers, scholarship programmes, promotional discounts, coupon codes, referral benefits, or special campaigns shall be governed by the specific terms of the relevant offer. Unless expressly stated otherwise, such admissions shall be non-refundable.</P>

            <H2 id="transfer">10. Transfer of enrolment</H2>
            <P>Course enrolments are personal. Requests to transfer admission to another individual shall ordinarily not be entertained. In exceptional circumstances, The Law Project may consider such requests at its sole discretion.</P>

            <H2 id="change">11. Change of course</H2>
            <P>Requests to migrate from one Course to another may be considered where seats are available, academic compatibility exists, and applicable fee differences are paid. Approval shall remain entirely at the discretion of The Law Project.</P>

            <H2 id="cancellation">12. Cancellation by The Law Project</H2>
            <P>Where a Course is cancelled by The Law Project before commencement for reasons solely attributable to the Platform, affected Users may be offered:</P>
            <Ul items={["A full refund; or", "Transfer to another batch; or", "Transfer to another Course of equivalent value."]} />
            <P>The choice of remedy shall ordinarily be determined in consultation with the User.</P>

            <H2 id="norefund">13. Circumstances where refunds shall not be granted</H2>
            <P>Refunds shall ordinarily not be granted where:</P>
            <Ul items={["The User has accessed a Recorded Course;", "Live classes have commenced;", "The User discontinues preparation voluntarily;", "Examination dates change;", "Examination patterns change;", "Faculty allocation changes;", "Schedules are modified reasonably;", "Internet connectivity issues occur at the User's end;", "The User is unable to attend classes due to personal reasons;", "The User is expelled for violating the Terms of Use;", "The User shares login credentials;", "Piracy or copyright infringement is detected."]} />

            <H2 id="exceptional">14. Exceptional circumstances</H2>
            <P>Nothing contained in this Policy shall prevent The Law Project from granting a refund, credit, extension or other appropriate relief in deserving cases. Such decisions shall be entirely discretionary and shall not constitute a precedent for future cases.</P>

            <H2 id="procedure">15. Refund request procedure</H2>
            <P>Users seeking a refund shall submit a written request containing:</P>
            <Ul items={["Full Name", "Registered Email Address", "Contact Number", "Course Name", "Date of Enrolment", "Payment Details", "Reason for Refund"]} />
            <P>The Law Project may seek additional documents where necessary.</P>

            <H2 id="contact">16. Contact</H2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">The Law Project</p>
              <p>Email: __________________</p>
              <p>Website: __________________</p>
              <p>Phone: __________________</p>
            </div>

            <H2 id="amendments">17. Policy amendments</H2>
            <P>The Law Project reserves the right to modify this Refund & Cancellation Policy from time to time. The revised Policy shall become effective upon publication on the Platform. Continued use of the Platform shall constitute acceptance of the revised Policy.</P>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-6 py-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  By enrolling in any Course or purchasing any Product or Service offered by The Law Project, the User confirms that he or she has read, understood and agreed to be bound by this Refund & Cancellation Policy.
                </p>
                <p className="text-xs text-gray-500 mt-4">© The Law Project. All Rights Reserved.</p>
              </div>
            </div>

          </article>
        </div>
      </div>

      <Footer />
    </main>
  );
}
