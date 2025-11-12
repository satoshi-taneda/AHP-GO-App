import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const { question } = await req.json()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
      あなたはAHP(階層分析法)の専門家です。以下の質問に日本語で丁寧に答えてください。
      質問:
      ${question}
    `
    const result = await model.generateContent(prompt)
    const answer = result.response.text()

    return Response.json({ answer })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return Response.json({ error: "回答が見つかりませんでした。" }, { status: 500 })
  }
}
