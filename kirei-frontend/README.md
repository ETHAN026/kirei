# Kirei — Frontend

Frontend React + Tailwind pour la plateforme de réservation du salon Kirei (綺麗).

## Installation

```bash
npm install
cp .env.example .env
# Régler VITE_API_URL vers l'URL de votre backend (ex: http://localhost:4000)
npm run dev
```

## Structure

- `src/pages/public/` — Front-office client : accueil, catalogue des coupes, prise de rendez-vous (multi-étapes)
- `src/pages/admin/` — Back-office coiffeur : login, tableau de bord CA, rendez-vous, coupes (CRUD + photos), clients, rapports, paramètres du salon
- `src/layouts/` — Layout public (header/footer) et layout admin (sidebar)
- `src/api/` — Client Axios + fonctions d'appel à l'API (public.js / admin.js)
- `src/context/AuthContext.jsx` — Gestion du token JWT admin (localStorage)

## Pages disponibles

**Public**
- `/` — Accueil
- `/coupes` — Catalogue complet
- `/reserver` — Prise de rendez-vous (coupe → date/heure → coordonnées → confirmation)

**Admin** (protégé par login, `/admin/login`)
- `/admin` — Tableau de bord (CA Jour/Semaine/Mois/Année/Total)
- `/admin/rendez-vous` — Liste + validation/refus/terminaison/annulation
- `/admin/coupes` — CRUD coupes avec upload de 3 photos
- `/admin/clients` — Liste clients + historique
- `/admin/rapports` — Export PDF / Excel
- `/admin/parametres` — Infos salon, horaires, congés

## Design

Identité "Kirei" (綺麗, "beauté" en japonais) : palette prune/or sur fond papier chaud,
typographie Shippori Mincho (titres) + Zen Kaku Gothic New (texte courant).
Le style est volontairement simple pour l'instant — prêt à être affiné.
