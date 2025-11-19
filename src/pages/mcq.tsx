import { Button } from "@/components/ui/button";
import { mcqStore } from "@/lib/store/mcqStore";
import { topicStore, Topic } from "@/lib/store/topicStore";
import { useState, useEffect } from "react";

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
  const [max, setMax] = useState<number>(50);
  const [size, setSize] = useState<number>(25);

  // quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // manual review key overrides
  const [editKeyMode, setEditKeyMode] = useState(false);
  const [keyOverrides, setKeyOverrides] = useState<Record<number, string>>({});

  const answeredCount = Object.keys(selectedAnswers).length;

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const [timerActive, setTimerActive] = useState(false);

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
        question: `${n}`,
        options,
        answer: "",
      };
    });

    setQuizQuestions(qs.sort((a, b) => a.id - b.id));
    setSelectedAnswers({});
    setShowResults(false);
    setScore(null);
    setKeyOverrides({});
    setEditKeyMode(false);

    // Set timer: 1 min per question
    setTimeLeft(qs.length * 60);
    setTimerActive(true);
  };

  // Timer effect (only display, no auto-submit)
  useEffect(() => {
    if (!timerActive || timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Format timer display
  function formatTime(sec: number | null) {
    if (sec === null) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
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
    setQuizQuestions([]);
    setTimeLeft(null);
    setTimerActive(false);
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

  // saved batches local state (subscribe to store updates so UI updates when batches change)
  const [savedQuestionsBatches, setSavedQuestionsBatches] = useState(
    mcqStore.getState().questionsBatch
  );

  useEffect(() => {
    const unsub = mcqStore.subscribe((state) => {
      setSavedQuestionsBatches(state.questionsBatch);
    });
    return () => unsub();
  }, []);

  // saved info to show confirmation after saving
  const [savedInfo, setSavedInfo] = useState<{
    saved: boolean;
    score?: number;
  } | null>(null);

  // save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [topics, setTopics] = useState<Topic[]>(topicStore.getState().topics);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    topics.length > 0 ? topics[0].id : null
  );
  const [chapterInput, setChapterInput] = useState<string>("Practice");

  useEffect(() => {
    const unsub = topicStore.subscribe((state) => setTopics(state.topics));
    return () => unsub();
  }, []);

  const handleSaveBatch = () => {
    // open dialog to choose topic/chapter
    if (quizQuestions.length === 0) return;
    setShowSaveDialog(true);
    // ensure a selected topic exists
    setSelectedTopicId((prev) => prev ?? (topics.length > 0 ? topics[0].id : null));
  };

  const confirmSaveBatch = () => {
    if (quizQuestions.length === 0) return;

    const questionsWithUserAnswers: QuizQ[] = quizQuestions.map((q, idx) => ({
      ...q,
      answer: selectedAnswers[idx] ?? "",
    }));

    const topicObj = topics.find((t) => t.id === selectedTopicId);
    const topicName = topicObj ? topicObj.topic : "General";

    const batch = {
      questions: questionsWithUserAnswers,
      title: `MCQ Practice - ${new Date().toLocaleString()}`,
      topic: topicName,
      chapter: chapterInput || "Practice",
      createdAt: new Date().toISOString(),
    };

    mcqStore.getState().addQuestionsBatch(batch);

    // compute saved score
    let savedScore = 0;
    questionsWithUserAnswers.forEach((_, idx) => {
      const key = keyOverrides[idx] ?? quizQuestions[idx].answer;
      if ((selectedAnswers[idx] ?? "") !== "" && (selectedAnswers[idx] ?? "") === key) {
        savedScore += 1;
      }
    });

    setSavedInfo({ saved: true, score: savedScore });
    setShowSaveDialog(false);
  };

  return (
    <div className="max-w-full mx-auto p-1 sm:p-6">
      {formatTime(timeLeft)} {/* Timer Display */}

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-11/12 max-w-lg">
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Save quiz as batch
            </h3>
            <label className="block text-sm mb-2">
              Topic
              <select
                value={selectedTopicId ?? ""}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="mt-1 w-full px-2 py-1 rounded border dark:bg-neutral-700"
              >
                {topics.length === 0 && <option value="">(no topics)</option>}
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {`${t.subject} / ${t.topic}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm mb-4">
              Chapter
              <input
                type="text"
                value={chapterInput}
                onChange={(e) => setChapterInput(e.target.value)}
                className="mt-1 w-full px-2 py-1 rounded border dark:bg-neutral-700"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1 rounded bg-slate-100 dark:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveBatch}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {quizQuestions.length === 0 && (
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
                className="mt-1 px-2 py-1 rounded border dark:bg-neutral-800 dark:border-neutral-700"
              />
            </label>

            <label className="flex flex-col text-sm">
              <span className="text-slate-600 dark:text-slate-300">Max</span>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="mt-1 px-2 py-1 rounded border dark:bg-neutral-800 dark:border-neutral-700"
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
                className="mt-1 px-2 py-1 rounded border dark:bg-neutral-800 dark:border-neutral-700"
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
      )}
      {savedQuestionsBatches.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No quiz generated. Please set the range and size, then click "Generate
          Quiz" to start practicing.
        </p>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {savedQuestionsBatches.map((batch, index) => (
            <button
              key={index}
              onClick={() => {
                setQuizQuestions(batch.questions);
                setSelectedAnswers({});
                setShowResults(false);
                setScore(null);
                setKeyOverrides({});
                setEditKeyMode(false);
                setTimerActive(false);
              }}
            >
              {batch.title}
            </button>
          ))}
        </p>
      )}
      <main className="space-y-4 grid gap-1 grid-cols-2 md:grid-cols-3 text-sm">
        {quizQuestions.map((mcq, index) => {
          const selected = selectedAnswers[index];
          const currentKey = keyOverrides[index] ?? mcq.answer;
          return (
            <section
              key={mcq.id}
              className="bg-white flex items-center dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between relative">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {mcq.question}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-300 absolute -top-6 right-4 bg-primary-foreground px-1 rounded">
                  #{index + 1}
                </span>
              </div>

              <ul className="gap-1 flex items-center">
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
                        className={`w-full text-left rounded-md px-3 py-1 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-400 ${stateClasses}`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          <div className="flex items-center gap-2">
                            {showResults && isSelected && !isCorrect && (
                              <span className="text-xs font-medium text-rose-100"></span>
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
        {editKeyMode || quizQuestions.length === 0 || showResults ? null : (
          <button
            onClick={handleCheckAnswers}
            disabled={answeredCount === 0 || showResults}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}

        {(editKeyMode || showResults) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100"
          >
            Reset
          </button>
        )}
        {showResults && (
          <>
            {editKeyMode
              ? null
              : showResults && (
                  <button
                    onClick={handleToggleEditKey}
                    className={`px-3 py-2 rounded-md ${
                      editKeyMode
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    Review
                  </button>
                )}

            {editKeyMode ? (
              <button
                onClick={handleApplyKey}
                className="px-3 py-2 rounded-md bg-emerald-600 text-white ml-2"
              >
                Apply
              </button>
            ) : null}

            {showResults && score !== null && (
              <div className="ml-auto text-sm font-medium text-slate-900 dark:text-slate-100">
                Score:{" "}
                <span className="font-semibold">
                  {score}/{quizQuestions.length}
                </span>
                <Button onClick={handleSaveBatch}>Save</Button>
                {savedInfo && savedInfo.saved ? (
                  <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">
                    Saved ({savedInfo.score}/{quizQuestions.length})
                  </span>
                ) : null}
              </div>
            )}
          </>
        )}
      </footer>
    </div>
  );
}
