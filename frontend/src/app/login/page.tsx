"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/auth-context"

const demoAccounts = [
  { role: "Administrateur", username: "a.kaabachi" },
  { role: "Technicien", username: "s.benali" },
  { role: "Consultant", username: "l.hamdi" },
]

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard")
  }, [user, isLoading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login({ username, password })
      toast.success("Connexion réussie")
      router.replace("/dashboard")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de la connexion",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Colonne branding */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-white p-1.5">
            <Image
              src="/comet-logo.png"
              alt="Comet"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-wide">Comet GPI</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Gérez l&apos;ensemble de votre parc informatique
          </h2>
          <p className="max-w-md text-sidebar-foreground/70 text-pretty leading-relaxed">
            Suivez vos matériels, planifiez les réparations, traitez les demandes
            et pilotez vos équipes depuis une plateforme unique.
          </p>
        </div>

        <p className="text-sm text-sidebar-foreground/50">
          Ensemble pour aller plus loin
        </p>
      </div>

      {/* Colonne formulaire */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-3 text-center lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-border">
              <Image
                src="/comet-logo.png"
                alt="Comet"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre espace de gestion du parc informatique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                placeholder="nom.utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Comptes de démonstration (mot de passe libre) :
            </p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username)
                    setPassword("demo")
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-background"
                >
                  <span className="font-medium">{acc.role}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {acc.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
