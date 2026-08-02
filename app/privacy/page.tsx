import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const toc = [
  { id: "intro",      label: "Introduction" },
  { id: "s1",         label: "1. Collection of personally identifiable information" },
  { id: "s2",         label: "2. Use of personal information" },
  { id: "s3",         label: "3. Sharing of personal information" },
  { id: "s4",         label: "4. Information safety" },
  { id: "s5",         label: "5. Choice / Opt-out" },
  { id: "grievance",  label: "6. Grievance officer" },
  { id: "governing",  label: "7. Governing law" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-bold text-gray-900 dark:text-white mt-10 mb-3 scroll-mt-28 border-b border-gray-100 dark:border-gray-700 pb-2">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3 text-sm">{children}</p>;
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3 pl-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function Sub({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{n}</p>
      <P>{children}</P>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 dark:bg-gray-800 pt-28 pb-10 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated: 21 July 2025 &nbsp;·&nbsp; The Law Project</p>
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

            {/* Introduction */}
            <H2 id="intro">Introduction</H2>
            <P>Please read the following Privacy Policy of the services made available on <strong className="text-gray-800 dark:text-gray-200">www.thelawproject.in</strong> or the equivalent The Law Project mobile application available on Google Play (<strong className="text-gray-800 dark:text-gray-200">"TLP App"</strong> / <strong className="text-gray-800 dark:text-gray-200">"Website"</strong>). The TLP App or Website on which the Services are availed may together be referred to for convenience as the <strong className="text-gray-800 dark:text-gray-200">"Platform"</strong>.</P>
            <P>Please ensure that this Privacy Policy is perused by You before availing any services from Us. This Privacy Policy shall be updated from time to time and to stay abreast with Our methods of using Your information and protecting Your privacy, please keep reviewing this Policy.</P>
            <P>By viewing the TLP Platform, you agree to be bound by the terms of this Privacy Policy.</P>
            <P>By using the TLP Platform and/or by providing Your information, You consent to the collection and use of the information You disclose on Our Website in accordance with this Privacy Policy, including but not limited to your consent for sharing your information as per this Privacy Policy. If We decide to change Our Privacy Policy, We will post those changes on this page so that You are always aware of what information We collect, how We use it, and under what circumstances We disclose it. If You do not agree with the foregoing, please do not continue to use or access Our Website.</P>

            {/* Section 1 */}
            <H2 id="s1">1. Collection of Personally Identifiable Information</H2>

            <Sub n="1.1">We collect certain information about You to help Us serve You better. The information collected by Us is of the following nature:</Sub>
            <Ul items={[
              "Name;",
              "Telephone number;",
              "Email address;",
              "Service address;",
              "Other information about the service address which You give Us;",
              "Your IP address;",
              "Information about your device;",
              "Network information;",
              "College / institution details and location;",
              "User-uploaded photo and IDs;",
              "Demographic information such as postcode, preferences and interests;",
              "Any other personal information which you give Us in connection with enrolment in a service or which is relevant to customer surveys and/or offers.",
            ]} />

            <Sub n="1.2">Information provided during Registration — to create a profile and use this Website and services, you may be asked to provide the following information: your name, your username, password, email address, the area of law in which you practise or intend to practise (selected from a drop-down menu if applicable), year of graduation or year of joining your legal programme, and the name of your college or university. You may also choose to provide a picture to be associated with your profile.</Sub>

            <Sub n="1.3">We also provide an option to register using Google. If you select this option, you allow Us to access your profile information as permitted by your Google account settings. Please note that if you register to the Platform through Google, You shall be subject to the Terms & Conditions and Privacy Policy of Google.</Sub>

            <Sub n="1.4">We will store your username and relevant academic details on secured servers. Your password is cryptographically hashed and your email address is encrypted. These information elements are referred to collectively as your <strong className="text-gray-800 dark:text-gray-200">"Personal User Information."</strong> We collect and hold this information for the purpose of administering your use of the Platform.</Sub>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">1.5</p>
              <P>You are solely responsible for:</P>
              <Ul items={[
                "Maintaining the strict confidentiality of your Personal User Information;",
                "Not allowing another person to use your Personal User Information to access the Services;",
                "Any and all damages or losses that may be incurred or suffered as a result of any activities that occur in your Account;",
                "Ensuring that the information submitted by you complies with our Terms & Conditions;",
                "Ensuring that the information provided by you is correct and updated from time to time.",
              ]} />
            </div>

            <Sub n="1.6">You agree to immediately notify The Law Project in writing by email at <strong className="text-gray-800 dark:text-gray-200">thelawproject.in@gmail.com</strong> of any unauthorised use of your Personal User Information or any other breach of security. The Law Project is not and shall not be liable for any harm arising from or relating to the theft of your Personal User Information that is under Your control, your disclosure of your Personal User Information, or the use of your Personal User Information by another person or entity.</Sub>

            <Sub n="1.7">On receiving personal information about You, You no longer remain anonymous to Us. We may use this information to do internal research on demographics, interests, and behaviour to better understand, protect and serve our customers. This information is compiled and analysed on an aggregated basis. We indicate fields that are mandatory to be filled and fields that are optional. You may decide whether or not to provide such information to Us.</Sub>

            <Sub n="1.8">You may choose not to provide Us with any personal information or information as required to provide any Services. If We do not receive information required, We may choose not to provide you with such Service. Service shall have the meaning attributed to the phrase in the Terms of Use.</Sub>

            <Sub n="1.9">On Our Website, you can browse without telling Us who you are or revealing any personal information about Yourself. We may automatically track certain information about You based on Your behaviour on Our Website. This information may include the URL that You just came from (whether this URL is on Our Website or not), which URL You next go to (whether this URL is on Our Website or not), Your browser information, and Your IP address.</Sub>

            <Sub n="1.10">On Our Website, We use data collection devices such as "cookies" on certain pages to help analyse Our web page flow, measure promotional effectiveness, and promote trust and safety. "Cookies" are small files placed on your hard drive that assist Us in providing Our services. We offer certain features that are only available through the use of a "cookie". You are always free to decline Our cookies if Your browser permits, although in that case You may not be able to use certain features on the Website. Additionally, You may encounter "Cookies" or other similar devices on certain pages of the Website that are placed by third parties. We do not control the use of cookies by third parties.</Sub>

            {/* Section 2 */}
            <H2 id="s2">2. Use of Personal Information</H2>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">2.1</p>
              <P>The information collected by Us through Our Website is used by Us for various purposes to enable Us to serve You better:</P>
              <Ul items={[
                "To find third-party service providers;",
                "Internal record keeping;",
                "We may use the information to improve Our products and services;",
                "We may periodically send promotional emails or messages on the Website about new products, special offers or other information which We think You may find interesting using the email address which You have provided;",
                "From time to time, We may use the information to customise the Website according to your interests.",
              ]} />
            </div>

            <Sub n="2.2">We may use personal information to resolve disputes that may arise with the use of Our Services, help promote a safe service to all the customers, measure consumer interest in Our services, customise your experience, detect and protect Us against error, fraud and other criminal activity, enforce Our Terms & Conditions.</Sub>

            <Sub n="2.3">We identify and use your IP address to help diagnose problems with Our server, and to administer Our Website. Your IP address is also used to help identify You and to gather broad demographic information.</Sub>

            {/* Section 3 */}
            <H2 id="s3">3. Sharing of Personal Information</H2>

            <Sub n="3.1">We may share your information with payment service providers (such as Razorpay or PhonePe), regulatory authorities, and third-party agencies in the event of any request from such authorities.</Sub>

            <Sub n="3.2">We may disclose Your personal information if required to do so by law or in the good faith and belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or other legal process. We may disclose personal information to law enforcement offices, third-party rights owners, or others in the good faith belief that such disclosure is reasonably necessary to enforce Our Terms or Privacy Policy; respond to claims that an advertisement, posting or other content violates the rights of a third party; or protect the rights, property or personal safety of Our customers or the general public.</Sub>

            <Sub n="3.3">We and Our affiliates will share / sell some or all of the collected information with another business entity should We (or Our assets) plan to merge with, or be acquired by that business entity, or re-organisation, amalgamation, restructuring of business. Should such a transaction occur, that other business entity (or the new combined entity) will be required to follow this Privacy Policy with respect to all the information collected.</Sub>

            <Sub n="3.4">We do not disclose personal information about identifiable individuals to advertisers, but We may provide them with aggregate and/or anonymised information about You to help advertisers reach the kind of audience they want to target. We may make use of the information We have collected from You to enable Us to comply with Our advertisers' wishes by displaying their advertisement to that target audience.</Sub>

            <Sub n="3.5">If you choose to subscribe to any TLP plan you may be required to upload a copy of a valid government-issued identification document to allow access to the Platform.</Sub>

            {/* Section 4 */}
            <H2 id="s4">4. Information Safety</H2>
            <Sub n="4.1">All information is saved and stored on servers which are secured with passwords and pins to ensure no unauthorised person has access to it. Once your information is in Our possession We adhere to strict security guidelines, protecting it against unauthorised access.</Sub>

            {/* Section 5 */}
            <H2 id="s5">5. Choice / Opt-Out</H2>
            <Sub n="5.1">We provide all customers with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications from Us on behalf of Our partners, and from Us in general, after providing Us with personal information. If You want to remove your contact information from all lists and newsletters, please write to <strong className="text-gray-800 dark:text-gray-200">thelawproject.in@gmail.com</strong>.</Sub>
            <P>All other terms and conditions as applicable under the Terms and Conditions of Use at <strong className="text-gray-800 dark:text-gray-200">www.thelawproject.in/terms</strong> will be applicable to You and will be read along with this Privacy Policy.</P>

            {/* Section 6 — Grievance Officer */}
            <H2 id="grievance">6. Grievance Officer</H2>
            <P>In accordance with the Information Technology Act, 2000 and the rules made thereunder, The Law Project has designated a Grievance Officer to address complaints and concerns relating to personal data. All grievances shall be addressed within 30 (thirty) days of receipt.</P>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Grievance Officer — The Law Project</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> Bhvatosh Agrawal</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Email:</span> thelawproject.in@gmail.com</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span> +91 99502 36296</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Address:</span> G-6, Ground Floor, Lily Mangalam, Mangalam Anand Appartment, Sanganer Muhana, Jaipur, Rajasthan</p>
            </div>

            {/* Section 7 — Governing Law */}
            <H2 id="governing">7. Governing Law</H2>
            <P>This Privacy Policy shall be governed by and construed in accordance with the laws of the Republic of India, including the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (upon its enforcement). Any disputes arising out of or in connection with this Privacy Policy shall be subject to the exclusive jurisdiction of the Courts at Jaipur, Rajasthan.</P>

            {/* Footer strip */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-6 py-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Effective Date:</strong> 21 July 2025<br /><br />
                  By accessing or using The Law Project Platform, you acknowledge that you have read, understood and agreed to this Privacy Policy.
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
