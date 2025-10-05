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
Each question should include options (A–D) and clearly mention the correct answer at the end.

Topic: ${topic || "N/A"}
Difficulty: ${difficulty}
Number of Questions: ${questionCount}

Source text (if available):
${text?.substring(0, 4000) || "No text provided."}

Format like this:
1. [Question]
A) ...
B) ...
C) ...
D) ...
Answer: [Correct Option]
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

    const quizText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No quiz generated.";

    return NextResponse.json({ quiz: quizText });
  } catch (error) {
    console.error("Quiz route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
