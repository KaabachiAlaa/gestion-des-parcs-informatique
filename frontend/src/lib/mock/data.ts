/**
 * Données simulées (mock) pour la phase UI.
 * Elles respectent la forme des schémas backend et seront remplacées par de
 * vrais appels API ultérieurement.
 */

import type {
  Category,
  Location,
  Material,
  Repair,
  Role,
  SupportRequest,
  User,
} from "@/types"

export const roles: Role[] = [
  { id: 1, name: "Administrateur", description: "Accès total à la plateforme" },
  { id: 2, name: "Technicien", description: "Saisie et résolution des pannes" },
  { id: 3, name: "Consultant", description: "Consultation en lecture seule" },
]

export const categories: Category[] = [
  { id: 1, name: "Ordinateur portable", description: "PC portables professionnels" },
  { id: 2, name: "Ordinateur fixe", description: "Postes de travail fixes" },
  { id: 3, name: "Écran", description: "Moniteurs et affichages" },
  { id: 4, name: "Imprimante", description: "Imprimantes et multifonctions" },
  { id: 5, name: "Serveur", description: "Serveurs et baies" },
  { id: 6, name: "Réseau", description: "Switchs, routeurs, points d'accès" },
  { id: 7, name: "Périphérique", description: "Claviers, souris, docks" },
]

export const locations: Location[] = [
  { id: 1, name: "Siège - RDC", building: "Siège", floor: "RDC", room: "Accueil" },
  { id: 2, name: "Siège - 1er étage", building: "Siège", floor: "1", room: "Open space" },
  { id: 3, name: "Siège - 2e étage", building: "Siège", floor: "2", room: "Direction" },
  { id: 4, name: "Agence Tunis", building: "Tunis", floor: "1", room: "Bureau 12" },
  { id: 5, name: "Agence Sfax", building: "Sfax", floor: "RDC", room: "Bureau 3" },
  { id: 6, name: "Datacenter", building: "Siège", floor: "-1", room: "Salle serveurs" },
  { id: 7, name: "Magasin / Stock", building: "Siège", floor: "-1", room: "Réserve IT" },
]

export const users: User[] = [
  {
    id: 1,
    username: "a.kaabachi",
    email: "admin@comet.tn",
    full_name: "Alaa Kaabachi",
    is_active: true,
    role: roles[0],
    created_at: "2024-01-12T09:00:00Z",
  },
  {
    id: 2,
    username: "s.benali",
    email: "s.benali@comet.tn",
    full_name: "Sami Ben Ali",
    is_active: true,
    role: roles[1],
    created_at: "2024-02-03T09:00:00Z",
  },
  {
    id: 3,
    username: "m.trabelsi",
    email: "m.trabelsi@comet.tn",
    full_name: "Mariem Trabelsi",
    is_active: true,
    role: roles[1],
    created_at: "2024-03-21T09:00:00Z",
  },
  {
    id: 4,
    username: "y.gharbi",
    email: "y.gharbi@comet.tn",
    full_name: "Youssef Gharbi",
    is_active: false,
    role: roles[2],
    created_at: "2024-04-10T09:00:00Z",
  },
  {
    id: 5,
    username: "l.hamdi",
    email: "l.hamdi@comet.tn",
    full_name: "Leila Hamdi",
    is_active: true,
    role: roles[2],
    created_at: "2024-05-18T09:00:00Z",
  },
  {
    id: 6,
    username: "k.mansour",
    email: "k.mansour@comet.tn",
    full_name: "Karim Mansour",
    is_active: true,
    role: roles[1],
    created_at: "2024-06-01T09:00:00Z",
  },
  {
    id: 7,
    username: "n.jaziri",
    email: "n.jaziri@comet.tn",
    full_name: "Nadia Jaziri",
    is_active: true,
    role: roles[0],
    created_at: "2024-06-22T09:00:00Z",
  },
]

const brands = ["Dell", "HP", "Lenovo", "Apple", "Cisco", "Epson", "Samsung"]
const statusPool: Material["status"][] = [
  "En service",
  "En service",
  "En service",
  "En panne",
  "En réparation",
  "En stock",
  "Réformé",
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

export const materials: Material[] = Array.from({ length: 48 }, (_, i) => {
  const idx = i + 1
  const category = pick(categories, i)
  const status = pick(statusPool, i * 3 + 1)
  const assigned =
    status === "En stock" || status === "Réformé" ? null : pick(users, i + 1)
  return {
    id: idx,
    inventory_number: `COMET-${String(1000 + idx)}`,
    name: `${category.name} ${pick(brands, i)}`,
    brand: pick(brands, i),
    model: `MDL-${100 + idx}`,
    serial_number: `SN${String(90000 + idx * 7)}`,
    status,
    category,
    location: pick(locations, i + 2),
    assigned_to: assigned,
    purchase_date: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`,
    warranty_end: `2026-${String((i % 12) + 1).padStart(2, "0")}-15`,
    notes: i % 5 === 0 ? "Sous contrat de maintenance." : null,
    created_at: `2024-01-${String((i % 27) + 1).padStart(2, "0")}T10:00:00Z`,
  }
})

const repairStatuses: Repair["status"][] = [
  "Ouverte",
  "En cours",
  "En attente",
  "Résolue",
  "Résolue",
  "Annulée",
]

const repairDescriptions = [
  "Écran noir au démarrage",
  "Ne s'allume plus",
  "Surchauffe anormale du processeur",
  "Bourrage papier récurrent",
  "Perte de connexion réseau intermittente",
  "Batterie ne tient plus la charge",
  "Ventilateur bruyant",
  "Disque dur défaillant (SMART)",
  "Clavier partiellement inopérant",
  "Problème d'affichage / pixels morts",
]

export const repairs: Repair[] = Array.from({ length: 36 }, (_, i) => {
  const material = pick(materials, i * 2)
  const status = pick(repairStatuses, i)
  const technician = pick(
    users.filter((u) => u.role.name === "Technicien"),
    i,
  )
  const isResolved = status === "Résolue"
  const month = String((i % 12) + 1).padStart(2, "0")
  return {
    id: i + 1,
    material: {
      id: material.id,
      inventory_number: material.inventory_number,
      name: material.name,
    },
    description: pick(repairDescriptions, i),
    status,
    technician: { id: technician.id, full_name: technician.full_name },
    reported_by: { id: users[4].id, full_name: users[4].full_name },
    reported_at: `2025-${month}-${String((i % 27) + 1).padStart(2, "0")}T08:30:00Z`,
    resolved_at: isResolved
      ? `2025-${month}-${String((i % 27) + 3).padStart(2, "0")}T15:00:00Z`
      : null,
    resolution: isResolved
      ? "Composant remplacé et matériel testé, remis en service."
      : null,
    cost: isResolved ? Math.round((i + 1) * 37.5) : null,
  }
})

const requestTypes: SupportRequest["type"][] = [
  "Support",
  "Intervention",
  "Achat",
]
const requestStatuses: SupportRequest["status"][] = [
  "Nouvelle",
  "En traitement",
  "Approuvée",
  "Rejetée",
  "Clôturée",
]
const requestPriorities: SupportRequest["priority"][] = [
  "Basse",
  "Normale",
  "Haute",
  "Urgente",
]

const requestTitles = [
  "Demande de nouveau poste de travail",
  "Intervention imprimante 2e étage",
  "Achat de licences logicielles",
  "Remplacement écran défectueux",
  "Support messagerie Outlook",
  "Installation point d'accès WiFi",
  "Commande de docks USB-C",
  "Migration poste utilisateur",
]

export const supportRequests: SupportRequest[] = Array.from(
  { length: 22 },
  (_, i) => {
    const type = pick(requestTypes, i)
    const requester = pick(users, i)
    const material = i % 3 === 0 ? pick(materials, i * 4) : null
    return {
      id: i + 1,
      type,
      title: pick(requestTitles, i),
      description:
        "Détail de la demande saisie par l'utilisateur concernant le matériel ou le service informatique.",
      status: pick(requestStatuses, i),
      priority: pick(requestPriorities, i),
      requested_by: { id: requester.id, full_name: requester.full_name },
      material: material
        ? {
            id: material.id,
            inventory_number: material.inventory_number,
            name: material.name,
          }
        : null,
      created_at: `2025-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}T11:00:00Z`,
      updated_at: null,
    }
  },
)

/** Utilisateur courant simulé (Administrateur par défaut). */
export const currentUser: User = users[0]
