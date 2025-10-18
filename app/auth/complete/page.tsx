"use client"

import { CheckCircle } from "lucide-react"

export default function SignupConfirm() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center gap-2">
          <CheckCircle className="text-green-400 text-foreground h-8 w-8" />
          <h1 className="text-2xl font-semibold mb-6">登録が完了しました</h1>
        </div>
        <p className="text-gray-600 mb-6">
          確認メールを送信しました。メール本文のリンクをクリックすると認証が完了します。
        </p>
        <p className="text-gray-500 mb-6">
          認証後はこの画面を閉じて問題ありません。
        </p>
      </div>
    </div>
  )
}
