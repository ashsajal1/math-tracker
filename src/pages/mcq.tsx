import { useMemo, useState } from "react";

export default function McqPage() {
  const mcqs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        question: `Question ${i + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A",
      })),
    []
  );

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const answeredCount = Object.keys(selectedAnswers).length;

  const handleOptionClick = (questionIndex: number, option: string) => {
    if (showResults) return; // lock answers when showing results
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleCheckAnswers = () => {
    let s = 0;
    mcqs.forEach((m, idx) => {
      if (selectedAnswers[idx] && selectedAnswers[idx] === m.answer) s += 1;
    });
    setScore(s);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Quick MCQ Practice
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {answeredCount}/{mcqs.length} answered
        </p>
        <div className="h-2 bg-gray-200 dark:bg-neutral-700 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${(answeredCount / mcqs.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="space-y-4">
        {mcqs.map((mcq, index) => {
          const selected = selectedAnswers[index];
          return (
            <section
              key={index}
              className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {mcq.question}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  {index + 1}
                </span>
              </div>

              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mcq.options.map((option, idx) => {
                  const isSelected = selected === option;
                  const isCorrect = option === mcq.answer;

                  let stateClasses =
                    "bg-gray-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100";

                  if (showResults) {
                    if (isSelected && isCorrect) {
                      stateClasses = "bg-emerald-600 text-white";
                    } else if (isSelected && !isCorrect) {
                      stateClasses = "bg-rose-600 text-white";
                    } else if (!isSelected && isCorrect) {
                      stateClasses = "ring-2 ring-emerald-400/30 bg-white dark:bg-neutral-800";
                    }
                  } else if (isSelected) {
                    stateClasses = "bg-blue-500 text-white";
                  }

                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => handleOptionClick(index, option)}
                        className={`w-full text-left rounded-md px-3 py-2 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-400 ${stateClasses}`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResults && isCorrect && (
                            <span className="text-xs font-medium text-emerald-100">
                              Correct
                            </span>
                          )}
                          {showResults && isSelected && !isCorrect && (
                            <span className="text-xs font-medium text-rose-100">
                              Your answer
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>

      <footer className="mt-6 flex items-center gap-3">
        <button
          onClick={handleCheckAnswers}
          disabled={answeredCount === 0 || showResults}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answers
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-md bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100"
        >
          Reset
        </button>

        {showResults && score !== null && (
          <div className="ml-auto text-sm font-medium text-slate-900 dark:text-slate-100">
            Score: <span className="font-semibold">{score}/{mcqs.length}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
