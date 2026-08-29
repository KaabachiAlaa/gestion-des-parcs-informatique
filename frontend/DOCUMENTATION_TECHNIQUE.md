# Documentation technique — Frontend

Gestion des Parcs Informatiques — Interface web

---

## 1. Vue d'ensemble

Application web de gestion d'un parc informatique : suivi du matériel, des
réparations, des demandes et des utilisateurs. Le frontend est une application
**Next.js (App Router)** qui consomme l'API **FastAPI** existante.

| Élément | Valeur |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| UI | React 19, Tailwind CSS v4, composants Radix UI / shadcn |
| Données | SWR (fetching, cache, revalidation) |
| Graphiques | Recharts |
| Notifications | Sonner (toasts) |
| Icônes | lucide-react |
| Dates | date-fns |
| Backend | API REST FastAPI (`http://127.0.0.1:8000` par défaut) |

---

## 2. Prérequis & démarrage

### Prérequis
- Node.js 20+
- Le backend FastAPI démarré et accessible (voir §7 pour CORS)

### Installation

```bash
cd frontend
npm install
```

### Variables d'environnement

Créer un fichier `.env.local` (basé sur `.env.example`) :

```bash
# URL de base du backend FastAPI
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

> `NEXT_PUBLIC_API_URL` est la **seule** variable requise. Si elle est absente,
> le code retombe sur `http://127.0.0.1:8000`.

### Commandes

```bash
npm run dev     # serveur de développement (HMR)
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # ESLint
```

---

## 3. Structure des dossiers

```
frontend/
├── app/                        # App Router (routes + layouts)
│   ├── (app)/                  # Groupe de routes protégées (nécessite auth)
│   │   ├── layout.tsx          # Shell applicatif + garde d'authentification
│   │   ├── dashboard/          # Tableau de bord
│   │   ├── materials/          # Liste matériel + détail [id]
│   │   ├── repairs/            # Réparations
│   │   ├── requests/           # Demandes
│   │   └── users/              # Utilisateurs
│   ├── login/                  # Page de connexion (publique)
│   ├── layout.tsx              # Layout racine (providers, polices, thème)
│   ├── page.tsx                # Redirection racine
│   └── globals.css             # Styles globaux + tokens de thème
│
├── components/
│   ├── dashboard/              # Cartes stats, graphiques, activité récente
│   ├── layout/                 # app-shell, sidebar, topbar, nav-config
│   ├── materials/              # Formulaire matériel, import Excel
│   ├── repairs/                # Formulaire, détail, historique
│   ├── requests/               # Formulaire, détail
│   ├── users/                  # Formulaire utilisateur
│   ├── print/                  # Rapport imprimable
│   ├── shared/                 # Composants transverses (voir §6)
│   └── ui/                     # Primitives shadcn/Radix (button, dialog, ...)
│
├── lib/
│   ├── api/                    # Couche d'accès à l'API (voir §4)
│   │   ├── config.ts           # URL de base + table des routes
│   │   ├── client.ts           # Client HTTP (fetch, JWT, erreurs)
│   │   ├── services.ts         # Services typés par domaine
│   │   └── mappers.ts          # Conversion réponses API → types front
│   ├── auth/
│   │   ├── auth-context.tsx    # Contexte d'authentification (React Context)
│   │   └── permissions.ts      # RBAC (rôles → permissions)
│   ├── format.ts               # Helpers de formatage (dates, etc.)
│   └── utils.ts                # Utilitaires (cn, ...)
│
├── hooks/
│   └── use-debounce.ts         # Debounce (recherche)
│
├── types/
│   └── index.ts                # Types du domaine (Material, Repair, RoleName…)
│
├── components.json             # Config shadcn (alias, chemin CSS)
├── tsconfig.json               # Alias @/* → ./*
└── .env.example
```

> **Alias d'import** : `@/*` pointe vers la racine `frontend/`
> (ex. `import { can } from "@/lib/auth/permissions"`).

---

## 4. Couche API

Toute communication avec le backend passe par `lib/api/`. Aucun composant
n'appelle `fetch` directement ni ne code d'URL en dur.

### 4.1 `config.ts` — Configuration centrale
- `API_BASE_URL` : lue depuis `NEXT_PUBLIC_API_URL`.
- `API_ROUTES` : table de tous les chemins, alignée **exactement** sur les
  routers FastAPI. Les routes de collection se terminent par `/`
  (ex. `/materials/`) pour éviter la redirection 307 de FastAPI.
- `AUTH_TOKEN_KEY` : clé de stockage du JWT (`comet_gpi_token`).

### 4.2 `client.ts` — Client HTTP
Fonction unique `apiFetch<T>(path, options)` qui centralise :
- **Injection JWT** : ajoute `Authorization: Bearer <token>` automatiquement.
- **Gestion du token** : `getToken` / `setToken` / `clearToken` (localStorage).
- **Décodage JWT** : `getCurrentUserId()` (claim `sub`), `isTokenExpired()`
  (claim `exp`) — décodage du payload sans vérification de signature.
- **Erreurs** : traduit les statuts HTTP en messages français via la classe
  `ApiError` (`status`, `userMessage`, `details`). Gère aussi les erreurs de
  validation 422 (agrège les `msg`) et l'API injoignable (statut `0`).
- **401 automatique** : purge la session et redirige vers `/login`.
- **Multipart** : option `raw: true` pour envoyer un `FormData` (import Excel)
  sans en-tête JSON.

### 4.3 `services.ts` — Services par domaine
Fonctions typées regroupées par ressource : `auth`, `materials`, `repairs`,
`users`, `requests`, `roles`, `categories`, `locations`. Chaque service utilise
`apiFetch` et renvoie des types du domaine.

### 4.4 `mappers.ts` — Adaptation des données
Convertit les schémas de réponse FastAPI en types front (`types/index.ts`),
isolant l'UI des détails de sérialisation du backend.

### Endpoints (résumé)

| Domaine | Route(s) |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Matériel | `GET/POST /materials/`, `GET/PUT/DELETE /materials/{id}`, `POST /materials/import` |
| Réparations | `GET/POST /repairs/`, `GET/PUT/DELETE /repairs/{id}` |
| Utilisateurs | `GET/POST /users/`, `GET/PUT/DELETE /users/{id}` |
| Demandes | `GET/POST /requests/`, `GET/PUT/DELETE /requests/{id}` |
| Référentiels | `GET /roles/`, `GET /categories/`, `GET /locations/` |

---

## 5. Authentification & autorisation

### 5.1 Authentification (`lib/auth/auth-context.tsx`)
- Fournit un **React Context** (`useAuth`) avec l'utilisateur courant, l'état de
  chargement, et les actions `login` / `logout`.
- Au démarrage : si un token valide existe (`isTokenExpired` = false), récupère
  l'utilisateur via `GET /auth/me`.
- `login` : appelle `POST /auth/login`, stocke le JWT, puis charge le profil.
- `logout` : purge le token et renvoie vers `/login`.

### 5.2 Garde de routes (`app/(app)/layout.tsx`)
Le groupe `(app)` est protégé : sans session valide, l'utilisateur est redirigé
vers `/login`. Les pages sous `(app)` sont donc toujours rendues pour un
utilisateur authentifié.

### 5.3 RBAC (`lib/auth/permissions.ts`)
Trois rôles, alignés sur le backend : **`Admin`**, **`Technicien`**,
**`Consultant`**.

- `can(role, permission)` : vérifie une permission (ex. `"materials.write"`).
- `ROLE_PERMISSIONS` : matrice rôle → permissions.
- `roleBadgeVariant(role)` : variante visuelle du badge de rôle.

| Permission | Admin | Technicien | Consultant |
|---|:---:|:---:|:---:|
| `dashboard.read` | ✅ | ✅ | ✅ |
| `materials.read` | ✅ | ✅ | ✅ |
| `materials.write` | ✅ | ✅ | — |
| `materials.import` | ✅ | ✅ | — |
| `materials.delete` | ✅ | — | — |
| `repairs.read` | ✅ | ✅ | ✅ |
| `repairs.write` | ✅ | ✅ | — |
| `requests.read` | ✅ | ✅ | ✅ |
| `requests.write` | ✅ | ✅ | — |
| `users.read` | ✅ | — | — |
| `users.write` | ✅ | — | — |

> Côté frontend, le RBAC contrôle l'**affichage** (navigation, boutons
> d'action). La sécurité effective doit rester appliquée **côté API**.

---

## 6. Pages & composants clés

### Pages (`app/(app)/`)
- **`dashboard`** — Statistiques (cartes), graphiques (Recharts) et activité
  récente.
- **`materials`** + **`materials/[id]`** — Liste avec recherche, filtres,
  pagination ; détail avec historique de réparations ; création/édition,
  import Excel, impression.
- **`repairs`** — Suivi des réparations (formulaire, détail, historique).
- **`requests`** — Gestion des demandes (formulaire, détail).
- **`users`** — Gestion des utilisateurs (Admin uniquement).

### Composants transverses (`components/shared/`)
- `page-header`, `breadcrumbs` — En-têtes de page et fil d'Ariane.
- `filter-bar` — Barre de recherche/filtres (couplée à `use-debounce`).
- `data-pagination` — Pagination des listes.
- `states` — États de chargement / vide / erreur.
- `status-badge` — Badges de statut et de rôle.
- `confirm-dialog` — Confirmation d'action destructive.

### Layout (`components/layout/`)
- `app-shell` — Ossature (sidebar + topbar + contenu).
- `sidebar` / `nav-config` — Navigation filtrée par permissions.
- `topbar` — Barre supérieure (utilisateur courant, déconnexion).

### Impression (`components/print/`)
- `print-report` — Rapport imprimable (matériel).

---

## 7. Intégration backend & CORS

Le backend et le frontend tournant sur des origines différentes, le navigateur
envoie une requête **préflight `OPTIONS`** avant les appels. Le backend FastAPI
doit donc autoriser l'origine du frontend via `CORSMiddleware` (déjà configuré
pour `http://localhost:3000` et `http://127.0.0.1:3000`).

> Symptôme d'un CORS manquant : `405 Method Not Allowed` sur `OPTIONS /auth/login`.
> Après modification du backend, **redémarrer `uvicorn`**.

---

## 8. Conventions

- **TypeScript strict** : types du domaine centralisés dans `types/index.ts`.
- **Accès API centralisé** : passer par `services.ts`, jamais de `fetch` direct
  ni d'URL en dur dans les composants.
- **Récupération de données** : SWR côté client, avec états loading/erreur/vide
  gérés par `components/shared/states`.
- **Gestion d'erreurs** : afficher `ApiError.userMessage` (messages français).
- **Style** : Tailwind v4 + tokens de thème dans `globals.css` ; utiliser les
  primitives `components/ui/`.
- **Nommage** : composants en PascalCase, fichiers en kebab-case.
```
