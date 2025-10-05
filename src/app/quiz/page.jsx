'use client';
import { useState } from 'react';

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuiz('');
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          text,
          difficulty,
          questionCount,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuiz(data.quiz || 'No quiz generated.');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-center">🧩 AI Quiz Generator</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Topic (optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Effects of microgravity on plant growth"
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Custom Text (optional)</label>
          <textarea
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste research text or abstract..."
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none"
          ></textarea>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">Number of Questions</label>
            <input
              type="number"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              min="1"
              max="10"
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Generating Quiz...' : 'Generate Quiz 🪄'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-600/20 border border-red-500/40 text-red-300 rounded-lg">
            ❌ {error}
          </div>
        )}

        {quiz && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700 whitespace-pre-wrap text-gray-100">
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">Generated Quiz</h2>
            {quiz}
          </div>
        )}
      </div>
    </div>
  );
}
