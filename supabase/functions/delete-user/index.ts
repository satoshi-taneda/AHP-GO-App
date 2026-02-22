import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
}

Deno.serve(async (req) => {

  // ✅ OPTIONS リクエスト対応（CORSプリフライト）
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        {
          status: 400,
          headers: corsHeaders
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // profiles削除
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId)

    // Authユーザー削除
    const { error } =
      await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (err: any) {

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: corsHeaders
      }
    )

  }

})
