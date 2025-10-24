import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const { productDescription } = await req.json()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      以下の商品情報を150文字以内でわかりやすく要約してください。
      ※専門用語は避けて一般の消費者向けに説明してください。
      <形式>
      商品名: 価格: 商品説明:
      ---
      ${productDescription}
    `
    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    return Response.json({ summary })
  } catch (error) {
    console.error("Gemini API Error:", error)
    return Response.json({ error: "要約に失敗しました。" }, { status: 500 })
  }
}
