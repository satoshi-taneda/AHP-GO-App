import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
    const { strResult } = await req.json()
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        あなたはAHP（階層分析法）の専門家です。
        AHPを実施した結果は以下のようになりました。実施結果の考察をお願いします。
        ${strResult}
        次のJSON構造で考察を回答してください。データの数は1つのみで構いません。
          {
            "review": [
              { "description": "考察" }
            ]
          }
      `
    })

    const text = response.text!.trim()

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
