import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
    const { goal } = await req.json()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      あなたはAHP（階層分析法）の専門家です。
        最終目標「${goal}」を達成するために最適な評価基準を提案してください。
        各評価基準には簡潔な説明をつけてください。
        JSON形式で次の構造で回答してください：
        {
          "criteria": [
            { "name": "評価基準1", "description": "説明文" },
            { "name": "評価基準2", "description": "説明文" },
            ...
          ]
        }
        ただし、nameは「拡張性・保守性」など二つに分けないようお願いします。
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
