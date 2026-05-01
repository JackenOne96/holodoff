"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, RefrigeratorIcon, PlusCircle, KeyRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFridgeStore } from "@/lib/store"
import { getSupabase } from "@/lib/supabase"

export function JoinScreen() {
  const [screen, setScreen] = useState<"choice" | "auth-create" | "auth-join" | "login" | "create" | "join">("choice")
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isAuthResolving, setIsAuthResolving] = useState(true)
  const { joinFamily, createFamily, bypassLogin, isLoading, error: storeError, initialize } = useFridgeStore()

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setIsAuthResolving(false)
      return
    }

    const clearPostAuthUrlState = () => {
      window.localStorage.removeItem("postAuthTarget")
      const params = new URLSearchParams(window.location.search)
      if (params.has("auth_flow")) {
        params.delete("auth_flow")
        const query = params.toString()
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
        window.history.replaceState({}, "", nextUrl)
      }
    }

    let isCancelled = false
    const resolveSessionRouting = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (isCancelled) return

      const user = sessionData.session?.user
      if (!user) {
        setIsAuthResolving(false)
        return
      }

      setError("")
      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("id,family_id")
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (memberError) {
        setError(memberError.message)
        setIsAuthResolving(false)
        return
      }

      if (memberData?.family_id) {
        await initialize()
      }
      if (isCancelled) return

      if (memberData?.family_id) {
        clearPostAuthUrlState()
        setIsAuthResolving(false)
        return
      }

      setScreen("create")
      clearPostAuthUrlState()
      setIsAuthResolving(false)
    }

    void resolveSessionRouting()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) return
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return
      void resolveSessionRouting()
    })

    return () => {
      isCancelled = true
      subscription.unsubscribe()
    }
  }, [initialize])

  const signInWithYandex = async (target: "create" | "join") => {
    const supabase = getSupabase()
    if (!supabase) {
      setError("Supabase env не настроен")
      return
    }

    setError("")
    window.localStorage.setItem("postAuthTarget", target)
    const redirectTo = `${window.location.origin}/?auth_flow=${target}`
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "custom:yandex",
      options: { redirectTo },
    })

    if (oauthError) {
      setError(oauthError.message)
      return
    }

    if (data?.url) {
      window.location.href = data.url
    }
  }

  const signUpWithEmail = async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setError("Supabase env не настроен")
      return false
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    })
    if (signUpError) {
      setError(signUpError.message)
      return false
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })
    if (signInError) {
      setError(signInError.message)
      return false
    }
    return true
  }

  const signInWithEmail = async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setError("Supabase env не настроен")
      return false
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })
    if (signInError) {
      setError(signInError.message)
      return false
    }
    return true
  }

  const handleAuthThenContinue = async (target: "create" | "join" | "login") => {
    setError("")
    if (!email.trim() || !password.trim()) {
      setError("Введите Email и пароль")
      return
    }
    const ok = target === "login" ? await signInWithEmail() : await signUpWithEmail()
    if (!ok) return
    setScreen(target === "login" ? "join" : target)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (screen === "create") {
      const success = await createFamily()
      if (!success) setError(storeError || "Не удалось создать группу")
      return
    }

    if (screen === "join") {
      if (code.length !== 6) {
        setError("Код должен состоять из 6 символов")
        return
      }
      if (code === "123456") {
        bypassLogin()
        return
      }
      const success = await joinFamily(code)
      if (!success) {
        setError(storeError || "Неверный код. Попробуйте снова.")
      }
    }
  }

  if (isAuthResolving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-100 to-cyan-100 px-6">
        <p className="text-sm text-gray-500">Проверка входа...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-cyan-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-sm flex-col items-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg"
        >
          <RefrigeratorIcon className="h-10 w-10 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Семейный холодильник</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Выберите способ продолжения</p>

        {/* Form */}
        {screen === "choice" && (
          <div className="w-full space-y-3">
            <Button
              type="button"
              onClick={() => setScreen("auth-create")}
              className="h-16 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-base font-semibold"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Создать семейную группу
            </Button>
            <Button
              type="button"
              onClick={() => setScreen("auth-join")}
              variant="outline"
              className="h-16 w-full rounded-2xl border-2 text-base font-semibold"
            >
              <Users className="mr-2 h-5 w-5" />
              Присоединиться к группе
            </Button>
            <button type="button" onClick={() => setScreen("login")} className="w-full text-sm text-blue-600 hover:underline">
              Уже есть аккаунт? Войти
            </button>
          </div>
        )}

        {(screen === "auth-create" || screen === "auth-join" || screen === "login") && (
          <div className="w-full space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500"
              onClick={() =>
                void handleAuthThenContinue(screen === "auth-create" ? "create" : screen === "auth-join" ? "join" : "login")
              }
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {screen === "login" ? "Войти" : "Зарегистрироваться"}
            </Button>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                onClick={() => void signInWithYandex(screen === "auth-create" ? "create" : "join")}
                className="h-12 rounded-xl bg-black text-white hover:bg-black/90"
              >
                <span
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 rounded-sm bg-white bg-center bg-no-repeat"
                  style={{
                    backgroundImage: "url('https://yastatic.net/s3/home-static/_/b/be/YandexLogo.svg')",
                    backgroundSize: "14px 14px",
                  }}
                />
                Войти через Яндекс ID
              </Button>
            </div>
          </div>
        )}

        {(screen === "create" || screen === "join") && (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {screen === "join" ? (
              <div className="relative">
                <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="______"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 6)
                    setCode(value)
                    setError("")
                  }}
                  maxLength={6}
                  className="h-14 rounded-2xl border-2 border-gray-200 bg-white pl-12 text-center font-mono text-2xl tracking-[0.5em] placeholder:tracking-[0.5em] focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm text-cyan-700">
                Будет создана новая семейная группа
              </p>
            )}
            <Button
              type="submit"
              disabled={(screen === "join" ? code.length !== 6 : false) || isLoading}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Подключение..." : screen === "create" ? "Создать группу" : "Присоединиться к семье"}
            </Button>
          </form>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {screen !== "choice" && (
          <button type="button" onClick={() => setScreen("choice")} className="mt-4 text-xs text-gray-500 hover:underline">
            Назад к выбору действия
          </button>
        )}

        <div className="mt-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={bypassLogin}
            className="h-12 w-full rounded-2xl border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Dev Bypass
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">Попросите код у создателя группы</p>
        
      </motion.div>
    </div>
  )
}
