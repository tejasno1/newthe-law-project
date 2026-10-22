import {
  CheckCircle, Star,
  Video, FileText, Award, MessageCircle, ClipboardList,
  BookOpen, Clock, TrendingUp,
  Target, AlarmClock, BarChart2,
  BadgeCheck, Users, Calendar,
} from "lucide-react";

export type BannerVariant = "courses" | "blogs" | "tests" | "quickskills" | "resources" | "question-bank";

interface Props {
  title: string;
  subtitle: string;
  variant?: BannerVariant;
}

const bullets: Record<BannerVariant, string[]> = {
  resources: [
    "Landmark case laws — carefully analysed and exam-ready",
    "High-quality MCQ PDFs crafted by practising lawyers and faculty",
    "Bare acts with key provisions highlighted for quick revision",
    "Curated for CLAT-UG, CLAT-PG, Judiciary and all other govt law exams",
  ],
  courses: [
    "Expert-led HD video lectures",
    "Well-structured notes and study resources",
    "Chapter-wise practice questions and mock tests",
    "Live interactive doubt-solving sessions",
    "Career-focused learning with practical insights",
  ],
  blogs: [
    "In-depth legal analysis written by practising lawyers",
    "CLAT-UG & CLAT-PG prep guides, case summaries and judgment breakdowns",
    "Career advice on internships, moot courts and NLU admissions",
    "New articles published every week across all law areas",
  ],
  tests: [
    "Full-length mock tests for CLAT-UG, CLAT-PG, Judiciary and all other govt law exams",
    "Topic-wise and section-wise practice tests to master every subject",
    "Detailed answer explanations with legal reasoning and expert insights",
    "Performance reports to identify strengths, improve weak areas, and track progress",
  ],
  quickskills: [
    "Expert-led live and self-paced learning",
    "Project-based assignments and practical case studies",
    "Certificate of Completion for every programme",
    "Career support, mentorship, and networking opportunities",
  ],
  "question-bank": [
    "Subject-wise MCQ sets covering Constitutional Law, IPC, CrPC, Evidence Act, and more",
    "Questions crafted by practising lawyers — not generic, not recycled from textbooks",
    "Read online anytime — accessible on any device, no downloads required",
    "Covering CLAT-UG, CLAT-PG, Judiciary, UGC-NET Law and all other govt law exams",
  ],
};

/* ── COURSES: What's Included card ───────────────────────────────────────── */
function CoursesCard() {
  const resources = [
    { icon: Video,         label: "HD Video Lectures",          detail: "Watch anytime, anywhere"        },
    { icon: FileText,      label: "PDF Notes",     detail: "Curated study material"         },
    { icon: ClipboardList, label: "Chapter-wise MCQs",          detail: "Test after every module"        },
    { icon: Award,         label: "Completion Certificate",     detail: "Industry recognised"            },
    { icon: MessageCircle, label: "Doubt-Solving Sessions", detail: "Q&A with expert faculty"      },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5">
        <p className="text-white font-bold text-sm">What&apos;s Included</p>
        <p className="text-primary-200 text-[10px] mt-0.5">Everything you need to excel</p>
      </div>
      <div className="p-3 space-y-1.5">
        {resources.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
            <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3 h-3 text-primary-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 text-[10px] font-semibold leading-none">{label}</p>
              <p className="text-gray-400 text-[9px] mt-0.5">{detail}</p>
            </div>
            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" strokeWidth={2.5} />
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-gray-700 text-[10px] font-bold ml-1">4.8 / 5</span>
          </div>
          <span className="text-gray-400 text-[10px]">89% success rate</span>
        </div>
      </div>
    </div>
  );
}

/* ── BLOGS: Trending topics + recent articles card ───────────────────────── */
function BlogsCard() {
  const categories = ["Constitutional", "Criminal", "CLAT-UG", "Corporate"];
  const articles = [
    { title: "How to Clear CLAT-UG 2025 in 3 Months", time: "5 min", cat: "CLAT-UG",       catColor: "bg-amber-100 text-amber-700" },
    { title: "Top 10 NLUs to Target for Admission",    time: "3 min", cat: "Career",         catColor: "bg-green-100 text-green-700" },
    { title: "Rights Guaranteed Under Article 21",     time: "4 min", cat: "Constitutional", catColor: "bg-blue-100 text-blue-700"   },
  ];
  const chipColors: Record<string, string> = {
    "Constitutional": "bg-blue-100 text-blue-700",
    "Criminal":       "bg-red-100 text-red-700",
    "CLAT-UG":        "bg-amber-100 text-amber-700",
    "Corporate":      "bg-purple-100 text-purple-700",
  };
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-primary-200" />
        <div>
          <p className="text-white font-bold text-sm">Trending on TLP</p>
          <p className="text-primary-200 text-[10px] mt-0.5">What lawyers are reading</p>
        </div>
      </div>
      {/* Category chips */}
      <div className="px-3 pt-3 pb-1 flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <span key={cat} className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${chipColors[cat]}`}>
            {cat}
          </span>
        ))}
      </div>
      {/* Article list */}
      <div className="px-3 pb-2">
        {articles.map((a, i) => (
          <div key={a.title}>
            <div className="flex items-start gap-2 py-2">
              <BookOpen className="w-3 h-3 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-gray-800 text-[10px] font-semibold leading-snug line-clamp-1">{a.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                  <span className="text-[9px] text-gray-400">{a.time} read</span>
                  <span className={`rounded-full px-1.5 text-[8px] font-semibold ${a.catColor}`}>{a.cat}</span>
                </div>
              </div>
            </div>
            {i < articles.length - 1 && <div className="border-t border-gray-100" />}
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
          <span className="text-primary-700 text-[10px] font-semibold">500+ articles published</span>
          <span className="text-[9px] text-primary-600 font-bold">Browse All →</span>
        </div>
      </div>
    </div>
  );
}

/* ── TESTS: MCQ interface mockup ─────────────────────────────────────────── */
function TestsCard() {
  const options = [
    { label: "A", text: "Article 14 — Equality before Law",    correct: false },
    { label: "B", text: "Article 21 — Right to Life",          correct: true  },
    { label: "C", text: "Article 32 — Right to Remedies",      correct: false },
    { label: "D", text: "Article 51A — Fundamental Duties",    correct: false },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      {/* Header */}
      <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-primary-200" />
          <p className="text-white font-bold text-sm">Mock Test</p>
        </div>
        <span className="text-primary-200 text-[10px] font-medium">Q.7 of 50</span>
      </div>
      {/* Progress */}
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-primary-500" style={{ width: "14%" }} />
      </div>
      {/* Question */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Question 7</p>
        <p className="text-gray-800 text-[11px] font-semibold leading-snug mb-3">
          Which article of the Indian Constitution guarantees the Right to Life and Personal Liberty?
        </p>
        <div className="space-y-1.5">
          {options.map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border text-[10px] font-medium ${
                opt.correct
                  ? "bg-green-50 border-green-400 text-green-800"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${
                opt.correct ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {opt.label}
              </span>
              <span className="leading-snug flex-1">{opt.text}</span>
              {opt.correct && <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3 text-green-500" />
            <span className="text-gray-700 text-[10px] font-bold">6/6 correct</span>
          </div>
          <div className="flex items-center gap-1">
            <AlarmClock className="w-3 h-3 text-amber-500" />
            <span className="text-gray-500 text-[10px]">02:45 remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── QUICKSKILLS: Programme highlights card ──────────────────────────────── */
function QuickSkillsCard() {
  const features = [
    { icon: Video,         label: "Live + Recorded Sessions",   detail: "Attend live or watch later"     },
    { icon: Users,         label: "Industry Expert Mentors",    detail: "Practising lawyers as guides"   },
    { icon: ClipboardList, label: "Project-Based Learning",     detail: "Real-world case assignments"    },
    { icon: Award,         label: "Placement Assistance",       detail: "Career guidance post-programme" },
  ];
  const badges = [
    { label: "Certificate of Completion", color: "bg-green-100 text-green-700"   },
    { label: "6–8 Weeks",                 color: "bg-blue-100 text-blue-700"     },
    { label: "Doubt-Solving Sessions",    color: "bg-purple-100 text-purple-700" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5 flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-primary-200" />
        <div>
          <p className="text-white font-bold text-sm">Programme Highlights</p>
          <p className="text-primary-200 text-[10px] mt-0.5">Expert-led legal programmes</p>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {features.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
            <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3 h-3 text-primary-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 text-[10px] font-semibold leading-none">{label}</p>
              <p className="text-gray-400 text-[9px] mt-0.5">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <span key={b.label} className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${b.color}`}>
            {b.label}
          </span>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-gray-700 text-[10px] font-bold ml-1">4.8</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-[10px]">300+ enrolled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── RESOURCES: download preview card ───────────────────────────────────── */
function ResourcesCard() {
  const items = [
    { icon: ClipboardList, label: "CLAT-PG MCQs — Topic-wise",        tag: "MCQ PDF",  tagColor: "bg-violet-100 text-violet-700" },
    { icon: BookOpen,      label: "Supreme Court Case Summaries",     tag: "Case Laws", tagColor: "bg-amber-100 text-amber-700"  },
    { icon: FileText,      label: "Indian Penal Code — BNS 2023",     tag: "Bare Act", tagColor: "bg-emerald-100 text-emerald-700" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-primary-200" />
        <div>
          <p className="text-white font-bold text-sm">Curated Legal Resources</p>
          <p className="text-primary-200 text-[10px] mt-0.5">Quality over quantity — every file vetted</p>
        </div>
      </div>
      <div className="px-3 pt-3 pb-1">
        {items.map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center gap-2.5 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-[10px] font-semibold leading-snug line-clamp-1">{item.label}</p>
                <span className={`inline-block mt-0.5 rounded-full px-1.5 text-[8px] font-semibold ${item.tagColor}`}>{item.tag}</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Award className="w-3 h-3 text-primary-500" />
              </div>
            </div>
            {i < items.length - 1 && <div className="border-t border-gray-100" />}
          </div>
        ))}
      </div>
      <div className="px-3 pb-3 pt-1">
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-3 py-2 flex items-center gap-2">
          <BadgeCheck className="w-3 h-3 text-primary-600 flex-shrink-0" />
          <span className="text-primary-700 text-[10px] font-semibold">Prepared by practising lawyers &amp; faculty</span>
        </div>
      </div>
    </div>
  );
}

/* ── QUESTION BANK: subject grid + sample MCQ card ──────────────────────── */
function QuestionBankCard() {
  const subjects = [
    { label: "CLAT-UG",            color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "CLAT-PG",            color: "bg-red-50 text-red-700 border-red-100"   },
    { label: "Judiciary",          color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "UGC-NET Law",        color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "LLB Subjects",       color: "bg-purple-50 text-purple-700 border-purple-100" },
    { label: "Govt Law Exams",     color: "bg-orange-50 text-orange-700 border-orange-100" },
  ];
  const sample = [
    { label: "A", text: "Sessions Court",   correct: false },
    { label: "B", text: "High Court",       correct: false },
    { label: "C", text: "Supreme Court",    correct: true  },
    { label: "D", text: "District Court",   correct: false },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5 flex items-center gap-2">
        <ClipboardList className="w-3.5 h-3.5 text-primary-200" />
        <div>
          <p className="text-white font-bold text-sm">Question Bank</p>
          <p className="text-primary-200 text-[10px] mt-0.5">MCQ sets across all law subjects</p>
        </div>
      </div>
      {/* Subject chips */}
      <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
        {subjects.map((s) => (
          <span key={s.label} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${s.color}`}>
            {s.label}
          </span>
        ))}
      </div>
      {/* Sample question */}
      <div className="px-3 pb-1">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sample Question</p>
          <p className="text-gray-800 text-[10px] font-semibold leading-snug mb-2">
            Which court has the final power of judicial review under the Indian Constitution?
          </p>
          <div className="space-y-1">
            {sample.map((opt) => (
              <div key={opt.label} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9px] font-medium border ${
                opt.correct ? "bg-green-50 border-green-300 text-green-800" : "bg-white border-gray-100 text-gray-600"
              }`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${
                  opt.correct ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>{opt.label}</span>
                {opt.text}
                {opt.correct && <CheckCircle className="w-2.5 h-2.5 text-green-500 ml-auto flex-shrink-0" strokeWidth={2.5} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-3 py-2 flex items-center gap-2">
          <BadgeCheck className="w-3 h-3 text-primary-600 flex-shrink-0" />
          <span className="text-primary-700 text-[10px] font-semibold">Crafted by practising lawyers &amp; faculty</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main banner ─────────────────────────────────────────────────────────── */
export default function PageHeroBanner({ title, subtitle, variant = "courses" }: Props) {
  const rightCard =
    variant === "courses"       ? <CoursesCard />      :
    variant === "blogs"         ? <BlogsCard />        :
    variant === "tests"         ? <TestsCard />        :
    variant === "resources"     ? <ResourcesCard />    :
    variant === "question-bank" ? <QuestionBankCard /> :
                                  <QuickSkillsCard />;

  return (
    <section className="w-full bg-white dark:bg-[#030712] pt-[9rem] lg:pt-[8rem] relative overflow-hidden">
      {/* Light mode subtle gradient wash */}
      <div className="dark:hidden absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-slate-100/40" />

      {/* Grid lines — bleeds left, oval-shadowed corners on right */}
      <div className="pointer-events-none absolute inset-0">
        {/* Light mode grid — dark lines */}
        <div className="dark:hidden absolute inset-0 opacity-[0.28]
          [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_42%,black_68%,black_100%)]
          md:[mask-image:linear-gradient(to_right,transparent_0%,transparent_16%,black_44%,black_100%)]
          bg-[linear-gradient(to_right,rgba(15,23,42,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.55)_1px,transparent_1px)]
          bg-[size:28px_28px]" />
        {/* Dark mode grid — white lines */}
        <div className="hidden dark:block absolute inset-0 opacity-[0.22]
          [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_42%,black_68%,black_100%)]
          md:[mask-image:linear-gradient(to_right,transparent_0%,transparent_16%,black_44%,black_100%)]
          bg-[linear-gradient(to_right,rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.7)_1px,transparent_1px)]
          bg-[size:28px_28px]" />
        {/* Light mode corner vignettes — white to frame the grid */}
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_100%_0%,rgba(255,255,255,0.96)_0%,transparent_100%),radial-gradient(ellipse_58%_48%_at_100%_100%,rgba(255,255,255,0.96)_0%,transparent_100%)]" />
        {/* Dark mode corner vignettes — dark to frame the grid */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_100%_0%,rgba(3,7,18,0.92)_0%,transparent_100%),radial-gradient(ellipse_58%_48%_at_100%_100%,rgba(3,7,18,0.92)_0%,transparent_100%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 lg:gap-10 xl:gap-14 md:min-h-[160px] lg:min-h-[200px]">

          {/* ── LEFT ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-2 sm:mb-3">
              {variant === "blogs" ? "News, Analysis & Career Roadmaps" : "The Law Project"}
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-3 md:mb-4">
              {title}
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-5 md:mb-7 max-w-xl leading-relaxed">
              {subtitle}
            </p>
            <ul className="space-y-2 md:space-y-3 mb-5 md:mb-8">
              {bullets[variant].map((b) => (
                <li key={b} className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RIGHT: variant-specific card ──────────────────────────── */}
          <div className="w-full md:w-[260px] lg:w-[320px] xl:w-[360px] flex-shrink-0">
            {rightCard}
          </div>

        </div>
      </div>
    </section>
  );
}
