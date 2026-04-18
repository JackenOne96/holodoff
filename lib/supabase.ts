import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null | undefined = undefined

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseClient !== undefined) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    supabaseClient = null
    return null
  }

  supabaseClient = createClient(url, key, {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          mode: "cors",
          credentials: "omit",
        }),
    },
  })

  return supabaseClient
}

// Optional named export for compatibility / convenience.
export const supabase = getSupabase()
