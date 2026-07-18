import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const toc = [
  { id: "preamble", label: "Preamble" },
  { id: "definitions", label: "1. Definitions" },
  { id: "acceptance", label: "2. Acceptance of Terms" },
  { id: "eligibility", label: "3. Eligibility" },
  { id: "accounts", label: "4. User accounts" },
  { id: "nature", label: "5. Nature of services" },
  { id: "enrolment", label: "6. Course enrolment" },
  { id: "courses", label: "7. Nature of courses" },
  { id: "live", label: "8. Live classes" },
  { id: "recorded", label: "9. Recorded courses" },
  { id: "mentorship", label: "10. Mentorship programmes" },
  { id: "books", label: "11. Books & Publications" },
  { id: "digital", label: "12. Digital resources" },
  { id: "tests", label: "13. Test series" },
  { id: "content", label: "14. Educational content" },
  { id: "exams", label: "15. Examination pattern" },
  { id: "fees", label: "16. Course fees" },
  { id: "payment", label: "17. Payment terms" },
  { id: "offers", label: "18. Promotional Offers" },
  { id: "refund", label: "19. Refund & cancellation" },
  { id: "validity", label: "20. Course validity" },
  { id: "subscriptions", label: "21. Subscriptions" },
  { id: "access", label: "22. Course access" },
  { id: "sharing", label: "23. Account sharing" },
  { id: "technical", label: "24. Technical requirements" },
  { id: "availability", label: "25. Platform availability" },
  { id: "modify", label: "26. Right to modify courses" },
  { id: "results", label: "27. No guarantee of results" },
  { id: "ip", label: "28. Intellectual Property" },
  { id: "copyright", label: "29. Copyright policy" },
  { id: "piracy", label: "30. Anti-piracy policy" },
  { id: "ai", label: "31. AI usage policy" },
  { id: "conduct", label: "32. Student code of conduct" },
  { id: "community", label: "33. Community guidelines" },
  { id: "integrity", label: "34. Academic integrity" },
  { id: "recording", label: "35. Recording policy" },
  { id: "ugc", label: "36. User generated content" },
  { id: "testimonials", label: "37. Testimonials & publicity" },
  { id: "privacy", label: "38. Privacy" },
  { id: "communications", label: "39. Communications" },
  { id: "philosophy", label: "40. Educational philosophy" },
  { id: "disclaimer", label: "41. Disclaimer" },
  { id: "thirdparty", label: "42. Third-party services" },
  { id: "liability", label: "43. Limitation of liability" },
  { id: "indemnity", label: "44. Indemnity" },
  { id: "termination", label: "45. Suspension & termination" },
  { id: "forcemajeure", label: "46. Force majeure" },
  { id: "compliance", label: "47. Compliance with law" },
  { id: "defamation", label: "48. Defamation" },
  { id: "assignment", label: "49. Assignment" },
  { id: "waiver", label: "50. Waiver" },
  { id: "severability", label: "51. Severability" },
  { id: "amendments", label: "52. Amendments" },
  { id: "entireagreement", label: "53. Entire agreement" },
  { id: "governing", label: "54. Governing law" },
  { id: "dispute", label: "55. Dispute resolution" },
  { id: "arbitration", label: "56. Arbitration" },
  { id: "jurisdiction", label: "57. Jurisdiction" },
  { id: "contact", label: "58. Contact information" },
  { id: "ourphilosophy", label: "59. Our philosophy" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-bold text-gray-900 dark:text-white mt-10 mb-3 scroll-mt-28 border-b border-gray-100 dark:border-gray-700 pb-2">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3 text-sm">{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3 pl-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function Ol({ items }: { items: string[] }) {
  return (
    <ol className="list-[lower-alpha] list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3 pl-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 dark:bg-gray-800 pt-28 pb-10 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of use & service agreement</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated: [●] &nbsp;·&nbsp; Effective upon acceptance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
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

          {/* Main content */}
          <article className="flex-1 min-w-0 max-w-3xl">

            {/* Preamble */}
            <H2 id="preamble">Preamble</H2>
            <P>Welcome to The Law Project.</P>
            <P>The Law Project is a legal learning platform dedicated to providing quality legal education through live classes, recorded courses, mentorship programmes, digital learning resources, books, test series, workshops, webinars, subscriptions, publications, and other educational services.</P>
            <P>Our objective is to make legal education more accessible, personalised and practical for every learner. We strive to support students before, during and after law school through a combination of academic excellence, professional mentorship and innovative learning methods.</P>
            <P>These Terms of Use & Service Agreement ("Terms") govern your access to and use of The Law Project, including its website, mobile application(s) (if launched), learning management system, student dashboard, digital platforms, communication channels, educational resources and every present or future service offered under the brand "The Law Project."</P>
            <P>These Terms constitute a legally binding agreement between you and The Law Project. By accessing, browsing, registering on, purchasing from, subscribing to or otherwise using any part of the Platform, you acknowledge that you have carefully read, understood and agreed to be bound by these Terms.</P>
            <P>If you do not agree with these Terms, you must immediately discontinue the use of the Platform and all services offered by The Law Project.</P>

            {/* 1 */}
            <H2 id="definitions">1. Definitions</H2>
            <P>Unless the context otherwise requires, the following expressions shall have the meanings assigned below:</P>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p><strong className="text-gray-900 dark:text-white">1.1 "The Law Project", "TLP", "Company", "Platform", "we", "our" or "us"</strong><br />means The Law Project together with its proprietors, founders, directors (where applicable), officers, employees, faculty members, mentors, consultants, representatives, affiliates, authorised partners, successors and assigns.</p>
              <p><strong className="text-gray-900 dark:text-white">1.2 "Website"</strong><br />means every website, sub-domain, landing page, microsite or online portal operated by or on behalf of The Law Project.</p>
              <p><strong className="text-gray-900 dark:text-white">1.3 "Platform"</strong><br />means the complete digital ecosystem operated by The Law Project, including without limitation its website, student portal, Learning Management System (LMS), mobile applications, communication channels, software, online classrooms and future technological platforms.</p>
              <p><strong className="text-gray-900 dark:text-white">1.4 "User"</strong><br />means every individual who visits, browses, registers, purchases, subscribes to, accesses or otherwise uses any part of the Platform.</p>
              <p><strong className="text-gray-900 dark:text-white">1.5 "Student"</strong><br />means every User enrolled in one or more educational programmes or services offered by The Law Project.</p>
              <p><strong className="text-gray-900 dark:text-white">1.6 "Course"</strong><br />means every educational offering provided by The Law Project, whether live, recorded, hybrid, self-paced or otherwise.</p>
              <p><strong className="text-gray-900 dark:text-white">1.7 "Services"</strong> include, without limitation:</p>
              <Ol items={["Live online classes;","Recorded courses;","Personal mentorship programmes;","Group mentoring;","Digital study material;","Practice books;","Question banks;","Test series;","Workshops;","Masterclasses;","Webinars;","Books and publications;","Subscription plans;","Career guidance;","Legal skill development programmes;","AI-assisted learning tools;","Any future educational service introduced by The Law Project."]} />
              <p><strong className="text-gray-900 dark:text-white">1.8 "Digital Content"</strong><br />includes every video lecture, audio lecture, recording, PDF, note, PPT, e-book, practice sheet, question bank, answer key, infographic, image, graphic, animation, software interface, database, digital publication, AI-generated educational material and every other intellectual property made available through the Platform.</p>
              <p><strong className="text-gray-900 dark:text-white">1.9 "Mentorship"</strong><br />means every academic guidance session, one-to-one mentoring session, performance review, study planning session, doubt-solving interaction, counselling relating to academic preparation, strategic guidance or similar educational assistance provided by The Law Project.</p>
              <p><strong className="text-gray-900 dark:text-white">1.10 "Subscription"</strong><br />means any membership plan granting access to one or more courses, resources or services for a specified duration.</p>
              <p><strong className="text-gray-900 dark:text-white">1.11 "Content"</strong><br />means all material available on or through the Platform, whether created by The Law Project or licensed from third parties.</p>
              <p><strong className="text-gray-900 dark:text-white">1.12 "Applicable Law"</strong><br />means every law, rule, regulation, notification, governmental guideline and judicial decision applicable within the Republic of India.</p>
            </div>

            {/* 2 */}
            <H2 id="acceptance">2. Acceptance of Terms</H2>
            <Ol items={["These Terms constitute a legally enforceable agreement between The Law Project and every User of the Platform.","By creating an account, purchasing a course, accessing any educational resource, attending any live class, downloading any study material, subscribing to any service or otherwise using the Platform, the User expressly agrees to be bound by these Terms.","The continued use of the Platform after any amendment to these Terms shall constitute acceptance of such revised Terms.","The User represents that he or she has carefully read these Terms before using the Platform.","If the User does not agree with any provision contained herein, the User shall immediately discontinue use of the Platform."]} />

            {/* 3 */}
            <H2 id="eligibility">3. Eligibility</H2>
            <Ol items={["The Platform is intended for individuals legally competent to enter into binding contracts under applicable law.","Where a User is below eighteen (18) years of age, registration, enrolment and payment shall be undertaken only with the consent of a parent or legal guardian. Such parent or guardian shall also be deemed to have accepted these Terms and shall remain responsible for the minor's compliance.","The Law Project reserves the right to refuse registration, admission or access to any person where such refusal is considered necessary in the interests of security, academic discipline, legal compliance or institutional integrity."]} />

            {/* 4 */}
            <H2 id="accounts">4. User accounts</H2>
            {[
              ["Registration","Certain Services may require the creation of a User Account. Users shall provide accurate, complete and updated information while registering."],
              ["Accuracy of Information","Users represent and warrant that every detail submitted to The Law Project is true, complete and accurate. Providing false or misleading information may result in immediate suspension or termination."],
              ["Confidentiality","Every User shall maintain the confidentiality of login credentials. Users shall be solely responsible for every activity conducted through their accounts."],
              ["One User – One Account","Each account is personal and non-transferable. Sharing login credentials with any third party is strictly prohibited."],
              ["Security","Users shall immediately notify The Law Project upon becoming aware of any unauthorised access to their account."],
            ].map(([title, text], i) => (
              <div key={i} className="mb-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">4.{i + 1} {title}</p>
                <P>{text}</P>
              </div>
            ))}
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">4.6 Suspension</p>
            <P>The Law Project may suspend, restrict or terminate any account where it reasonably believes that the account is being shared, false information has been provided, fraudulent activity has occurred, these Terms have been violated, or continued access may adversely affect the Platform, other Users or The Law Project. No compensation or refund shall be payable solely by reason of such suspension where it results from a breach of these Terms by the User.</P>

            {/* 5 */}
            <H2 id="nature">5. Nature of services</H2>
            <Ol items={["The Law Project is an educational platform. It does not constitute a university, degree-awarding institution, statutory educational authority, legal practitioner, counselling service, psychological service or employment agency.","The Services offered by The Law Project are intended solely for educational and academic development. Nothing contained on the Platform shall be construed as legal advice, professional advice or a guarantee of academic or professional success.","The Law Project reserves the right to introduce, modify, suspend, replace or discontinue any Service, feature or educational offering at any time in its academic or business discretion, without creating any obligation to continue a particular format indefinitely."]} />

            {/* Part I-B label */}
            <div className="mt-10 mb-4 bg-primary-50 border border-primary-100 rounded-xl px-5 py-3">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Part I-B — Enrolment, Courses, Live Classes, Recorded Courses, Mentorship & Learning Services</p>
            </div>

            {/* 6 */}
            <H2 id="enrolment">6. Course enrolment</H2>
            {[
              ["Enrolment", "Enrolment into any Course or Service shall be deemed complete only upon successful registration and payment of the applicable fee, unless otherwise expressly agreed in writing by The Law Project. Admission to any Course shall not be deemed confirmed merely upon submission of an application, enquiry or expression of interest."],
              ["Limited Seats", "Certain Courses, including mentorship programmes and specially curated batches, may have limited seats. Admissions to such Courses shall ordinarily be granted on a first-come-first-served basis unless otherwise notified. The Law Project reserves the right to refuse admission even where seats are available, if it believes that such admission may not be in the best interests of the academic environment or the learner."],
              ["Waiting List", "Where admissions exceed available seats, The Law Project may maintain a waiting list. Placement on the waiting list shall not create any legal or contractual right to admission."],
              ["Batch Allocation", "The Law Project reserves the right to allocate, merge, divide, reorganise or restructure batches based upon academic requirements, operational needs or student strength. Such decisions shall not constitute deficiency of service."],
              ["Change of Course", "Requests for transfer from one Course to another shall be considered solely at the discretion of The Law Project and subject to availability, fee adjustments and academic feasibility. The Company shall not be under any obligation to approve such requests."],
            ].map(([title, text], i) => (
              <div key={i} className="mb-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">6.{i + 1} {title}</p>
                <P>{text}</P>
              </div>
            ))}

            {/* 7 */}
            <H2 id="courses">7. Nature of courses</H2>
            <P>The Law Project may offer educational programmes in various formats including live online courses, recorded courses, hybrid courses, self-paced courses, mentorship programmes, crash courses, foundation courses, fellowship programmes, test series, workshops, webinars, masterclasses, subscription plans, digital libraries, books and publications, AI-assisted learning modules, skill development programmes, career guidance programmes, and any future educational service introduced from time to time.</P>
            <Ol items={["The description, duration, curriculum, faculty allocation, learning outcomes and access period for each Course shall be specified on the respective course page or communicated separately.","Course descriptions are intended to provide a general overview. Minor variations in delivery, scheduling, sequence of topics or teaching methodology shall not constitute a breach of contract."]} />

            {/* 8 */}
            <H2 id="live">8. Live classes</H2>
            <P>Live classes shall be conducted through such digital platforms as may be determined by The Law Project from time to time.</P>
            {[
              ["Attendance","Students are expected to attend classes regularly and punctually. Repeated absence may affect learning outcomes. The Law Project shall not be responsible for academic loss arising from a student's failure to attend scheduled classes."],
              ["Rescheduling","The Law Project reserves the right to reschedule, postpone, combine or cancel any class due to academic, operational, technical or unforeseen circumstances. Reasonable efforts shall be made to notify students of such changes."],
              ["Faculty","Faculty members may be substituted whenever considered necessary. The replacement of any faculty member shall not entitle a student to any refund or compensation."],
              ["Missed Classes","Where a student misses a live class owing to personal reasons, illness, examinations, travel, technical difficulties or any other circumstance beyond the control of The Law Project, the Company shall not ordinarily be obliged to conduct a separate class. Where recordings are available, access may be granted subject to the applicable Course policy."],
              ["Class Recordings","The Law Project may record live classes for academic purposes, quality assurance, internal training, compliance or future educational use. Students consent to such recording by participating in the class."],
            ].map(([title, text], i) => (
              <div key={i} className="mb-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">8.{i + 2} {title}</p>
                <P>{text}</P>
              </div>
            ))}

            {/* 9 */}
            <H2 id="recorded">9. Recorded courses</H2>
            <Ol items={["Recorded Courses are provided solely for the personal educational use of the enrolled student.","Purchase of a Recorded Course grants only a limited, revocable, non-exclusive, non-transferable licence to access the Course during the applicable validity period. No ownership rights are transferred.","Recorded Courses may be updated, revised or replaced from time to time to reflect statutory amendments, judicial developments, changes in examination patterns, academic improvements, or technological enhancements.","The Law Project does not guarantee that every Recorded Course shall remain permanently available. Recorded Courses may be discontinued where academically or commercially necessary."]} />

            {/* 10 */}
            <H2 id="mentorship">10. Mentorship programmes</H2>
            <Ol items={["Mentorship is intended to provide academic guidance, performance review, study planning and educational support. Mentorship shall not constitute legal advice, psychological counselling, therapy or career guarantees.","Students are expected to participate sincerely and cooperate during mentorship sessions.","The effectiveness of mentorship depends substantially upon the student's own effort, discipline, consistency and willingness to implement the guidance provided.","The Law Project shall use reasonable efforts to provide mentorship in accordance with the Course description. However, mentorship remains subject to mentor availability, scheduling constraints and operational requirements."]} />

            {/* 11 */}
            <H2 id="books">11. Books & Publications</H2>
            <Ol items={["The Law Project may publish books, journals, magazines, manuals, question banks, revision material and other educational publications in physical or digital format.","All such publications remain protected by applicable intellectual property laws. Purchase of a book does not confer any right to reproduce, digitise, translate, upload or commercially exploit its contents.","Digital books may include technological safeguards, watermarking or access restrictions. Students shall not attempt to remove or circumvent such protections."]} />

            {/* 12 */}
            <H2 id="digital">12. Digital resources</H2>
            <P>The Platform may provide access to notes, PPTs, practice sheets, revision material, mock tests, question banks, bare act compilations, case law digests, AI tools, flash cards, infographics, audio resources, digital libraries, research material, and any other educational resource developed by The Law Project.</P>
            <P>Access to Digital Resources shall remain subject to the licence granted under these Terms. The Law Project may update, modify, replace or remove Digital Resources whenever considered academically necessary.</P>

            {/* 13 */}
            <H2 id="tests">13. Test series</H2>
            <Ol items={["The Law Project may conduct online or offline assessments including full-length mock tests, sectional tests, topic tests, AI-based assessments, performance analytics, ranking exercises, and practice evaluations.","Test scores, rankings and performance reports are intended solely for academic guidance. They do not predict examination results or guarantee admission, selection or success.","The Company reserves the right to modify the pattern, frequency, evaluation methodology or scoring mechanism of any assessment."]} />

            {/* 14 */}
            <H2 id="content">14. Educational content</H2>
            <Ol items={["The Law Project continuously reviews and improves its educational content. Accordingly, syllabi, study material, questions, examples, case studies, exercises, assignments and teaching methodology may be modified without prior notice.","Changes made in good faith for improving academic quality shall not constitute deficiency of service.","The Law Project reserves complete academic discretion regarding the manner in which any subject, topic or examination is taught."]} />

            {/* 15 */}
            <H2 id="exams">15. Examination pattern & Legal developments</H2>
            <Ol items={["Competitive examinations, statutory provisions, judicial precedents, academic requirements and professional standards are subject to change.","The Law Project may revise Course content at any time to reflect such changes.","No student shall claim any refund, compensation or damages merely because Course content has been revised, updated or reorganised to maintain academic relevance."]} />

            {/* Part I-C label */}
            <div className="mt-10 mb-4 bg-primary-50 border border-primary-100 rounded-xl px-5 py-3">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Part I-C — Fees, Payments, Refunds, Subscriptions, Course Access & Account Security</p>
            </div>

            {/* 16 */}
            <H2 id="fees">16. Course fees</H2>
            <Ol items={["The fee payable for each Course or Service shall be displayed on the Platform or otherwise communicated to the User at the time of enrolment.","Fees may vary depending upon the Course, duration, promotional offers, scholarships, subscription plans or other commercial considerations.","The Law Project reserves the right to revise the fee structure for any Course or Service at any time. Such revision shall not affect Users who have already completed payment for the relevant Course unless otherwise expressly provided.","Taxes, statutory levies and payment gateway charges, wherever applicable, shall be payable in addition to the Course Fee unless expressly stated otherwise."]} />

            {/* 17 */}
            <H2 id="payment">17. Payment terms</H2>
            <P>Payments may be made through authorised payment gateways using any mode permitted by the Platform, including UPI, credit cards, debit cards, net banking, wallets, EMI facilities, bank transfer, or any other payment method approved by The Law Project.</P>
            <Ol items={["The User acknowledges that payment processing is undertaken through independent third-party payment gateways. The Law Project shall not be liable for any delay, failure, interruption or error caused by such payment service providers.","The User shall ensure that all payment details provided are accurate and that sufficient funds are available for successful completion of the transaction.","The Law Project reserves the right to suspend or withhold access to any Course until full payment of applicable fees has been received."]} />

            {/* 18 */}
            <H2 id="offers">18. Promotional offers, scholarships & discounts</H2>
            <Ol items={["The Law Project may, from time to time, offer scholarships, promotional pricing, coupon codes, referral benefits, launch offers or other concessions.","Such offers shall remain entirely discretionary and may be modified, suspended or withdrawn without prior notice.","A User shall not be entitled to claim any benefit merely because a similar offer is introduced after his or her enrolment.","Scholarships and promotional offers cannot ordinarily be combined unless expressly permitted."]} />

            {/* 19 */}
            <H2 id="refund">19. Refund & cancellation Policy</H2>
            <div className="space-y-3">
              {[
                ["General Principle","The User acknowledges that The Law Project provides educational services and digital content, access to which may commence immediately upon enrolment. Accordingly, refund requests shall be governed strictly by this Agreement and any specific refund policy applicable to the concerned Course."],
                ["Live Courses","Refunds relating to Live Courses shall be governed by the specific refund policy published for that Course. Unless expressly stated otherwise, no refund shall be available after commencement of the Course."],
                ["Recorded Courses","Recorded Courses are digital products. Once access has been granted, the Course shall ordinarily be non-refundable, non-transferable and non-exchangeable."],
                ["Digital Products","Digital books, PDFs, notes, question banks, mock tests, recorded lectures, subscriptions and downloadable educational resources are generally non-refundable once access has been provided."],
                ["Mentorship Programmes","Mentorship involves allocation of faculty time and academic resources. Accordingly, fees paid towards mentorship programmes shall ordinarily be non-refundable."],
                ["Student Withdrawal","If a User voluntarily discontinues a Course after enrolment, no refund shall ordinarily be payable unless specifically provided under the applicable refund policy."],
                ["Exceptional Cases","The Law Project may, at its sole discretion and without creating any precedent, consider refund requests in exceptional circumstances. Any such decision shall be final and binding."],
              ].map(([title, text], i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">19.{i + 1} {title}</p>
                  <P>{text}</P>
                </div>
              ))}
            </div>

            {/* 20 */}
            <H2 id="validity">20. Course validity</H2>
            <Ol items={["Each Course shall remain accessible only for the validity period specified on the respective Course page or otherwise communicated to the User.","Upon expiry of the validity period, access shall automatically terminate unless renewed.","The Law Project may, at its sole discretion, extend access to any Course without being under any obligation to do so.","Where a Course is advertised as providing 'Lifetime Access', such expression shall mean access for the commercial life of the Course or for such duration as determined by The Law Project, and shall not imply access for the lifetime of the User."]} />

            {/* 21 */}
            <H2 id="subscriptions">21. Subscriptions</H2>
            <Ol items={["Subscription plans shall provide access only to those Courses or Services specifically included within the relevant subscription.","Subscription validity shall commence from the date of activation unless otherwise stated.","Upon expiry, access shall automatically cease unless renewed.","The Law Project reserves the right to modify the contents of any subscription plan by adding, removing or updating educational resources, provided that the overall academic value of the subscription is maintained."]} />

            {/* 22 */}
            <H2 id="access">22. Course access</H2>
            <Ol items={["The User receives only a limited licence to access the purchased Course. No ownership rights are transferred.","Course access is personal and intended solely for the enrolled User.","The User shall not permit any third party to access the Course using his or her account.","The Law Project may impose reasonable limits regarding number of devices, simultaneous logins, browser sessions, operating systems, geographical access, downloads, streaming quality, and session duration. Such restrictions shall not constitute deficiency of service."]} />

            {/* 23 */}
            <H2 id="sharing">23. Account sharing</H2>
            <P>Account sharing is strictly prohibited. Users shall not share login credentials with friends, relatives, coaching institutes, Telegram groups, WhatsApp groups, YouTube channels, educational organisations or any other person.</P>
            <P>The Law Project may use technological measures including IP monitoring, device identification, login analytics, session monitoring, watermarking, usage analytics, artificial intelligence, and digital fingerprinting for detecting unauthorised access.</P>
            <P>Upon detecting suspected account sharing, The Law Project may suspend access, terminate enrolment, permanently disable the account, refuse future admissions, cancel subscriptions, or initiate civil or criminal proceedings where appropriate. No refund shall be payable in such cases.</P>

            {/* 24 */}
            <H2 id="technical">24. Technical requirements</H2>
            <Ol items={["The User is solely responsible for arranging internet connectivity, compatible devices, electricity, software, hardware, headphones, webcam (where required), and any other technical requirement necessary for accessing the Platform.","The Law Project shall not be liable for interruption caused by the User's own technical deficiencies."]} />

            {/* 25 */}
            <H2 id="availability">25. Platform availability</H2>
            <Ol items={["While reasonable efforts shall be made to ensure uninterrupted availability, continuous access to the Platform cannot be guaranteed.","The Platform may become temporarily unavailable due to maintenance, upgrades, server issues, internet failures, cyber security incidents, government restrictions, force majeure events, or circumstances beyond the reasonable control of The Law Project.","Such temporary interruptions shall not ordinarily entitle the User to any refund, compensation or damages."]} />

            {/* 26 */}
            <H2 id="modify">26. Right to modify courses</H2>
            <P>The Law Project reserves the academic and commercial right to revise curriculum, update study material, modify schedules, replace faculty, change teaching methodology, introduce new resources, discontinue obsolete content, revise examination strategy sessions, and improve the learning experience. Such modifications shall not amount to breach of contract or deficiency of service.</P>

            {/* 27 */}
            <H2 id="results">27. No guarantee of results</H2>
            <Ol items={["The Law Project shall use its best academic efforts to provide quality education. However, success in any examination depends upon numerous factors including the student's effort, aptitude, discipline, consistency and examination performance.","Accordingly, The Law Project does not guarantee admission, selection, rank, employment, internship, scholarship, judicial appointment, or qualification in any examination.","Testimonials, rankings, previous results or success stories displayed by The Law Project are illustrative in nature and shall not be construed as guarantees of future performance."]} />

            {/* Part II label */}
            <div className="mt-10 mb-4 bg-primary-50 border border-primary-100 rounded-xl px-5 py-3">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Part II — Intellectual Property, Copyright, Anti-Piracy, Student Conduct & Platform Protection</p>
            </div>

            {/* 28 */}
            <H2 id="ip">28. Intellectual property rights</H2>
            <P>Unless expressly stated otherwise, every intellectual property right associated with The Law Project shall remain the exclusive property of The Law Project and/or its licensors. These include The Law Project name, logos, trademarks, slogans, website design, software, source code, user interface, videos, recorded lectures, books, notes, PPTs, question banks, mock tests, answer keys, digital publications, audio recordings, AI-generated educational material, research material, and every other educational resource created or licensed by The Law Project.</P>
            <Ol items={["Purchase of any Course or Product grants only a limited, revocable, non-exclusive and non-transferable licence to access the relevant educational content for personal learning. No ownership, copyright or proprietary interest is transferred to the User.","All rights not expressly granted under these Terms are reserved by The Law Project."]} />

            {/* 29 */}
            <H2 id="copyright">29. Copyright policy</H2>
            <P>All educational content is protected under the Copyright Act, 1957 and other applicable intellectual property laws. Without prior written permission, no User shall reproduce, copy, upload, publish, distribute, transmit, broadcast, translate, modify, adapt, commercially exploit, create derivative works from, compile into another course, incorporate into any coaching material, use for training AI models, or use for commercial teaching any Content belonging to The Law Project.</P>

            {/* 30 */}
            <H2 id="piracy">30. Anti-piracy policy</H2>
            <P>The Law Project follows a zero-tolerance policy towards piracy. Users shall not screen-record lectures, record audio, photograph the screen, livestream classes, download restricted videos, bypass technological protections, upload content to any platform, sell notes, circulate PDFs or books, circulate recorded lectures, prepare competing courses using TLP material, or commercially exploit any educational resource.</P>
            <P>The Law Project reserves the right to employ watermarking, digital fingerprinting, device tracking, IP monitoring, session analytics, AI-based monitoring, forensic technology, and copyright monitoring services for detecting piracy. Where piracy is detected, The Law Project may terminate access immediately, permanently deactivate the account, revoke licences, claim damages, seek injunctions, initiate civil or criminal proceedings, and recover legal costs.</P>

            {/* 31 */}
            <H2 id="ai">31. AI usage policy</H2>
            <Ol items={["Artificial Intelligence tools are transforming education. The Law Project encourages ethical use of AI for learning.","However, Users shall not use AI to recreate courses, generate competing educational products, scrape educational content, reproduce lectures, extract proprietary databases, convert lectures into commercial notes, train AI models using TLP Content, or prepare derivative educational products.","Nothing in these Terms prohibits students from using publicly available AI tools for their own learning, provided such use does not infringe the intellectual property rights of The Law Project."]} />

            {/* 32 */}
            <H2 id="conduct">32. Student code of conduct</H2>
            <P>Every User shall behave respectfully, maintain academic integrity, cooperate with faculty, maintain classroom discipline, respect fellow learners, and comply with these Terms. Students shall not abuse faculty, harass staff, bully fellow students, disrupt classes, impersonate another person, circulate offensive material, engage in hate speech or discrimination, spam communication channels, advertise unrelated products, or use obscene language.</P>

            {/* 33 */}
            <H2 id="community">33. Community guidelines</H2>
            <P>The Law Project may maintain official communities through WhatsApp, Telegram, Discord, Facebook Groups, LMS Discussion Boards, Student Forums, or similar platforms. These communities exist solely for academic interaction. Users shall not advertise external coaching, solicit business, circulate misinformation, post unlawful material, share copyrighted material, circulate examination leaks, or disturb academic discussions. The Law Project may remove any User from such communities without notice.</P>

            {/* 34 */}
            <H2 id="integrity">34. Academic integrity</H2>
            <P>Students shall maintain honesty during mock tests, assignments, assessments, rankings, interviews and competitions. Cheating, impersonation, manipulation of rankings, use of unfair means, plagiarism, and submission of another person's work as one's own are prohibited. Violation may result in cancellation of results, suspension or termination.</P>

            {/* 35 */}
            <H2 id="recording">35. Recording policy</H2>
            <P>Students shall not record any live class without prior written permission. Participation in a live class constitutes consent to recording by The Law Project for educational, quality assurance, archival, compliance or future learning purposes.</P>

            {/* 36 */}
            <H2 id="ugc">36. User generated content</H2>
            <P>Where Users upload assignments, comments, discussion posts or other material, they represent that they possess the necessary rights over such material. The User grants The Law Project a non-exclusive, royalty-free licence to store, reproduce and display such content solely for operating and improving the Platform.</P>

            {/* 37 */}
            <H2 id="testimonials">37. Testimonials & publicity</H2>
            <P>Where permitted by law, The Law Project may publish names, photographs, ranks, testimonials, success stories, interviews, videos and academic achievements for educational and promotional purposes. A User may request removal of future promotional use by contacting The Law Project.</P>

            {/* 38 */}
            <H2 id="privacy">38. Privacy</H2>
            <P>The Law Project respects the privacy of every User. Collection, processing and use of personal information shall be governed by the Privacy Policy published on the Platform, which forms an integral part of this Agreement.</P>

            {/* 39 */}
            <H2 id="communications">39. Communications</H2>
            <P>The User expressly consents to receive communications from The Law Project through email, SMS, WhatsApp, telephone, notifications, student dashboard, or mobile applications regarding classes, examinations, schedules, academic updates, invoices, promotional offers, policy changes, and other educational communications. The User may opt out of promotional communications wherever legally permissible, but academic and transactional communications shall continue as necessary.</P>

            {/* 40 */}
            <H2 id="philosophy">40. Educational philosophy</H2>
            <P>The Law Project is founded on the belief that education extends beyond classroom teaching. Our programmes are designed around mentorship, conceptual clarity, disciplined preparation and continuous academic development. While every reasonable effort is made to provide high-quality education, personal attention and meaningful academic support, no educational institution can substitute a student's own commitment, sincerity and consistent effort. The Law Project provides guidance, resources and mentorship. The responsibility for learning, preparation and performance ultimately rests with the learner.</P>

            {/* Part III label */}
            <div className="mt-10 mb-4 bg-primary-50 border border-primary-100 rounded-xl px-5 py-3">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Part III — Disclaimers, Liability, Dispute Resolution & General Legal Provisions</p>
            </div>

            {/* 41 */}
            <H2 id="disclaimer">41. Disclaimer</H2>
            <Ol items={["The Platform and all Services offered by The Law Project are intended solely for educational, informational and academic purposes. Nothing contained on the Platform shall constitute legal advice, professional advice, career advice, psychological counselling or financial advice.","While The Law Project endeavours to provide quality education, mentorship and academic guidance, it does not guarantee admission into any institution, qualification in any examination, any particular score or rank, employment, internship, scholarship, judicial appointment, or professional success. Every learner acknowledges that success depends upon numerous factors including individual effort, aptitude, discipline, examination performance and circumstances beyond the control of The Law Project.","Testimonials, rankings, photographs, interviews and success stories published by The Law Project represent individual experiences only. They shall not be construed as guarantees of future results."]} />

            {/* 42 */}
            <H2 id="thirdparty">42. Third-party services</H2>
            <P>The Platform may utilise services provided by third parties including payment gateways, video conferencing platforms, cloud hosting providers, communication services, analytics providers and learning management systems. The Law Project shall not be liable for interruptions, failures, delays or losses arising from the acts or omissions of such independent third-party service providers.</P>

            {/* 43 */}
            <H2 id="liability">43. Limitation of liability</H2>
            <P>To the fullest extent permitted by law, The Law Project, its founders, faculty members, employees, mentors, consultants and representatives shall not be liable for any indirect, consequential, incidental, special or punitive damages, loss of opportunity, loss of employment, examination failure, loss of profits, loss of reputation, loss of data, technological failures, internet interruptions, or acts of third parties. Where liability cannot be excluded under applicable law, the aggregate liability of The Law Project shall not exceed the amount actually paid by the User towards the specific Service giving rise to the claim.</P>

            {/* 44 */}
            <H2 id="indemnity">44. Indemnity</H2>
            <P>The User agrees to indemnify, defend and hold harmless The Law Project, its founders, employees, faculty members, mentors, consultants and representatives against every claim, demand, liability, damage, loss, cost or expense (including reasonable legal fees) arising from breach of these Terms, misuse of the Platform, infringement of intellectual property, violation of applicable law, unauthorised sharing of Content, fraudulent activity, or misuse of another person's account.</P>

            {/* 45 */}
            <H2 id="termination">45. Suspension & termination</H2>
            <P>The Law Project reserves the right to suspend, restrict or permanently terminate any User Account without prior notice where the User violates these Terms, engages in piracy, shares login credentials, commits fraud, abuses faculty or staff, disrupts academic activities, infringes intellectual property, attempts unauthorised access, or engages in unlawful conduct. Termination shall not affect any accrued rights or remedies available to The Law Project. Unless otherwise expressly provided, no refund shall be payable where termination results from the User's breach of these Terms.</P>

            {/* 46 */}
            <H2 id="forcemajeure">46. Force majeure</H2>
            <P>The Law Project shall not be liable for delay, interruption or failure in performance arising from circumstances beyond its reasonable control, including natural disasters, floods, earthquakes, pandemics, epidemics, war, terrorism, cyber-attacks, internet shutdowns, governmental restrictions, judicial orders, labour disputes, power failures, cloud service failures, communication failures, or acts of God.</P>

            {/* 47 */}
            <H2 id="compliance">47. Compliance with law</H2>
            <P>Users shall comply with all applicable laws while using the Platform, including laws relating to copyright, information technology, cyber security, privacy, consumer protection and intellectual property.</P>

            {/* 48 */}
            <H2 id="defamation">48. Defamation & responsible communication</H2>
            <P>The Law Project values honest feedback and constructive criticism. Nothing in these Terms shall prevent a User from expressing genuine opinions or sharing truthful experiences. However, Users agree not to knowingly publish or circulate false, fabricated, malicious or defamatory statements intended to unfairly damage the reputation of The Law Project, its founders, faculty members, employees or learners. Nothing contained herein shall limit any rights or remedies available under applicable law.</P>

            {/* 49–53 */}
            <H2 id="assignment">49. Assignment</H2>
            <P>The User shall not assign or transfer any rights arising under these Terms without the prior written consent of The Law Project. The Law Project may assign its rights and obligations to any successor, affiliate or authorised entity.</P>

            <H2 id="waiver">50. Waiver</H2>
            <P>Failure by The Law Project to enforce any provision of these Terms on one occasion shall not constitute a waiver of its right to enforce such provision on any subsequent occasion.</P>

            <H2 id="severability">51. Severability</H2>
            <P>If any provision of these Terms is held to be invalid, illegal or unenforceable by a competent court or tribunal, the remaining provisions shall continue to remain valid and enforceable.</P>

            <H2 id="amendments">52. Amendments</H2>
            <P>The Law Project reserves the right to modify, revise or replace these Terms at any time. Updated Terms shall become effective upon publication on the Platform unless otherwise stated. Continued use of the Platform after such publication shall constitute acceptance of the revised Terms.</P>

            <H2 id="entireagreement">53. Entire agreement</H2>
            <P>These Terms, together with the Privacy Policy, Refund Policy, Cookie Policy, Shipping & Delivery Policy (where applicable), Copyright & Anti-Piracy Policy and any other policy published by The Law Project, constitute the complete agreement between the User and The Law Project. They supersede every previous oral or written understanding relating to the use of the Platform.</P>

            {/* 54–57 */}
            <H2 id="governing">54. Governing law</H2>
            <P>These Terms shall be governed by and construed in accordance with the laws of the Republic of India.</P>

            <H2 id="dispute">55. Dispute resolution</H2>
            <P>The parties shall endeavour to resolve every dispute amicably through good-faith discussions. If the dispute cannot be resolved within thirty (30) days, it shall be referred to arbitration.</P>

            <H2 id="arbitration">56. Arbitration</H2>
            <P>Every dispute arising out of or relating to these Terms shall be referred to a Sole Arbitrator appointed by The Law Project in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time. The seat and venue of arbitration shall be Jaipur, Rajasthan. The arbitration proceedings shall be conducted in the English language. The arbitral award shall be final and binding upon the parties.</P>

            <H2 id="jurisdiction">57. Jurisdiction</H2>
            <P>Subject to Clause 56, the Courts at Jaipur, Rajasthan alone shall have exclusive jurisdiction over every dispute arising from these Terms or the use of the Platform.</P>

            {/* 58 */}
            <H2 id="contact">58. Contact information</H2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">The Law Project</p>
              <p>Email: ____________</p>
              <p>Website: ____________</p>
              <p>Contact Number: ____________</p>
              <p>Registered Address: ____________</p>
            </div>

            {/* 59 */}
            <H2 id="ourphilosophy">59. Our philosophy</H2>
            <P>The Law Project was founded on a simple belief: Education should never be reduced to content delivery. It should create understanding, confidence and character.</P>
            <P>We believe that lectures alone do not create successful lawyers. Consistent learning, disciplined preparation, meaningful mentorship and genuine academic support do.</P>
            <P>Whether a learner joins us through a live classroom, a recorded course, a book, a test series, a mentorship programme or any other educational resource, our objective remains the same — to help every learner realise his or her fullest potential.</P>
            <P>We are committed to delivering quality education with integrity, professionalism and respect for every learner.</P>

            {/* Footer strip */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-6 py-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Effective Date:</strong> ______________________<br /><br />
                  By creating an account, enrolling in any Course, purchasing any Product or otherwise using the Platform, the User acknowledges that he or she has read, understood and agreed to be bound by these Terms of Use, Service Agreement & User Policy.
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
