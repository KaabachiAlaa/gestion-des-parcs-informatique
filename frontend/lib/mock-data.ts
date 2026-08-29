import type {
  Category,
  Location,
  Material,
  Repair,
  RoleRecord,
  ServiceRequest,
  User,
} from "@/lib/types";

export const MOCK_ROLES: RoleRecord[] = [
  {
    id: 1,
    name: "Admin",
    description:
      "Accès complet : gestion des matériels, utilisateurs, réparations et demandes.",
  },
  {
    id: 2,
    name: "Technicien",
    description:
      "Gère les réparations et les demandes d'intervention, consulte le parc matériel.",
  },
  {
    id: 3,
    name: "Consultant",
    description:
      "Accès en lecture seule au parc matériel, aux réparations et aux demandes.",
  },
];

export const MOCK_LOCATIONS: Location[] = [
  { id: 1, name: "Siège social", building: "Bâtiment A", floor: "1er étage" },
  { id: 2, name: "Direction financière", building: "Bâtiment A", floor: "2e étage" },
  { id: 3, name: "Service informatique", building: "Bâtiment B", floor: "Rez-de-chaussée" },
  { id: 4, name: "Ressources humaines", building: "Bâtiment A", floor: "3e étage" },
  { id: 5, name: "Entrepôt logistique", building: "Bâtiment C", floor: "Rez-de-chaussée" },
  { id: 6, name: "Salle de réunion", building: "Bâtiment A", floor: "1er étage" },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Ordinateur portable", description: "Laptops professionnels" },
  { id: 2, name: "Ordinateur de bureau", description: "Postes fixes" },
  { id: 3, name: "Imprimante", description: "Imprimantes et multifonctions" },
  { id: 4, name: "Écran", description: "Moniteurs et écrans" },
  { id: 5, name: "Serveur", description: "Serveurs et infrastructure" },
  { id: 6, name: "Réseau", description: "Routeurs, switchs, points d'accès" },
  { id: 7, name: "Téléphone", description: "Téléphonie fixe et mobile" },
];

export const MOCK_USERS: User[] = [
  { id: 1, username: "a.karray", first_name: "Amine", last_name: "Karray", email: "a.karray@comet.tn", role: "Admin", is_active: true, created_at: "2022-01-10T08:00:00Z" },
  { id: 2, username: "s.bensalah", first_name: "Sarra", last_name: "Ben Salah", email: "s.bensalah@comet.tn", role: "Admin", is_active: true, created_at: "2022-02-14T08:00:00Z" },
  { id: 3, username: "m.trabelsi", first_name: "Mehdi", last_name: "Trabelsi", email: "m.trabelsi@comet.tn", role: "Technicien", is_active: true, created_at: "2022-03-01T08:00:00Z" },
  { id: 4, username: "h.gharbi", first_name: "Hana", last_name: "Gharbi", email: "h.gharbi@comet.tn", role: "Technicien", is_active: true, created_at: "2022-04-22T08:00:00Z" },
  { id: 5, username: "y.mansour", first_name: "Youssef", last_name: "Mansour", email: "y.mansour@comet.tn", role: "Technicien", is_active: false, created_at: "2022-05-30T08:00:00Z" },
  { id: 6, username: "r.jlassi", first_name: "Rania", last_name: "Jlassi", email: "r.jlassi@comet.tn", role: "Consultant", is_active: true, created_at: "2022-06-11T08:00:00Z" },
  { id: 7, username: "f.zouari", first_name: "Fares", last_name: "Zouari", email: "f.zouari@comet.tn", role: "Consultant", is_active: true, created_at: "2022-07-19T08:00:00Z" },
  { id: 8, username: "n.saidi", first_name: "Nour", last_name: "Saidi", email: "n.saidi@comet.tn", role: "Consultant", is_active: true, created_at: "2022-08-05T08:00:00Z" },
  { id: 9, username: "w.chaabane", first_name: "Wael", last_name: "Chaabane", email: "w.chaabane@comet.tn", role: "Technicien", is_active: true, created_at: "2022-09-17T08:00:00Z" },
  { id: 10, username: "l.abidi", first_name: "Lina", last_name: "Abidi", email: "l.abidi@comet.tn", role: "Consultant", is_active: false, created_at: "2022-10-23T08:00:00Z" },
];

function loc(id: number): Location {
  return MOCK_LOCATIONS.find((l) => l.id === id)!;
}
function cat(id: number): Category {
  return MOCK_CATEGORIES.find((c) => c.id === id)!;
}
function user(id: number): User {
  return MOCK_USERS.find((u) => u.id === id)!;
}

export const MOCK_MATERIALS: Material[] = [
  { id: 1, asset_code: "GPI-LT-0001", name: "Latitude 5440", category: cat(1), brand: "Dell", model: "Latitude 5440", serial_number: "SN-DL54401", status: "EN_SERVICE", location: loc(1), assigned_user: user(1), acquisition_date: "2023-01-15", warranty_end_date: "2026-01-15", purchase_price: 2450, description: "Poste de direction." },
  { id: 2, asset_code: "GPI-LT-0002", name: "ThinkPad T14", category: cat(1), brand: "Lenovo", model: "ThinkPad T14", serial_number: "SN-LTP1402", status: "EN_PANNE", location: loc(3), assigned_user: user(3), acquisition_date: "2022-11-02", warranty_end_date: "2025-11-02", purchase_price: 2100, description: "Écran clignotant depuis la semaine dernière." },
  { id: 3, asset_code: "GPI-DT-0001", name: "OptiPlex 7010", category: cat(2), brand: "Dell", model: "OptiPlex 7010", serial_number: "SN-OP70103", status: "EN_SERVICE", location: loc(2), assigned_user: user(2), acquisition_date: "2021-06-20", warranty_end_date: "2024-06-20", purchase_price: 1300, description: null },
  { id: 4, asset_code: "GPI-PR-0001", name: "LaserJet Pro M404", category: cat(3), brand: "HP", model: "LaserJet Pro M404dn", serial_number: "SN-HPLJ404", status: "EN_REPARATION", location: loc(4), assigned_user: null, acquisition_date: "2020-09-10", warranty_end_date: "2023-09-10", purchase_price: 480, description: "Bourrage papier récurrent." },
  { id: 5, asset_code: "GPI-EC-0001", name: "UltraSharp U2422H", category: cat(4), brand: "Dell", model: "UltraSharp U2422H", serial_number: "SN-US24225", status: "EN_STOCK", location: loc(5), assigned_user: null, acquisition_date: "2023-03-05", warranty_end_date: "2026-03-05", purchase_price: 320, description: null },
  { id: 6, asset_code: "GPI-SV-0001", name: "PowerEdge R440", category: cat(5), brand: "Dell", model: "PowerEdge R440", serial_number: "SN-PE4406", status: "EN_SERVICE", location: loc(3), assigned_user: null, acquisition_date: "2021-02-18", warranty_end_date: "2026-02-18", purchase_price: 5600, description: "Serveur applicatif principal." },
  { id: 7, asset_code: "GPI-NW-0001", name: "Catalyst 2960", category: cat(6), brand: "Cisco", model: "Catalyst 2960-X", serial_number: "SN-CAT29607", status: "EN_SERVICE", location: loc(3), assigned_user: null, acquisition_date: "2020-05-12", warranty_end_date: "2025-05-12", purchase_price: 890, description: null },
  { id: 8, asset_code: "GPI-LT-0003", name: "MacBook Pro 14", category: cat(1), brand: "Apple", model: "MacBook Pro 14 M2", serial_number: "SN-MBP148", status: "EN_SERVICE", location: loc(1), assigned_user: user(2), acquisition_date: "2023-07-01", warranty_end_date: "2026-07-01", purchase_price: 3200, description: null },
  { id: 9, asset_code: "GPI-TL-0001", name: "IP Phone 8845", category: cat(7), brand: "Cisco", model: "IP Phone 8845", serial_number: "SN-IPP8849", status: "HORS_SERVICE", location: loc(6), assigned_user: null, acquisition_date: "2019-04-14", warranty_end_date: "2022-04-14", purchase_price: 210, description: "Retiré du service, remplacé." },
  { id: 10, asset_code: "GPI-DT-0002", name: "OptiPlex 7010", category: cat(2), brand: "Dell", model: "OptiPlex 7010", serial_number: "SN-OP701010", status: "EN_PANNE", location: loc(4), assigned_user: user(6), acquisition_date: "2021-06-20", warranty_end_date: "2024-06-20", purchase_price: 1300, description: "Ne démarre plus depuis ce matin." },
  { id: 11, asset_code: "GPI-LT-0004", name: "Latitude 5440", category: cat(1), brand: "Dell", model: "Latitude 5440", serial_number: "SN-DL544011", status: "EN_SERVICE", location: loc(4), assigned_user: user(8), acquisition_date: "2023-02-11", warranty_end_date: "2026-02-11", purchase_price: 2450, description: null },
  { id: 12, asset_code: "GPI-EC-0002", name: "UltraSharp U2422H", category: cat(4), brand: "Dell", model: "UltraSharp U2422H", serial_number: "SN-US242212", status: "EN_SERVICE", location: loc(2), assigned_user: user(2), acquisition_date: "2023-03-05", warranty_end_date: "2026-03-05", purchase_price: 320, description: null },
  { id: 13, asset_code: "GPI-PR-0002", name: "EcoTank L15150", category: cat(3), brand: "Epson", model: "EcoTank L15150", serial_number: "SN-ET1515013", status: "EN_STOCK", location: loc(5), assigned_user: null, acquisition_date: "2023-09-19", warranty_end_date: "2026-09-19", purchase_price: 650, description: null },
  { id: 14, asset_code: "GPI-NW-0002", name: "Access Point AP-505", category: cat(6), brand: "Aruba", model: "AP-505", serial_number: "SN-AP50514", status: "EN_SERVICE", location: loc(1), assigned_user: null, acquisition_date: "2022-08-08", warranty_end_date: "2027-08-08", purchase_price: 410, description: null },
  { id: 15, asset_code: "GPI-LT-0005", name: "ThinkPad T14", category: cat(1), brand: "Lenovo", model: "ThinkPad T14", serial_number: "SN-LTP14015", status: "EN_REPARATION", location: loc(3), assigned_user: user(4), acquisition_date: "2022-11-02", warranty_end_date: "2025-11-02", purchase_price: 2100, description: "Remplacement clavier en cours." },
  { id: 16, asset_code: "GPI-SV-0002", name: "ProLiant DL380", category: cat(5), brand: "HPE", model: "ProLiant DL380 Gen10", serial_number: "SN-PLDL38016", status: "EN_SERVICE", location: loc(3), assigned_user: null, acquisition_date: "2020-12-01", warranty_end_date: "2025-12-01", purchase_price: 7200, description: "Serveur de sauvegarde." },
  { id: 17, asset_code: "GPI-TL-0002", name: "iPhone 13", category: cat(7), brand: "Apple", model: "iPhone 13", serial_number: "SN-IPH1317", status: "EN_SERVICE", location: loc(2), assigned_user: user(2), acquisition_date: "2023-05-15", warranty_end_date: "2025-05-15", purchase_price: 980, description: null },
  { id: 18, asset_code: "GPI-DT-0003", name: "Vostro 3910", category: cat(2), brand: "Dell", model: "Vostro 3910", serial_number: "SN-V391018", status: "EN_STOCK", location: loc(5), assigned_user: null, acquisition_date: "2023-10-02", warranty_end_date: "2026-10-02", purchase_price: 950, description: null },
];

export const MOCK_REPAIRS: Repair[] = [
  { id: 1, material: MOCK_MATERIALS[1], description: "Écran qui clignote de manière intermittente.", diagnosis: "Nappe d'écran défectueuse.", intervention: "Remplacement de la nappe d'écran.", replaced_parts: "Nappe LCD", technician: user(3), status: "EN_COURS", priority: "HAUTE", cost: 85, comments: "Pièce commandée, arrivée prévue dans 2 jours.", opened_at: "2024-05-02T09:15:00Z", resolved_at: null },
  { id: 2, material: MOCK_MATERIALS[3], description: "Bourrage papier récurrent sur le bac 2.", diagnosis: "Rouleau d'entraînement usé.", intervention: "Remplacement du rouleau d'entraînement.", replaced_parts: "Rouleau bac 2", technician: user(4), status: "RESOLUE", priority: "NORMALE", cost: 45, comments: "Testé, fonctionne normalement.", opened_at: "2024-04-18T14:30:00Z", resolved_at: "2024-04-20T11:00:00Z" },
  { id: 3, material: MOCK_MATERIALS[9], description: "Le poste ne démarre plus, aucun signal.", diagnosis: null, intervention: null, replaced_parts: null, technician: user(3), status: "OUVERTE", priority: "CRITIQUE", cost: null, comments: null, opened_at: "2024-05-20T08:05:00Z", resolved_at: null },
  { id: 4, material: MOCK_MATERIALS[14], description: "Touches du clavier qui restent bloquées.", diagnosis: "Clavier endommagé par liquide.", intervention: "Remplacement complet du clavier.", replaced_parts: "Clavier interne", technician: user(4), status: "EN_COURS", priority: "NORMALE", cost: 95, comments: null, opened_at: "2024-05-10T10:00:00Z", resolved_at: null },
  { id: 5, material: MOCK_MATERIALS[0], description: "Batterie qui se décharge très rapidement.", diagnosis: "Batterie en fin de vie.", intervention: "Remplacement de la batterie.", replaced_parts: "Batterie 4 cellules", technician: user(9), status: "RESOLUE", priority: "BASSE", cost: 120, comments: "Autonomie revenue à la normale.", opened_at: "2024-03-11T09:00:00Z", resolved_at: "2024-03-14T16:20:00Z" },
  { id: 6, material: MOCK_MATERIALS[6], description: "Perte de connectivité intermittente sur plusieurs ports.", diagnosis: "Firmware obsolète.", intervention: "Mise à jour du firmware.", replaced_parts: null, technician: user(3), status: "RESOLUE", priority: "HAUTE", cost: 0, comments: "Surveillance recommandée pendant 1 semaine.", opened_at: "2024-02-25T13:45:00Z", resolved_at: "2024-02-26T10:10:00Z" },
  { id: 7, material: MOCK_MATERIALS[2], description: "Ventilateur bruyant.", diagnosis: "Accumulation de poussière.", intervention: "Nettoyage complet du boîtier.", replaced_parts: null, technician: user(9), status: "ANNULEE", priority: "BASSE", cost: null, comments: "Demande annulée par l'utilisateur.", opened_at: "2024-01-30T08:30:00Z", resolved_at: null },
  { id: 8, material: MOCK_MATERIALS[15], description: "Alerte disque défaillant sur le contrôleur RAID.", diagnosis: "Disque en pré-panne.", intervention: "Remplacement du disque et reconstruction RAID.", replaced_parts: "Disque SAS 900 Go", technician: user(3), status: "RESOLUE", priority: "CRITIQUE", cost: 340, comments: "RAID reconstruit sans perte de données.", opened_at: "2024-04-01T07:00:00Z", resolved_at: "2024-04-01T19:30:00Z" },
  { id: 9, material: MOCK_MATERIALS[8], description: "Aucune tonalité, écran figé.", diagnosis: "Panne matérielle irréparable.", intervention: "Mise hors service et remplacement.", replaced_parts: null, technician: user(4), status: "RESOLUE", priority: "NORMALE", cost: 0, comments: "Matériel déclassé.", opened_at: "2023-12-10T09:00:00Z", resolved_at: "2023-12-11T15:00:00Z" },
  { id: 10, material: MOCK_MATERIALS[1], description: "Trackpad qui ne répond plus par moment.", diagnosis: "Pilote corrompu.", intervention: "Réinstallation des pilotes.", replaced_parts: null, technician: user(9), status: "EN_COURS", priority: "BASSE", cost: null, comments: null, opened_at: "2024-05-22T11:00:00Z", resolved_at: null },
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  { id: 1, code: "DEM-2024-001", type: "SUPPORT", title: "Impossible de me connecter au VPN", description: "Le VPN affiche une erreur d'authentification depuis ce matin.", priority: "HAUTE", status: "EN_COURS", created_by: user(6), assigned_to: user(3), resolution_notes: null, created_at: "2024-05-18T08:12:00Z", updated_at: "2024-05-18T09:30:00Z" },
  { id: 2, code: "DEM-2024-002", type: "ACHAT", title: "Besoin de 3 écrans supplémentaires", description: "Pour l'arrivée de nouveaux collaborateurs au service RH.", priority: "NORMALE", status: "OUVERTE", created_by: user(2), assigned_to: null, resolution_notes: null, created_at: "2024-05-19T10:00:00Z", updated_at: "2024-05-19T10:00:00Z" },
  { id: 3, code: "DEM-2024-003", type: "INTERVENTION", title: "Installation poste pour nouvel arrivant", description: "Nouveau collaborateur au service financier, poste à configurer.", priority: "NORMALE", status: "RESOLUE", created_by: user(1), assigned_to: user(4), resolution_notes: "Poste installé et configuré le 15/05.", created_at: "2024-05-12T09:00:00Z", updated_at: "2024-05-15T17:00:00Z" },
  { id: 4, code: "DEM-2024-004", type: "SUPPORT", title: "Imprimante du 3e étage hors ligne", description: "L'imprimante n'apparaît plus dans la liste des imprimantes réseau.", priority: "BASSE", status: "OUVERTE", created_by: user(8), assigned_to: null, resolution_notes: null, created_at: "2024-05-20T14:20:00Z", updated_at: "2024-05-20T14:20:00Z" },
  { id: 5, code: "DEM-2024-005", type: "ACHAT", title: "Renouvellement de 5 licences antivirus", description: "Licences arrivant à expiration fin du mois.", priority: "HAUTE", status: "EN_COURS", created_by: user(1), assigned_to: user(3), resolution_notes: null, created_at: "2024-05-17T08:00:00Z", updated_at: "2024-05-19T11:00:00Z" },
  { id: 6, code: "DEM-2024-006", type: "INTERVENTION", title: "Déplacement de poste vers autre bureau", description: "Déménagement interne au service RH.", priority: "BASSE", status: "REJETEE", created_by: user(6), assigned_to: null, resolution_notes: "Demande en doublon avec DEM-2024-003.", created_at: "2024-05-05T09:00:00Z", updated_at: "2024-05-06T10:00:00Z" },
  { id: 7, code: "DEM-2024-007", type: "SUPPORT", title: "Messagerie professionnelle inaccessible", description: "Erreur de synchronisation Outlook depuis hier.", priority: "CRITIQUE", status: "EN_COURS", created_by: user(7), assigned_to: user(9), resolution_notes: null, created_at: "2024-05-21T07:45:00Z", updated_at: "2024-05-21T08:15:00Z" },
  { id: 8, code: "DEM-2024-008", type: "ACHAT", title: "Achat d'un serveur de sauvegarde", description: "Capacité de stockage actuelle insuffisante.", priority: "NORMALE", status: "OUVERTE", created_by: user(2), assigned_to: null, resolution_notes: null, created_at: "2024-05-14T13:00:00Z", updated_at: "2024-05-14T13:00:00Z" },
];

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): { data: T[]; page: number; limit: number; total: number; total_pages: number } {
  const total = items.length;
  const total_pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return { data, page, limit, total, total_pages };
}
