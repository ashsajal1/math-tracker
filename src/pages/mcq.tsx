import { useState } from "react";

type QuizQ = {
  id: number; // the number value used to build question
  question: string;
  options: string[];
  answer: string;
};

function sampleRange(min: number, max: number, count: number) {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  const res: number[] = [];
  const p = pool.slice();
  while (res.length < count && p.length) {
    const idx = Math.floor(Math.random() * p.length);
    res.push(p.splice(idx, 1)[0]);
  }
  return res;
}

export default function McqPage() {
  // controls for range + size
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(10);
  const [size, setSize] = useState<number>(5);

  // quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>(() =>
    sampleRange(1, 10, 5).map((n) => ({
      id: n,
      question: `Select the correct number: ${n}`,
      options: ["K", "L", "M", "N"],
      answer: "",
    }))
  );

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // manual review key overrides
  const [editKeyMode, setEditKeyMode] = useState(false);
  const [keyOverrides, setKeyOverrides] = useState<Record<number, string>>({});

  const answeredCount = Object.keys(selectedAnswers).length;

  const generateQuiz = () => {
    const rmin = Math.min(min, max);
    const rmax = Math.max(min, max);
    const available = rmax - rmin + 1;
    const take = Math.max(1, Math.min(size, available));
    const picks = sampleRange(rmin, rmax, take);
    const qs: QuizQ[] = picks.map((n) => {
      const options: string[] = ["K", "L", "M", "N"];

      return {
        id: n,
        question: `MCQ: ${n}`,
        options,
        answer: String(n),
      };
    });

    setQuizQuestions(qs.sort((a, b) => a.id - b.id));
    setSelectedAnswers({});
    setShowResults(false);
    setScore(null);
    setKeyOverrides({});
    setEditKeyMode(false);
  };

  const handleOptionClick = (questionIndex: number, option: string) => {
    if (showResults && !editKeyMode) return; // lock answers when showing results (unless editing key)
    if (editKeyMode && showResults) {
      // in key edit mode, set the override key
      setKeyOverrides((prev) => ({ ...prev, [questionIndex]: option }));
      return;
    }
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleCheckAnswers = () => {
    let s = 0;
    quizQuestions.forEach((q, idx) => {
      const key = keyOverrides[idx] ?? q.answer;
      if (selectedAnswers[idx] && selectedAnswers[idx] === key) s += 1;
    });
    setScore(s);
    setShowResults(true);
    setEditKeyMode(false);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(null);
    setKeyOverrides({});
    setEditKeyMode(false);
  };

  const handleToggleEditKey = () => {
    if (!showResults) return;
    setEditKeyMode((v) => !v);
  };

  const handleApplyKey = () => {
    // recompute
    let s = 0;
    quizQuestions.forEach((q, idx) => {
      const key = keyOverrides[idx] ?? q.answer;
      if (selectedAnswers[idx] && selectedAnswers[idx] === key) s += 1;
    });
    setScore(s);
    setEditKeyMode(false);
    setShowResults(true);
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Quick MCQ Practice
        </h1>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <label className="flex flex-col text-sm">
            <span className="text-slate-600 dark:text-slate-300">Min</span>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="mt-1 px-2 py-1 rounded border"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-slate-600 dark:text-slate-300">Max</span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="mt-1 px-2 py-1 rounded border"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Questions
            </span>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-1 px-2 py-1 rounded border"
              min={1}
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={generateQuiz}
            className="px-3 py-2 rounded-md bg-blue-600 text-white"
          >
            Generate Quiz
          </button>

          <p className="ml-3 text-sm text-slate-600 dark:text-slate-300">
            {answeredCount}/{quizQuestions.length} answered
          </p>
        </div>
      </header>

      <main className="space-y-4 grid gap-4 grid-cols-3 md:grid-cols-5">
        {quizQuestions.map((mcq, index) => {
          const selected = selectedAnswers[index];
          const currentKey = keyOverrides[index] ?? mcq.answer;
          return (
            <section
              key={mcq.id}
              className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {mcq.question}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  #{index + 1}
                </span>
              </div>

              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mcq.options.map((option, idx) => {
                  const isSelected = selected === option;
                  const isCorrect = option === currentKey;

                  let stateClasses =
                    "bg-gray-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100";

                  if (showResults) {
                    if (isSelected && isCorrect) {
                      stateClasses = "bg-emerald-600 text-white";
                    } else if (isSelected && !isCorrect) {
                      stateClasses = "bg-rose-600 text-white";
                    } else if (!isSelected && isCorrect) {
                      stateClasses =
                        "ring-2 ring-emerald-400/30 bg-white dark:bg-neutral-800";
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
                          <div className="flex items-center gap-2">
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
                            {editKeyMode && currentKey === option && (
                              <span className="text-xs font-medium text-amber-100">
                                Key
                              </span>
                            )}
                          </div>
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
          Submit Answers
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-md bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100"
        >
          Reset
        </button>

        {showResults && (
          <>
            <button
              onClick={handleToggleEditKey}
              className={`px-3 py-2 rounded-md ${
                editKeyMode
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100"
              }`}
            >
              {editKeyMode ? "Editing Key" : "Review Key"}
            </button>

            {editKeyMode ? (
              <button
                onClick={handleApplyKey}
                className="px-3 py-2 rounded-md bg-emerald-600 text-white ml-2"
              >
                Apply Key
              </button>
            ) : null}

            {showResults && score !== null && (
              <div className="ml-auto text-sm font-medium text-slate-900 dark:text-slate-100">
                Score:{" "}
                <span className="font-semibold">
                  {score}/{quizQuestions.length}
                </span>
              </div>
            )}
          </>
        )}
      </footer>
    </div>
  );
}
