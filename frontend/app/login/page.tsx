"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("a.karray");
  const [password, setPassword] = useState("comet2024");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-white p-1.5">
            <Image
              src="/images/comet-logo.png"
              alt="Comet"
              width={36}
              height={36}
              className="size-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Comet GPI
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-balance">
            Gérez votre parc informatique en toute simplicité
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75">
            Matériels, réparations, utilisateurs et demandes d&apos;intervention
            centralisés dans une seule plateforme, pensée pour vos équipes IT.
          </p>
        </div>

        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Comet — Ensemble pour aller plus loin.
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-md border border-border bg-card p-2">
              <Image
                src="/images/comet-logo.png"
                alt="Comet"
                width={44}
                height={44}
                className="size-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Comet GPI
            </span>
          </div>

          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre espace de gestion du parc informatique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Identifiant</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="a.karray"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Démo : n&apos;importe quel identifiant et mot de passe non vides
            fonctionnent. Utilisez le sélecteur de rôle une fois connecté.
          </p>
        </div>
      </div>
    </div>
  );
}
