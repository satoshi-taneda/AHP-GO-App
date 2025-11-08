import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Supabaseクライアント設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, //セッション情報（認証トークンなど）をブラウザに紐づくローカルストレージに保存
    autoRefreshToken: true, // トークンの有効期限が近づいたら自動で更新する
    detectSessionInUrl: true, // URLにセッション情報がある場合、それを検出してログイン状態を初期化する
  }
})

// 【例】ユーザーIDを文字列として正規化する関数
export function normalizeUserId(userId: any): string {
  if (userId === null || userId === undefined) return ""
  return String(userId)
}
