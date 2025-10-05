"use client";
import { useState } from "react";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setQuiz([]);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, text, difficulty, questionCount: count }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuiz(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (i, option) => setAnswers({ ...answers, [i]: option });

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">🧩 AI Quiz Generator</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
        <textarea
          placeholder="Paste text (optional)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          rows="4"
        ></textarea>
        <div className="flex gap-3">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min="1"
            max="10"
            className="w-24 p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 p-3 rounded font-semibold transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
        {error && <div className="text-red-400 text-center">{error}</div>}
      </div>

      {quiz.length > 0 && (
        <div className="mt-8 space-y-6">
          {quiz.map((q, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h2 className="font-semibold mb-2">{i + 1}. {q.question}</h2>
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const selected = answers[i];
                  const correct = q.answer;
                  let style = "block p-2 border rounded cursor-pointer";
                  if (selected) {
                    if (opt.startsWith(correct)) style += " border-green-500 bg-green-900/40";
                    else if (opt.startsWith(selected)) style += " border-red-500 bg-red-900/40";
                    else style += " border-gray-600";
                  } else style += " border-gray-600 hover:bg-gray-700";
                  return (
                    <div key={idx} className={style} onClick={() => !selected && handleAnswer(i, opt[0])}>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {answers[i] && (
                <div className="mt-2 text-sm text-gray-300">
                  {answers[i] === q.answer ? "✅ Correct!" : `❌ Correct Answer: ${q.answer}`}
                  <div className="italic text-gray-400">💡 {q.explanation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
