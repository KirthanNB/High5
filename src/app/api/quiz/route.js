import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, topic, difficulty = "medium", questionCount = 5 } = await req.json();

    if (!text && !topic) {
      return NextResponse.json({ error: "Missing text or topic for quiz generation" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key.");

    const prompt = `
Generate a quiz based on the following research or topic.
Each question should include exactly 4 options (A–D) and clearly mention the correct answer at the end.

Topic: ${topic || "N/A"}
Difficulty: ${difficulty}
Number of Questions: ${questionCount}

Source text (if available):
${text?.substring(0, 4000) || "No text provided."}

Format each question EXACTLY like this:
1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Answer: [Correct letter only - A, B, C, or D]

Ensure each question follows this format precisely for proper parsing.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Quiz API error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const quizText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No quiz generated.";

    // Parse the quiz into structured format
    const parsedQuiz = parseQuiz(quizText);
    
    return NextResponse.json({ 
      quiz: quizText,
      parsedQuiz: parsedQuiz
    });
  } catch (error) {
    console.error("Quiz route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseQuiz(quizText) {
  const questions = [];
  const lines = quizText.split('\n');
  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line starts with a number (new question)
    if (/^\d+\./.test(line)) {
      if (currentQuestion) questions.push(currentQuestion);
      
      currentQuestion = {
        question: line.replace(/^\d+\.\s*/, ''),
        options: [],
        correctAnswer: '',
        explanation: ''
      };
    }
    // Check for options (A), B), etc.
    else if (/^[A-D]\)/.test(line) && currentQuestion) {
      currentQuestion.options.push(line);
    }
    // Check for answer
    else if (line.toLowerCase().startsWith('answer:') && currentQuestion) {
      const answerMatch = line.match(/[A-D]/);
      if (answerMatch) {
        currentQuestion.correctAnswer = answerMatch[0];
      }
    }
  }

  // Add the last question
  if (currentQuestion) questions.push(currentQuestion);

  return questions;
}