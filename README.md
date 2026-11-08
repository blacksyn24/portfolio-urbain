# Portfolio — Urbain Sedami LANDJIDE

Portfolio Liquid Glass + Dynamic Island, avec dashboard d'administration complet.

- **Site** : Next.js 15 (App Router), Tailwind CSS 4, Framer Motion
- **Données, connexion, fichiers** : Supabase (projet `portfolio-urbain`, région Paris)
- **Chatbot** : Google Gemini (ou Claude en option)
- **Hébergement** : Vercel

## Pages
- `/` : le portfolio (contenu lu dans Supabase, mis à jour depuis le dashboard)
- `/admin` : dashboard (vue d'ensemble, messages, statistiques, projets, compétences, parcours, certifications, chatbot, paramètres)

## Variables d'environnement

| Nom | Obligatoire | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Clé publique Supabase (publishable) |
| `GEMINI_API_KEY` | pour le chatbot | Clé API Google Gemini (secrète, offre gratuite sur aistudio.google.com) |
| `GEMINI_MODEL` | non | Modèle Gemini (défaut : `gemini-3.8-flash`, repli `gemini-2.5-flash`) |
| `ANTHROPIC_API_KEY` | non | Alternative : chatbot Claude si aucune clé Gemini |
| `RESEND_API_KEY` | non | Envoi d'un email à chaque nouveau message |
| `CONTACT_NOTIFY_EMAIL` | non | Adresse qui reçoit ces emails |

## Développement

```bash
npm install
npm run dev
```

La sécurité repose sur les règles RLS de Supabase : les visiteurs peuvent lire le contenu publié et envoyer des messages, seul l'administrateur (table `admins`) peut lire les messages, les statistiques et modifier le contenu.
