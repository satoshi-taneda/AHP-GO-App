import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
    const { strResult } = await req.json()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
      あなたはAHP（階層分析法）の専門家です。
      AHPを実施した結果は以下のようになりました。結果の考察をお願いします。
      ${strResult}
      次のJSON構造で考察を回答してください。
        {
          "review": [
            { "description": "考察" }
          ]
        }
    `
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

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
