import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mmlzlnvbwuwffaakscvm.supabase.co"

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_jAcSv5h844hiP9nNApoE2A_C6xjEB-d"

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase env is not configured correctly")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        mode: "cors",
        credentials: "omit",
      }),
  },
})
