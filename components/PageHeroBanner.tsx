import {
  CheckCircle, Star,
  Video, FileText, Award, MessageCircle, ClipboardList,
  BookOpen, Clock, TrendingUp,
  Target, AlarmClock, BarChart2,
  BadgeCheck, Users, Calendar,
} from "lucide-react";

export type BannerVariant = "courses" | "blogs" | "tests" | "quickskills";

interface Props {
  title: string;
  subtitle: string;
  variant?: BannerVariant;
}

const bullets: Record<BannerVariant, string[]> = {
  courses: [
    "HD video lectures with downloadable PDF notes for every module",
    "Chapter-wise MCQs to test understanding after each lesson",
    "Live doubt-clearing sessions with expert faculty",
    "Skill India certified certificate upon completion",
  ],
  blogs: [
    "In-depth legal analysis written by practising lawyers",
    "CLAT prep guides, case summaries and judgment breakdowns",
    "Career advice on internships, moot courts and NLU admissions",
    "New articles published every week across all law areas",
  ],
  tests: [
    "Full-length CLAT, Judiciary and Bar Council mock tests",
    "Section-wise tests to precisely target your weak areas",
    "Detailed answer explanations reviewed by legal experts",
    "Performance analytics to track your improvement over time",
  ],
  quickskills: [
    "Live and recorded sessions led by industry-expert lawyers",
    "Project-based curriculum with real-world case studies",
    "Skill India and NSDC certified certificates on completion",
    "Placement assistance and career guidance post-programme",
  ],
};

const stats = [
  { value: "10,000+", label: "Students Enrolled" },
  { value: "500+",    label: "Practice Tests"    },
  { value: "50+",     label: "Expert Faculty"    },
];

/* ── COURSES: What's Included card ───────────────────────────────────────── */
function CoursesCard() {
  const resources = [
    { icon: Video,         label: "HD Video Lectures",          detail: "Watch anytime, anywhere"        },
    { icon: FileText,      label: "Downloadable PDF Notes",     detail: "Curated study material"         },
    { icon: ClipboardList, label: "Chapter-wise MCQs",          detail: "Test after every module"        },
    { icon: Award,         label: "Completion Certificate",     detail: "Industry recognised"            },
    { icon: MessageCircle, label: "Live Doubt-Clearing Sessions", detail: "Q&A with expert faculty"      },
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
  const categories = ["Constitutional", "Criminal", "CLAT Prep", "Corporate"];
  const articles = [
    { title: "How to Clear CLAT 2025 in 3 Months",   time: "5 min", cat: "CLAT Prep",     catColor: "bg-amber-100 text-amber-700" },
    { title: "Top 10 NLUs to Target for Admission",   time: "3 min", cat: "Career",         catColor: "bg-green-100 text-green-700" },
    { title: "Rights Guaranteed Under Article 21",    time: "4 min", cat: "Constitutional", catColor: "bg-blue-100 text-blue-700"   },
  ];
  const chipColors: Record<string, string> = {
    "Constitutional": "bg-blue-100 text-blue-700",
    "Criminal":       "bg-red-100 text-red-700",
    "CLAT Prep":      "bg-amber-100 text-amber-700",
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
    { label: "Skill India Certified", color: "bg-green-100 text-green-700"   },
    { label: "6–8 Weeks",             color: "bg-blue-100 text-blue-700"     },
    { label: "Live Doubt Sessions",   color: "bg-purple-100 text-purple-700" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "tlpFloat 5s ease-in-out infinite" }}>
      <div className="bg-primary-600 px-4 py-3.5 flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-primary-200" />
        <div>
          <p className="text-white font-bold text-sm">Programme Highlights</p>
          <p className="text-primary-200 text-[10px] mt-0.5">Skill India + NSDC Certified</p>
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

/* ── Main banner ─────────────────────────────────────────────────────────── */
export default function PageHeroBanner({ title, subtitle, variant = "courses" }: Props) {
  const rightCard =
    variant === "courses"    ? <CoursesCard />    :
    variant === "blogs"      ? <BlogsCard />      :
    variant === "tests"      ? <TestsCard />      :
                               <QuickSkillsCard />;

  return (
    <section className="w-full bg-white dark:bg-[#030712] pt-[6.5rem] lg:pt-[5.5rem] relative overflow-hidden">
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
      <div className="relative z-10 max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 lg:gap-10 xl:gap-14 md:min-h-[160px] lg:min-h-[200px]">

          {/* ── LEFT ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 md:pl-4 lg:pl-12 xl:pl-16">
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
            <div className="flex items-stretch w-fit rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 divide-x divide-gray-200 dark:divide-white/10 overflow-hidden">
              {stats.map((s) => (
                <div key={s.label} className="px-3 md:px-5 py-2.5 md:py-3">
                  <p className="text-gray-900 dark:text-white font-bold text-base md:text-lg leading-none">{s.value}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-[11px] mt-1 md:mt-1.5 whitespace-nowrap">{s.label}</p>
                </div>
              ))}
            </div>
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
