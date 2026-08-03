# Backend — Plateforme de Réservation Coiffure

API REST Node.js/Express pour la gestion des rendez-vous d'un salon de coiffure.

## Stack

- **Node.js / Express** — API REST
- **PostgreSQL + Prisma** — base de données
- **JWT + bcrypt** — authentification admin
- **Multer** — upload des photos de coupes (3 max)
- **Nodemailer** — notifications e-mail
- **PDFKit / ExcelJS** — export des rapports financiers

## Installation

```bash
npm install
cp .env.example .env
# Éditer .env avec vos vraies valeurs (DATABASE_URL, SMTP, JWT_SECRET...)

npx prisma migrate dev --name init
npm run seed        # crée le salon, les horaires par défaut et le compte admin
npm run dev          # démarre le serveur en mode développement
```

Le compte admin créé par le seed utilise `ADMIN_EMAIL` / `ADMIN_PASSWORD` définis dans `.env`
(par défaut `admin@salon.com` / `ChangeMoi123!` — **à changer immédiatement**).

## Cycle de vie d'un rendez-vous

```
EN_ATTENTE --(coiffeur valide)--> VALIDE --(coiffeur marque comme payé)--> TERMINE  → compte dans le CA
    |                                |
    '--(coiffeur refuse)--> REFUSE   '--(annulation)--> ANNULE
```

Le chiffre d'affaires (tableau de bord + rapports PDF/Excel) est calculé **uniquement**
sur la somme des `tarifApplique` des rendez-vous au statut `TERMINE`.

## Routes principales

### Public (front-office client)
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/salon` | Infos du salon |
| GET | `/api/coupes` | Catalogue des coupes (nom, photos, prix) |
| GET | `/api/coupes/:id` | Détail d'une coupe |
| GET | `/api/creneaux-disponibles?date=YYYY-MM-DD` | Créneaux libres pour une date |
| POST | `/api/rendez-vous` | Prendre rendez-vous |

### Auth admin
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion (email + password) → JWT |
| GET | `/api/auth/me` | Profil admin connecté |
| POST | `/api/auth/change-password` | Changer le mot de passe |

### Admin (back-office coiffeur — header `Authorization: Bearer <token>`)
| Méthode | Route | Description |
|---|---|---|
| POST/PUT/DELETE | `/api/admin/coupes` | CRUD coupes (multipart, champ `photos`, max 3) |
| GET | `/api/admin/rendez-vous` | Liste/calendrier (filtres `statut`, `from`, `to`) |
| PATCH | `/api/admin/rendez-vous/:id/valider` | Accepter la demande |
| PATCH | `/api/admin/rendez-vous/:id/refuser` | Refuser la demande |
| PATCH | `/api/admin/rendez-vous/:id/terminer` | Marquer payé → compte dans le CA |
| PATCH | `/api/admin/rendez-vous/:id/annuler` | Annuler |
| GET/PUT | `/api/admin/salon` | Paramètres du salon |
| PUT | `/api/admin/salon/horaires` | Horaires hebdomadaires |
| GET/POST/DELETE | `/api/admin/indisponibilites` | Congés / pauses |
| GET | `/api/admin/dashboard` | CA Jour/Semaine/Mois/Année/Total |
| GET | `/api/admin/dashboard/coupes-populaires` | Top des coupes vendues |
| GET | `/api/admin/clients` | Liste clients + historique |
| GET | `/api/admin/rapports/pdf?from=&to=` | Export PDF |
| GET | `/api/admin/rapports/excel?from=&to=` | Export Excel |

## Exemple : création d'un rendez-vous (client)

```bash
curl -X POST http://localhost:4000/api/rendez-vous \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Doe", "prenom": "Jean",
    "email": "jean@example.com", "telephone": "+22900000000",
    "coupeId": "uuid-de-la-coupe",
    "dateHeureDebut": "2026-08-10T10:00:00.000Z"
  }'
```

## Exemple : ajout d'une coupe avec 3 photos (admin)

```bash
curl -X POST http://localhost:4000/api/admin/coupes \
  -H "Authorization: Bearer <token>" \
  -F "nom=Dégradé américain" \
  -F "prixFcfa=3000" \
  -F "photos=@photo1.jpg" -F "photos=@photo2.jpg" -F "photos=@photo3.jpg"
```

## Sécurité mise en place

- Mots de passe hashés avec **bcrypt**
- Authentification par **JWT** (routes admin protégées)
- **Helmet** (en-têtes HTTP sécurisés) + **CORS** restreint au frontend
- **Rate limiting** sur le login et la création de rendez-vous (anti brute-force / spam)
- Requêtes DB via **Prisma** (ORM) → protection injections SQL
- Validation stricte des entrées sur chaque endpoint
