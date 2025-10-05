'use client';
import { useState } from 'react';

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuizData(null);
    setGameStarted(false);
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
      
      setQuizData({
        rawText: data.quiz,
        parsedQuestions: data.parsedQuiz || []
      });
    } catch (err) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleAnswerSelect = (questionIndex, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.parsedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.parsedQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const resetGame = () => {
    setGameStarted(false);
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 15;
    }
  };

  const totalPossiblePoints = quizData ? quizData.parsedQuestions.length * getDifficultyMultiplier() : 0;
  const earnedPoints = score * getDifficultyMultiplier();

  if (showResults && quizData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{score}/{quizData.parsedQuestions.length}</div>
              <div className="text-gray-300">Correct Answers</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{earnedPoints}</div>
              <div className="text-gray-300">Points Earned</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round((score / quizData.parsedQuestions.length) * 100)}%
              </div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {quizData.parsedQuestions.map((question, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Question {index + 1}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAnswers[index] === question.correctAnswer 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {selectedAnswers[index] === question.correctAnswer ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              
              <p className="text-lg mb-4 text-gray-100">{question.question}</p>
              
              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                  const optionLetter = option[0];
                  const isSelected = selectedAnswers[index] === optionLetter;
                  const isCorrect = optionLetter === question.correctAnswer;
                  
                  return (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected && isCorrect
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : isSelected && !isCorrect
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : isCorrect && showResults
                          ? 'bg-green-500/10 border-green-500/50 text-green-300'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {option}
                      {isSelected && !isCorrect && (
                        <span className="ml-2 text-red-400 text-sm">(Your choice)</span>
                      )}
                      {isCorrect && showResults && (
                        <span className="ml-2 text-green-400 text-sm">✓ Correct answer</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {question.explanation && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <strong className="text-blue-300">Explanation:</strong>
                  <p className="text-blue-200 mt-1">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={resetGame}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-semibold transition"
          >
            🎮 Play Again
          </button>
          <button
            onClick={() => {
              setGameStarted(false);
              setShowResults(false);
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-semibold transition"
          >
            📝 Generate New Quiz
          </button>
        </div>
      </div>
    );
  }

  if (gameStarted && quizData) {
    const currentQuestion = quizData.parsedQuestions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {quizData.parsedQuestions.length}
            </span>
            <span className="text-sm font-semibold text-cyan-400">
              Points: {currentQuestionIndex * getDifficultyMultiplier()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quizData.parsedQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = option[0];
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, optionLetter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === optionLetter
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            ← Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswers[currentQuestionIndex]}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            {currentQuestionIndex === quizData.parsedQuestions.length - 1 ? 'Finish Quiz 🏁' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

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
              <option value="easy">Easy (10 points/question)</option>
              <option value="medium">Medium (20 points/question)</option>
              <option value="hard">Hard (30 points/question)</option>
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

        {quizData && !gameStarted && (
          <div className="mt-6 text-center">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">Quiz Ready! 🎯</h2>
              <p className="text-gray-300 mb-4">
                Your {difficulty} quiz with {quizData.parsedQuestions.length} questions is ready to play!
                <br />
                Maximum points: <span className="font-bold text-yellow-400">{totalPossiblePoints}</span>
              </p>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition"
              >
                Start Game 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}