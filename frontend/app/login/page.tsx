"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Lock, User as UserIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard")
    }
  }, [isLoading, user, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      router.replace("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Nom d'utilisateur ou mot de passe incorrect.")
        } else if (err.status === 403) {
          setError("Ce compte est désactivé. Contactez un administrateur.")
        } else {
          setError(err.message)
        }
      } else {
        setError(
          "Impossible de contacter le serveur. Vérifiez votre connexion."
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-primary to-[#0a1c33] p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white p-1.5">
              <Image
                src="/comet-logo.png"
                alt="Logo COMET"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-mono text-xs tracking-widest text-accent uppercase">
              Gestion des parcs informatiques
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-tight text-balance">
              Ensemble pour aller plus loin
            </h1>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Suivez vos matériels, pannes, réparations et demandes
              d&apos;intervention depuis une plateforme unique et sécurisée.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} COMET. Tous droits réservés.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-2 text-center md:hidden">
            <Image
              src="/comet-logo.png"
              alt="Logo COMET"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-card-foreground">
              Connexion
            </h2>
            <p className="text-sm text-muted-foreground">
              Accédez à votre espace de gestion du parc informatique.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex. jdupont"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
