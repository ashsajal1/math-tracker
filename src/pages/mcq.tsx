export default function McqPage() {
  const mcqs = Array.from({ length: 10 }, (_, i) => ({
    question: `Sample Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: "Option A",
  }));

  return (
    <div>
      {mcqs.map((mcq, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>{mcq.question}</h3>
          <ul>
            {mcq.options.map((option, idx) => (
              <li key={idx}>{option}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
