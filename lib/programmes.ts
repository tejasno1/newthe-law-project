export interface Programme {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  badge: string;
  isNew: boolean;
  category: string;
  duration: string;
  hoursPerWeek: string;
  price: string;
  enrollment: "open" | "closed";
  coverImg: string;
  description: string;
  highlights: string[];
  whoFor: { label: string; desc: string }[];
  learnings: string[];
  methodology: { title: string; desc: string }[];
  objectivesGroups: { title: string; items: string[] }[];
  syllabus: { title: string; items: string[] }[];
  faculty: { name: string; role: string; bio: string; img: string }[];
  features: string[];
  faqs: { q: string; a: string }[];
}

export const PROGRAMMES: Programme[] = [
  {
    slug: "advanced-criminal-litigation",
    title: "Executive Certificate Course in Advanced Criminal Litigation & White Collar Crime Advocacy",
    shortTitle: "Advanced Criminal Litigation",
    tagline: "Master courtroom advocacy, PMLA proceedings and white-collar defence in a 6-month live mentorship programme.",
    badge: "Certificate Programme",
    isNew: true,
    category: "Criminal Law",
    duration: "6 Months",
    hoursPerWeek: "8–10 hrs / week",
    price: "₹60,000",
    enrollment: "closed",
    coverImg: "https://picsum.photos/seed/criminal-litigation/900/500",
    description: "From bail applications to PMLA attachments, criminal lawyers are society's last line of defence. This course bridges the gap between legal education and real courtroom practice — with hands-on drafting exercises, live mentorship, and structured guidance in both traditional criminal matters and modern regulatory challenges.",
    highlights: [
      "Live online classes after work hours",
      "2 practical drafting exercises per week with feedback",
      "Skill India + NSDC certification on completion",
      "Placement and internship support",
      "3-year access to updated content",
      "100% refund within 30 days of full participation",
    ],
    whoFor: [
      { label: "Fresh Law Graduates", desc: "Build a confident criminal practice from day one with structured real-world skill training and mentorship." },
      { label: "Practicing Lawyers", desc: "Add criminal litigation as a specialisation to your existing practice and unlock new client opportunities." },
      { label: "1–3 Year Associates", desc: "Move beyond basic cases to complex PMLA, SEBI and regulatory matters with advanced strategy." },
      { label: "Specialists in Regulatory Law", desc: "Carve out a niche in NDPS, PMLA, POCSO and Insider Trading — high demand, fewer competitors." },
    ],
    learnings: [
      "Strategic drafting for bail applications, quashing petitions & Show Cause Notices",
      "Collecting & presenting evidence across criminal trial types",
      "Conducting cross-examinations in criminal and white-collar matters",
      "Handling PMLA attachment orders and Adjudicating Authority proceedings",
      "Drafting responses to SFIO, GST, income tax & customs authorities",
      "Managing anticipatory bail in special courts under PMLA & PC Act",
      "Filing writ petitions challenging Show Cause Notices before High Courts",
      "Responding to SEBI insider trading cases",
      "Risk management, compliance advisory & corporate defence strategies",
      "Challenging lookout circulars, Red Corner Notices & extradition requests",
      "Client management with empathy and sharp legal strategy",
      "Setting up and managing your own criminal law practice",
    ],
    methodology: [
      { title: "Online 24/7 Access", desc: "Study anytime via our portal and Android & iOS app." },
      { title: "Practical Exercises", desc: "Two drafting exercises every week with written mentor feedback." },
      { title: "Live Online Classes", desc: "Weekly live classes — ask questions, get real-time feedback." },
      { title: "Flexible Timings", desc: "Classes after work hours — Sundays or weekday evenings after 8 PM." },
      { title: "Live Doubt Clearing", desc: "One-on-one mentor sessions and live doubt clearing on demand." },
    ],
    objectivesGroups: [
      {
        title: "FIR, Complaints & Investigation",
        items: ["Drafting and filing an FIR; obtaining a copy", "Remedies when police refuse to register an FIR", "Filing complaints and protest petitions", "Post-FIR actions and police hierarchy"],
      },
      {
        title: "Arrest, Bail & Custody",
        items: ["Preventing arrest and obtaining bail", "Anticipatory bail applications — when and where", "Bail bonds, surety and rejection remedies", "Superdari and property release procedures"],
      },
      {
        title: "Trial Procedure & Evidence",
        items: ["Stages of a criminal trial from charge to verdict", "Admissibility of oral, documentary & electronic evidence", "Burden and standard of proof", "Examination-in-chief and cross-examination techniques"],
      },
      {
        title: "White-Collar & Regulatory Matters",
        items: ["PMLA proceedings — attachment, search & seizure", "SFIO investigations and wilful defaulter notices", "SEBI insider trading cases", "GST, customs and income tax defence strategies"],
      },
      {
        title: "Appeals & Special Petitions",
        items: ["Drafting criminal appeals and SLPs", "Writ petitions challenging Show Cause Notices", "Quashing proceedings under BNS 2023", "Challenging lookout circulars and extradition"],
      },
    ],
    syllabus: [
      { title: "Module 1 — FIR, Complaints & Police Procedures", items: ["General diary, case diary and FIR basics", "Criminal complaints and filing procedures", "Remedies when police refuse to register", "Post-FIR actions and filing timelines", "False FIRs, cross FIRs and remedies"] },
      { title: "Module 2 — Arrest, Bail & Custody", items: ["Arrest procedures and warrants", "Bail and anticipatory bail applications", "Drafting strategies and rejection remedies", "Preventive detention and custody types", "Superdari and property release"] },
      { title: "Module 3 — Charges, Trial & Evidence", items: ["Charges, charge-sheets and framing", "Discharge procedures across trial types", "Protest petitions and revisions", "Evidence submission and admissibility", "Burden of proof and evidentiary standards"] },
      { title: "Module 4 — Advanced Criminal Litigation", items: ["Cross-examination in complex trials", "Appeals and SLP drafting", "Negotiable Instruments Act proceedings", "Ethical practice in criminal law", "Building an effective litigation strategy"] },
      { title: "Module 5 — White-Collar Crime & Regulatory Law", items: ["PMLA proceedings, attachment and search & seizure", "Adjudicating Authority and Appellate Tribunal", "SEBI, SFIO, customs and GST defence", "Show Cause Notices under multiple legislations", "Corporate compliance, risk management and advisory"] },
    ],
    faculty: [
      { name: "Deepali Suri", role: "Criminal Litigator · 5+ Years", bio: "Represented CRPF, BSF, and MoUD in Delhi High Court. Appeared for SBI, ASI, ONGC and GAIL in top courts.", img: "https://picsum.photos/seed/faculty1/200/200" },
      { name: "Shreya Sharma", role: "Civil & Regulatory Law Expert · 8+ Years", bio: "Ex-Consultant at MoEFCC; Ex-Researcher to Justice R.K. Agarwal. Specialises in Civil, Arbitration, Benami and Environmental laws.", img: "https://picsum.photos/seed/faculty2/200/200" },
    ],
    features: [
      "1 live online class per week",
      "2 practical drafting exercises per week",
      "Full digital access to study materials",
      "LMS access on Android & iOS",
      "Instructor feedback on all assignments",
      "Unlimited doubt clearing sessions",
      "Online exams at convenient time slots",
      "Physical certificate by courier",
      "CV enhancement support",
      "Professional networking coaching",
      "Writing & publication training",
      "Internship & job placement support",
      "Interview preparation guidance",
      "3-year access to updated content",
      "Top students recommended to law firms",
    ],
    faqs: [
      { q: "Do I need prior experience in criminal law?", a: "No prior experience in criminal litigation is required. The course is designed for law graduates and practicing lawyers at all stages." },
      { q: "What is the refund policy?", a: "You can get a 100% refund within 30 days if you have fully participated and don't find value. Read the full refund policy for details." },
      { q: "When does the next batch begin?", a: "Enrollment is currently closed. Join the waitlist and we will notify you as soon as the next batch opens." },
      { q: "Will I get a physical certificate?", a: "Yes. On successful course completion you receive a physical certificate by courier, along with Skill India + NSDC certification through Medhavi Skills University." },
      { q: "What are the class timings?", a: "Classes are held after work hours — typically on Sundays or on weekday evenings after 8 PM IST, so you can continue working while studying." },
      { q: "Is there placement support?", a: "Yes. Our dedicated team assists with internships, job placements, CV enhancement, interview preparation, and freelance opportunities." },
    ],
  },
];

export function getProgramme(slug: string) {
  return PROGRAMMES.find((p) => p.slug === slug) ?? null;
}
