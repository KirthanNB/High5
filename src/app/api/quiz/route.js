import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, topic, difficulty = "medium", questionCount = 5 } = await req.json();

    if (!text && !topic) {
      return NextResponse.json(
        { error: "Missing text or topic for quiz generation" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key.");

    const prompt = `
      Generate a quiz in JSON format. Each question must have:
      - "question"
      - "options" (4 strings labeled A–D)
      - "answer" (correct option letter)
      - "explanation" (short reason)

      Example:
      [
        {
          "question": "What is microgravity?",
          "options": ["A) Strong gravity", "B) Weak gravity", "C) No gravity", "D) Earth's gravity"],
          "answer": "B",
          "explanation": "Microgravity means very weak gravity conditions."
        }
      ]

      Topic: ${topic || "N/A"}
      Difficulty: ${difficulty}
      Number of Questions: ${questionCount}

      Source text:
      ${text?.substring(0, 4000) || "No additional text provided."}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

    let quizJson = [];
    try {
      quizJson = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
      );
    } catch (e) {
      console.error("JSON Parse Error:", e);
    }

    return NextResponse.json({ quiz: quizJson });
  } catch (error) {
    console.error("Quiz route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
