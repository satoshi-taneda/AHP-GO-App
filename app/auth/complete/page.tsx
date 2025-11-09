"use client"

import { Check } from "lucide-react"

export default function SignupConfirm() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Check className="bg-green-500 text-green-50 shadow-lg rounded-full p-2 border" size={32} />
          <h1 className="text-2xl font-semibold">登録が完了しました！</h1>
        </div>
        <p className="text-gray-600 mb-4">
          確認メールを送信しました。メール本文のリンクをクリックすると認証が完了します。
        </p>
      </div>
    </div>
  )
}
