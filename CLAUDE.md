# Contexte — Civelo

Point d'entrée de contexte pour toute session Claude Code sur ce repo. Versionné : tenir à jour quand une décision structurante ou un piège opérationnel change.

---

## 1. Ce qu'est Civelo

Un **SaaS multi-tenant** : une seule application, une seule base, qui sert jusqu'à ~250 sites de communes (mairies) françaises. Ajouter une commune = une ligne en base + un enregistrement DNS, jamais un nouveau déploiement.

- **Marque** : Civelo, domaine `civelo.fr`.
- **Repo GitHub** : `github.com/charles4nier/civelo` (remote `origin`).
- **App Scalingo** : `civelo`, région `osc-fr1` (remote `scalingo`, `git@ssh.osc-fr1.scalingo.com:civelo.git`).
- **Stockage objet** : bucket OVH Object Storage `civelo-storage` (`eu-west-par`).
- **Tarif** *(à reconfirmer avant tout usage commercial)* : ~2900 € de mise en place + abonnement mensuel (~59 €).
- **Équipe** : 2 personnes — le porteur du projet (culture technique mais **pas développeur hands-on** ; il cadre, décide, sert de mains pour les actions navigateur/terminal) + un associé au commercial.
- **Client de référence** : Saint-Hilaire-Bonneval, en ligne sur `edito.civelo.fr`. Les autres démos (`app.civelo.fr`, `accueillant.civelo.fr`) utilisent du contenu de démonstration, pas des données de vraies communes.

**Règle commerciale** : ne JAMAIS employer les mots « SaaS », « multi-tenant », « plateforme mutualisée » face à un client final. De son point de vue, il a **son** site (données isolées, sa propre adresse, son propre admin). Voir `../../civelo-briefing-commercial.md` (à la racine de `Documents/perso/`) pour le briefing destiné à l'assistant de l'associé.

---

## 2. Stack & architecture

| Couche | Choix |
|---|---|
| Framework | Next.js **15.4.11** — pinné exact (`@payloadcms/ui@3.88.0` exige `next >=15.4.11 <15.5.0`, ou un saut Next 16) |
| CMS | Payload CMS **3.88.0** + `@payloadcms/plugin-multi-tenant` |
| Runtime | React 19, PostgreSQL 17 en prod (16 en local) |
| Hébergement app | Scalingo (buildpack Node, pas de Dockerfile pour l'app principale) |
| Stockage médias | S3 → bucket OVH ; en mode mono-tenant, bascule sur disque local |
| Monitoring | Sentry (`@sentry/nextjs`) |

**3 thèmes visuels** dans `themes/` :
- **`edito`** — le thème de référence, seul entièrement branché sur Payload, **audité RGAA (0 constat ouvert)**. Tenant Saint-Hilaire-Bonneval.
- **`app`** — pages branchées sur Payload, remplies de contenu de démo. Tenant `app.civelo.fr`.
- **`accueillant`** — pages construites, page Accueil au design bespoke d'origine restaurée. Tenant `accueillant.civelo.fr`.

**Résolution du tenant** : par le header `Host` de la requête (`shared/lib/tenant.ts` → `getCurrentTenant()`), comparé à `Tenants.domaine`. En mode mono-tenant (`SINGLE_TENANT_SLUG` défini), court-circuit : le seul tenant existant est renvoyé sans regarder l'hôte.

**Isolation** : chaque fonction de `lib/payload.ts` résout le tenant courant et l'ajoute à son `where`. Ne jamais faire une requête non scopée qui pourrait renvoyer le contenu d'une autre commune. Suite de tests : `tests/tenant-isolation/` (`npm run test:isolation`).

Docs internes plus détaillées : `PAYLOAD-CMS.md` (décisions gabarit/menu — toujours valables), `ARCHITECTURE.md` (ancien, antérieur au pivot SaaS — Next 14/Vercel/Sanity périmés).

---

## 3. Repo — où se trouve quoi

```
├── app/(frontend)/        → routes publiques (route group)
├── app/(payload)/         → admin Payload + routes API custom (lock-tenant, tenant-export, tenant-domain)
├── app/global-error.tsx   → catch-all top-level pour Sentry
├── themes/{edito,app,accueillant}/  → chacun : components/, RootLayout.tsx
├── collections/           → Pages, Tenants, Users, Media, Documents, Categories, Pois, Sentiers, Icones, access.ts
├── globals/               → Footer, Identite, BoutonEntete (nommage legacy : ce sont des COLLECTIONS tenant-scopées via isGlobal:true côté plugin)
├── lib/payload.ts         → couche data (getNavLinks, getFooterData, getIdentiteData…), résout le tenant à chaque appel
├── lib/seedDefaultPages.ts→ seed des 18 pages génériques (hook afterChange de Tenants)
├── lib/scalingoDomains.ts → enregistrement auto du domaine via l'API Scalingo
├── shared/lib/tenant.ts   → getCurrentTenant()
├── migrations/            → migrations Payload (baseline + fk_cascade_fix + index.ts)
├── scripts/
│   ├── migrate-run.ts / migrate-create.ts   → remplacent le CLI Payload (cassé, voir §5)
│   ├── export-tenant.ts / build-tenant-archive.ts / e2e-archive-test.sh  → export mono-tenant
│   ├── create-admin-user.ts
│   └── _resolve-ts.mjs   → loader ESM maison pour exécuter les .ts
├── Procfile               → web + postdeploy (migrations)
├── .slugignore            → exclut /.next/cache de l'image déployée
└── instrumentation.ts, instrumentation-client.ts, sentry.*.config.ts  → Sentry
```

---

## 4. Développement local

- **Node** : `nvm use 22.21.1` (la prod tourne sur Node 24.19.0 — vérifié compatible).
- **Postgres local** : container Docker `style-edito-postgres` (PG 16), base `style_edito`. `DATABASE_URI` dans `.env`.
- **Exécuter un script TS** : `node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/<x>.ts`. Le binaire CLI officiel `payload` plante sur ce Node (`ERR_REQUIRE_ASYNC_MODULE`, interaction CJS/ESM avec le top-level await de `@payloadcms/richtext-lexical`).
- **npm scripts** : `dev`, `build`, `migrate`, `migrate:create`, `test:isolation`, `export-tenant`, `build-tenant-archive`, `test:e2e-archive`.

### Pièges locaux à connaître

1. **Le domaine du tenant Saint-Hilaire diffère entre local et prod** : `saint-hilaire-bonneval.fr` en LOCAL, `edito.civelo.fr` en PROD (les deux bases ont divergé). Pour tester le front en local avec ses vraies données : `curl -H "Host: saint-hilaire-bonneval.fr" http://localhost:3000/`. Se tromper de host → repli silencieux sur `DEFAULT_NAV_LINKS`/`FOOTER_FALLBACK`, qui ont des liens réels par coïncidence → on croit que ça marche alors que non.
2. **`SUPER_ADMIN_DOMAIN=localhost` dans `.env`** → le middleware redirige TOUT vers `/admin` en local. Pour tester le front : `SUPER_ADMIN_DOMAIN="" npm run dev`.
3. **Sorties muettes** : certains `node …` lancés en foreground ne sortent rien malgré une exécution réussie (quirk flush/exit). Contournement fiable : lancer en arrière-plan et lire le fichier de sortie.
4. **`tsconfig.tsbuildinfo`** est versionné (convention inhabituelle du repo) — il apparaît dans chaque `git status`, ne pas s'en inquiéter.
5. **Erreur tsc connue et attendue** : `scripts/import-tenant.template.ts` référence `../app/payload.config` qui n'existe qu'une fois le template copié dans une archive. Ignorer.

---

## 5. Déploiement

- **TOUJOURS pousser sur les DEUX remotes** : `git push origin HEAD:main` **ET** `git push scalingo HEAD:main`. GitHub sert aussi de contexte de code à des outils tiers (Sentry). Ne jamais ne pousser qu'un seul.
- Le remote `scalingo` ne supporte pas `git fetch` (push-only) — pour vérifier l'état réel de la prod : `scalingo --app civelo deployments`.
- **`Procfile`** :
  ```
  web: npm start
  postdeploy: PAYLOAD_MIGRATING=true npm run migrate
  ```
  Scalingo démarre le nouveau code → lance le hook postdeploy (les migrations) → **puis seulement** bascule le trafic public. L'ancienne version continue de servir pendant tout ce temps. C'est le séquencement qui protège du scénario « code neuf + ancien schéma » qui a causé une panne d'admin le 30/08.
- Statuts de déploiement à surveiller : `success | failed | aborted | crashed | hook-error | build-error`.
- Build ≈ 4–6 min.
- Si un push local échoue par timeout à 3 min : le déploiement continue côté Scalingo, vérifier avec `deployments`.

---

## 6. Migrations de base de données

**Procédure normale** : `npm run migrate:create -- <nom>` en local (base de dev) → relire le fichier généré dans `migrations/` → committer → le déploiement suivant l'applique automatiquement en prod via le hook postdeploy.

**Ne plus JAMAIS faire d'`ALTER TABLE` manuel en prod** pour un changement de schéma porté par `payload.config.ts`.

**Historique (piège résolu le 2026-08-31)** : avant cette date, la prod ne synchronisait jamais son schéma automatiquement (le mode `push` de Payload est dev-only, désactivé quand `NODE_ENV=production`). Chaque nouveau champ nécessitait un `scalingo db-tunnel` + SQL direct. Ça a causé **deux vraies pannes** fin août : contrainte FK cassée sur suppression de tenant, puis colonne manquante = admin totalement HS. Le système de migrations (`migrations/`, hook postdeploy) a fermé ce risque. La table `payload_migrations` en prod a été amorcée à la main avec les 2 premières migrations marquées « déjà appliquées » (schéma déjà en place).

**Piège si on retouche ce mécanisme** : `migrations/20260831_092500_fk_cascade_fix.ts` est **écrite à la main**, pas générée par diff. Le générateur de Payload produit toujours `ON DELETE SET NULL` pour la relation de `tenantsArrayField`, ce qui est incohérent avec la colonne `tenant_id` en `NOT NULL`. Une régénération naïve de la baseline perdrait ce correctif `CASCADE`.

---

## 7. Infra & faits opérationnels

- **Conteneur** : 1× taille **M = 512 Mo de RAM** — juste pour Next + Payload + Sentry. Un crash `memory quota exceeded` le 2026-08-31 (cause probable : activité de dev intense + Sentry, non confirmée). Si ça se reproduit : `scalingo --app civelo scale web:1:L` → 1 Go, ~+14 €/mois.
- **Limite de taille d'image Scalingo : 2048 Mo.** `.slugignore` exclut `/.next/cache` (cache webpack incrémental, ~1,9 Go, aucune utilité à l'exécution) — sans ça, l'image dépassait la limite après l'ajout de Sentry.
- **SLA Scalingo** : 98 % sur 1 conteneur (≈ 14 h de panne/mois tolérées avant avoir). ~67 incidents plateforme sur 16 mois, résolution moyenne ~1h30. **Aucune redondance multi-région** — à envisager quand le volume/CA le justifiera, pas avant. Filets de secours actuels : sauvegardes vérifiées + export mono-tenant (l'appli peut tourner ailleurs).
- **Addon Postgres** : id `ad-bcf68729-cff8-487c-a5b5-3e7c99a781a9`, plan `postgresql-starter-512`.

## 8. Sauvegardes

- Scalingo Postgres Starter : **sauvegardes quotidiennes automatiques, rétention 7 jours** (rien à configurer, inclus).
- **Vérifiées restaurables le 2026-08-31** — vraie restauration `pg_restore` dans un PG17 neuf (le dump est en format custom v1.16, PG16 ne sait pas le lire). Pas juste « le fichier existe ».
- Commandes : `scalingo --addon ad-bcf68729-cff8-487c-a5b5-3e7c99a781a9 --app civelo backups` / `backups-download`.
- Point à garder en tête : 7 jours seulement. Un problème de données non détecté plus longtemps ne serait plus rattrapable par sauvegarde.

## 9. Monitoring

- **Sentry** intégré le 2026-08-31 (setup manuel — le wizard officiel s'arrête sans rien produire, même en `--non-interactive`). Fichiers : `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `app/global-error.tsx` ; `next.config.mjs` wrappe `withSentryConfig(withPayload(nextConfig), …)`.
- Org Sentry : `studio-web-15`, projet : `civelo`. DSN dans `NEXT_PUBLIC_SENTRY_DSN` (`.env` local + variable Scalingo). Pas de `SENTRY_AUTH_TOKEN` → pas d'upload de sourcemaps (dégrade proprement, le build passe).
- **Routine cloud quotidienne** (8h Paris / `0 6 * * *` UTC) : lit Sentry via son connecteur MCP, envoie un résumé en français à `studiowebcantal@gmail.com`. `trigger_id: trig_01QTnxSYqd4scm3GtPhp3vYj`. Un test manuel a échoué au départ car l'environnement cloud bloque le curl direct vers `sentry.io` (politique d'egress) — d'où le passage par le connecteur MCP Sentry.

## 10. Souveraineté de l'hébergement (argument juridique secteur public)

- **Scalingo** : SAS française (Strasbourg), héberge sur l'infra **Outscale** (Dassault Systèmes), région **certifiée SecNumCloud** (ANSSI). Conforme RGPD, ISO 27001:2022.
- **OVHcloud** : français (Roubaix).
- Cette combinaison évite le *Cloud Act* américain — vrai argument concret pour une administration publique, pas juste marketing. Détaillé dans `../../civelo-briefing-commercial.md` (à la racine de `Documents/perso/`).

## 11. Export / réversibilité

- `scripts/export-tenant.ts` + `scripts/build-tenant-archive.ts` → produisent une **archive autonome dockerisée** qu'une commune peut faire héberger par n'importe quel prestataire (code + données + médias + `docker-compose.yml` + `DEPLOIEMENT.md`).
- Bouton **« Exporter le site »** dans l'admin « Mes sites » (super-admin uniquement). Date du dernier export tracée dans `Tenants.derniereExportation` (champ en lecture seule, posé uniquement par la route d'export).
- **Mode mono-tenant** (`SINGLE_TENANT_SLUG`) : le plugin multi-tenant reste chargé à l'identique → schéma DB strictement identique (vérifié par diff `pg_dump`). Seuls le comportement (filtres, sélecteur) et l'UI changent.
- Test de bout en bout : `scripts/e2e-archive-test.sh` (build archive → `docker compose up` sur base vierge → import → vérifs). Dernier run : 20/20.

---

## 12. État des fonctionnalités

**✅ Fait**
- Multi-tenant + isolation testée
- Sécurité npm : 23 → 14 vulnérabilités, la critique éliminée (`overrides` pour sharp/postcss, vitest 4)
- Suppression de tenant (contrainte FK réparée)
- Onboarding automatique : au clic sur « Nouveau site », 18 pages génériques créées (hook `afterChange`) + domaine ajouté à l'app Scalingo via son API
- Export / réversibilité mono-tenant + suivi de date
- Migrations Postgres automatisées (hook postdeploy)
- Monitoring Sentry + digest quotidien par email
- Sauvegardes vérifiées restaurables

**🔴 Reste**
- **Email / SMTP** : le formulaire de contact n'est branché sur rien. Ne pas utiliser une boîte Gmail perso (limites d'envoi, risque de suspension) — prévoir un vrai service transactionnel (Mailgun, Brevo…).
- Tests en vraie charge (jamais fait ; objectif 250 communes)
- RGAA sur les thèmes `app` et `accueillant` (seul `edito` est audité)
- Redondance multi-région (prématuré au stade actuel)
- Garde-fou CI : les tests d'isolation existent mais ne bloquent pas un déploiement
- Juridique : CGV, politique de confidentialité RGPD (hors périmètre technique)
- Idée en réflexion, pas décidée : assistant IA dans le back-office pour encadrer la saisie de contenu (aide à la rédaction, garde-fou accessibilité, relecture avant publication). Faisable, coûte à l'usage.

---

## 13. Conventions de travail sur ce projet

- **Répondre exclusivement en français.**
- **Vérifier, ne pas supposer** : vrai `npm run build` + vrai boot + vrai test (curl, restauration, e2e) avant de dire « c'est fait ». `tsc` seul ne suffit pas.
- **Diffs minimaux**, réutiliser les données et composants réels plutôt que dupliquer.
- Avant tout `git checkout` / `reset` / `rm -rf` dans le repo : `git status` d'abord, stash/commit ce qui traîne.
- Ne pas s'éparpiller sur du setup annexe non demandé.
- **Confirmer avant les actions vers l'extérieur ou à coût** (montée en gamme de conteneur, envoi d'email, modification directe de la prod). Les actions DDL directes sur la base de prod sont bloquées par le garde-fou du mode auto — passer par l'utilisateur avec le SQL exact.
</content>
