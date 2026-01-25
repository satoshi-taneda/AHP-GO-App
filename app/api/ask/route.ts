import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { question } = await req.json()
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        あなたはAHP(階層分析法)の専門家です。以下の質問に日本語で丁寧に答えてください。
        質問:
        ${question}
      `
    })

    const answer = response.text!

    return Response.json({ answer })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return Response.json({ error: "回答が見つかりませんでした。" }, { status: 500 })
  }
}
