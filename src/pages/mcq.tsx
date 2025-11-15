import { useState } from "react";

export default function McqPage() {
  const mcqs = Array.from({ length: 10 }, (_, i) => ({
    question: `Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: "Option A",
  }));

  const handleMcqAnswer = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});

  return (
    <div>
      {mcqs.map((mcq, index) => (
        <div key={index} className="flex items-center">
          <h3>{mcq.question}</h3>
          <ul className="flex items-center gap-2">
            {mcq.options.map((option, idx) => (
              <li
                className={`rounded p-2 ${
                  selectedAnswers[index] === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } cursor-pointer`}
                onClick={() => handleMcqAnswer(index, option)}
                key={idx}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
