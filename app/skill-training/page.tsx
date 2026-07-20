import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeroBanner from "@/components/PageHeroBanner";
import SkillProgrammeGrid from "@/components/SkillProgrammeGrid";
import { BadgeCheck } from "lucide-react";

export default function SkillTrainingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <PageHeroBanner
        title="QuickSkills Programmes"
        subtitle="Practitioner-designed certificate courses built for lawyers at every stage — from your first brief to complex regulatory matters."
        variant="quickskills"
      />

      {/* ── PROGRAMME CARDS ──────────────────────────────────── */}
      <section className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SkillProgrammeGrid />
      </section>

      {/* ── BOTTOM CTA STRIP ─────────────────────────────────── */}
      <section className="bg-primary-600 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BadgeCheck className="w-5 h-5 text-primary-200" />
            <span className="text-primary-200 text-sm font-semibold">Skill India + NSDC Certified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
            Not sure which programme is right for you?
          </h2>
          <p className="text-primary-100 text-sm mb-6 max-w-lg mx-auto">
            Our team can help you choose the right course based on your current practice area and career goals.
          </p>
          <a
            href={`https://wa.me/9555634585?text=${encodeURIComponent("Hi! I'd like to know more about your Skill Training Programmes.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-primary-50 transition-colors"
          >
            Talk to a Counsellor
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
