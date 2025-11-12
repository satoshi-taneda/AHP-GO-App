import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  const { description } = await req.json()
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const prompt = `
    あなたは商品説明の専門家です。
    「${description}」をわかりやすく説明してください。
    ※専門用語は避けて一般の消費者向けに説明してください。
    JSON形式で次の構造で回答してください：
    {
      "summary": [
        { "name": "商品名", "description": "説明" }
      ]
    }
    条件
    ・データ数は1つのみ
    ・nameは20字以内、descriptionは200字以内
    ・nameは名前と説明の情報から最適なものに変更
    ・nameは社名と型番もあればベスト
    ・descriptionは価格もあればベスト
  `
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    // Geminiの出力がJSON文字列なら直接parse
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch {
    // JSONとしてパースできない場合は抽出
    const jsonText = text.match(/\{[\s\S]*\}/)?.[0]
    if (jsonText) return NextResponse.json(JSON.parse(jsonText))
    return NextResponse.json({ error: "JSON抽出に失敗しました", raw: text })
  }
}
