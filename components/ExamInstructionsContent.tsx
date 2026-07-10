"use client";

import React from "react";

const legendRows = [
  { swatch: "bg-gray-300", text: "You have not visited the question yet." },
  { swatch: "bg-amber-400", text: "You have visited the question but not answered it." },
  { swatch: "bg-emerald-400", text: "You have answered the question." },
  { swatch: "bg-rose-400", text: "You have marked the question for review (with or without an answer saved)." },
];

export default function ExamInstructionsContent({ durationMinutes }: { durationMinutes: number }) {
  return (
    <>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">Please read the instructions carefully</h3>
      <p className="font-semibold text-gray-900 dark:text-white mb-4">General Instructions:</p>

      <ol className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-decimal list-outside ml-5 mb-2">
        <li>Total duration of examination is {durationMinutes} minutes.</li>
        <li>
          The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining
          time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You
          will not be required to end or submit your examination.
        </li>
        <li>The Question Palette displayed on the right side of the screen will show the status of each question using one of the following symbols:</li>
      </ol>

      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-5">
        {legendRows.map((row, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${i % 2 === 1 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}>
            <span className={`w-7 h-7 rounded-full flex-shrink-0 ${row.swatch}`} />
            <span>{row.text}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
        The question(s) &quot;Answered and Marked for Review&quot; will be considered for evaluation.
      </p>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Navigating to a Question:</h3>
      <ol start={4} className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-decimal list-outside ml-5 mb-5">
        <li>
          To answer a question, do the following:
          <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
            <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
            <li>Click on Next to save your answer for the current question and then go to the next question.</li>
          </ul>
        </li>
      </ol>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Answering a Question:</h3>
      <ol start={5} className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-decimal list-outside ml-5 mb-2">
        <li>
          Procedure for answering a multiple choice (MCQ) type question:
          <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
            <li>Choose one answer from the options given below the question, click on the option to select that option.</li>
            <li>To deselect your chosen answer, click on the bubble of the chosen option again.</li>
            <li>To change your chosen answer, click on the bubble of another option.</li>
            <li>To save your answer, you MUST click on Next.</li>
          </ul>
        </li>
        <li>To mark a question for review, click on the star button in the top right corner of the question.</li>
        <li>Note that ONLY questions for which answers are saved or marked for review after answering will be considered for evaluation.</li>
      </ol>
    </>
  );
}
