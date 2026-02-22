'use client'

import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { CardContent, CardFooter } from "./ui/card"
import { Label } from "./ui/label"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { loginAction, signUpAction } from "@/actions/userActions"

type Props = {
  type: "login" | "signup"
}

function AuthForm({ type }: Props) {
  const isLogin = type === "login"
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const naam = formData.get('naam') as string

      if (isLogin) {
        await loginAction(email, password)
        toast.success('Login gelukt!')
        router.push('/')
      } else {
        await signUpAction(email, password, naam)
        toast.success('Account aangemaakt!')
        router.push('/login')
      }
    })
  }

  return (
    // De wrapper zorgt voor het 'glass' effect
    <div className="min-h-[400px] w-full max-w-md mx-auto p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{isLogin ? "Welkom terug" : "Account maken"}</h1>
        <p className="text-white/60 text-sm">Voer je gegevens in om verder te gaan</p>
      </div>

      <form action={handleSubmit}>
        <CardContent className="grid w-full items-center gap-6 p-0">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email" className="text-white ml-1">Email</Label>
            <input
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              type="email"
              id="email"
              name="email"
              placeholder="naam@voorbeeld.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password" university-card className="text-white ml-1">Wachtwoord</Label>
            <input
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          {!isLogin&& <div className="flex flex-col space-y-2">
            <Label htmlFor="naam" className="text-white ml-1">user naam</Label>
            <input
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              type="text"
              id="naam"
              name="naam"
              placeholder="naam"
              required
              disabled={isPending}
            />
          </div>}
        </CardContent>

        <CardFooter className="mt-8 flex flex-col gap-4 p-0">
          <button 
            disabled={isPending}
            className="w-full h-10 inline-flex items-center justify-center rounded-md bg-white text-black font-medium transition-colors hover:bg-white/90 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? "Inloggen" : "Registreren"}
          </button>

          <p className="text-sm text-white/60 text-center">
            {isLogin ? "Nog geen account?" : "Heb je al een account?"}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="ml-2 text-white font-semibold hover:underline"
            >
              {isLogin ? "Meld je aan" : "Log in"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </div>
  )
}

export default AuthForm