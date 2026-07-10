import { Trophy, ClipboardList, Clock, Crosshair } from "lucide-react";

export interface SectionStat {
  subject: string;
  total: number;
  attempted: number;
  score: number;
  timeSecs: number;
  accuracy: number;
}

const fmtSecs = (s: number) => {
  if (s === 0) return "0 sec";
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m} min ${rem} sec` : `${m} min`;
};

/** Compute per-section stats from full review questions + user answers + times */
export function computeSectionalStats(
  questions: Array<{ id: number; subject?: string; correctIndex?: number }>,
  answers: Record<string | number, number>,
  questionTimes: Record<string | number, number>,
  marksPerCorrect: number,
  negativeMark: number
): SectionStat[] {
  const map = new Map<string, { total: number; correct: number; incorrect: number; timeSecs: number }>();

  for (const q of questions) {
    const subj = q.subject?.trim() || "General";
    if (!map.has(subj)) map.set(subj, { total: 0, correct: 0, incorrect: 0, timeSecs: 0 });
    const s = map.get(subj)!;
    s.total++;

    const ans = answers[q.id] ?? answers[String(q.id)];
    if (ans !== undefined && ans !== null) {
      if (q.correctIndex !== undefined && Number(ans) === q.correctIndex) s.correct++;
      else s.incorrect++;
    }

    s.timeSecs += Number(questionTimes[q.id] ?? questionTimes[String(q.id)] ?? 0);
  }

  return Array.from(map.entries()).map(([subject, s]) => ({
    subject,
    total: s.total,
    attempted: s.correct + s.incorrect,
    score: Math.max(0, +(s.correct * marksPerCorrect - s.incorrect * negativeMark).toFixed(2)),
    timeSecs: s.timeSecs,
    accuracy: (s.correct + s.incorrect) > 0
      ? Math.round((s.correct / (s.correct + s.incorrect)) * 100)
      : 0,
  }));
}

export default function SectionalSummary({ sections }: { sections: SectionStat[] }) {
  if (sections.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sectional Summary</h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <th className="text-left px-5 py-4 font-semibold text-gray-600 dark:text-gray-300">Subject Name</th>
              <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-emerald-600" />
                  </span>
                  Score
                </span>
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-3 h-3 text-blue-600" />
                  </span>
                  Questions Attempted
                </span>
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-amber-600" />
                  </span>
                  Time Taken
                </span>
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crosshair className="w-3 h-3 text-purple-600" />
                  </span>
                  Attempt Accuracy
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {sections.map((sec) => (
              <tr key={sec.subject} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-white">{sec.subject}</td>
                <td className="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300">{sec.score}</td>
                <td className="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300">{sec.attempted}</td>
                <td className="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300">{fmtSecs(sec.timeSecs)}</td>
                <td className="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300">{sec.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
