# Opérations

Tout ce qui est opérationnel : dev local + pièges, déploiement, migrations, infra, sauvegardes, monitoring, souveraineté, export, roadmap.

Pour la structure du code et le modèle multi-tenant, voir [`architecture.md`](architecture.md).

---

## Développement local

- **Node** : `nvm use 22.21.1` (la prod tourne sur Node 24.19.0 — vérifié compatible ; aucun pin `engines.node`).
- **Postgres local** : container Docker `style-edito-postgres` (PG 16), base `style_edito`. `DATABASE_URI` dans `.env`.
- **Exécuter un script TS** :
  ```
  node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/<x>.ts
  ```
  Le binaire CLI officiel `payload` plante sur ce Node (`ERR_REQUIRE_ASYNC_MODULE` — interaction CJS/ESM avec le top-level await de `@payloadcms/richtext-lexical`). D'où `scripts/migrate-run.ts` / `scripts/migrate-create.ts` qui appellent `payload.db.*` directement.
- **Créer un premier compte super-admin** : `scripts/create-admin-user.ts` (via le loader ci-dessus).
- **npm scripts** : `dev`, `build`, `migrate`, `migrate:create`, `test:isolation`, `test:e2e-archive`, `export-tenant`, `build-tenant-archive`.
- **`--env-file` échoue dur si le fichier manque** → les scripts destinés à tourner en prod (`migrate`, `migrate:create`) n'ont **pas** `--env-file=.env` : la prod fournit les variables autrement.

### Pièges locaux à connaître

1. **Le domaine du tenant Saint-Hilaire diffère entre local et prod** : `saint-hilaire-bonneval.fr` en LOCAL, `edito.civelo.fr` en PROD (les deux bases ont divergé). Pour tester le front en local avec ses vraies données :
   ```
   curl -H "Host: saint-hilaire-bonneval.fr" http://localhost:3000/
   ```
   Se tromper de host → repli silencieux sur `DEFAULT_NAV_LINKS` / `FOOTER_FALLBACK`, qui ont des liens réels par coïncidence → on croit que ça marche alors que non.
2. **`SUPER_ADMIN_DOMAIN=localhost` dans `.env`** → le middleware redirige TOUT vers `/admin` en local. Pour tester le front : `SUPER_ADMIN_DOMAIN="" npm run dev`.
3. **Sorties muettes** : certains `node …` lancés en foreground ne sortent rien malgré une exécution réussie (quirk flush/exit). Contournement fiable : lancer en arrière-plan et lire le fichier de sortie.
4. **`tsconfig.tsbuildinfo` est versionné** (convention inhabituelle du repo) — il apparaît dans chaque `git status`, ne pas s'en inquiéter.
5. **Erreur `tsc` connue et attendue** : `scripts/import-tenant.template.ts` référence `../app/payload.config` qui n'existe qu'une fois le template copié dans une archive. Ignorer.
6. **Ne pas lancer `next build` / `rm -rf .next` pendant qu'un `next dev` tourne** (celui de l'utilisateur, éventuellement) — ça corrompt son cache. Utiliser un serveur de dév éphémère sur un autre port pour les tests curl.

---

## Déploiement

- **TOUJOURS pousser sur les DEUX remotes** : `git push origin HEAD:main` **ET** `git push scalingo HEAD:main`. GitHub sert aussi de contexte de code à des outils tiers (Sentry). Jamais un seul.
- Le remote `scalingo` ne supporte pas `git fetch` (push-only) — pour l'état réel de la prod : `scalingo --app civelo deployments`.
- **Le build de prod n'exécute ni `tsc` ni `eslint`** (`next.config.mjs` : `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` à `true`). Une erreur de type ne fait PAS échouer un déploiement. Le seul garde-fou de type est `npx tsc --noEmit` en local, hors CI.
- **`Procfile`** :
  ```
  web: npm start
  postdeploy: PAYLOAD_MIGRATING=true npm run migrate
  ```
  Scalingo démarre le nouveau code → lance le hook postdeploy (les migrations) → **puis seulement** bascule le trafic public. L'ancienne version continue de servir pendant tout ce temps. Ce séquencement protège du scénario « code neuf + ancien schéma » qui a causé une panne d'admin le 30/08.
- Statuts de déploiement : `success | failed | aborted | crashed | hook-error | build-error`.
- Build ≈ 4–6 min. Si un push local échoue par timeout à 3 min : le déploiement continue côté Scalingo, vérifier avec `deployments`.

---

## Migrations de base de données

**Procédure normale** : `npm run migrate:create -- <nom>` en local (base de dev) → relire le fichier généré dans `migrations/` → committer → le déploiement suivant l'applique automatiquement en prod via le hook postdeploy.

**Ne plus JAMAIS faire d'`ALTER TABLE` manuel en prod** pour un changement de schéma porté par `payload.config.ts`. Les DDL directes sur la base de prod sont bloquées par le garde-fou du mode auto — passer par l'utilisateur avec le SQL exact.

**Fichiers** : `migrations/` contient la baseline (`20260831_092241_baseline.ts` + `.json` snapshot), le correctif FK (`20260831_092500_fk_cascade_fix.ts`) et `index.ts` qui exporte le tableau ordonné.

**Historique (piège résolu le 2026-08-31)** : avant cette date, la prod ne synchronisait jamais son schéma automatiquement (le mode `push` de Payload est dev-only, désactivé quand `NODE_ENV=production` — et le hook force `PAYLOAD_MIGRATING=true` par-dessus). Chaque nouveau champ nécessitait un `scalingo db-tunnel` + SQL direct. Ça a causé **deux vraies pannes** fin août : contrainte FK cassée sur suppression de tenant, puis colonne manquante = admin totalement HS. Le système de migrations a fermé ce risque. La table `payload_migrations` en prod a été amorcée à la main avec les 2 premières migrations marquées « déjà appliquées » (schéma déjà en place).

**Piège si on retouche ce mécanisme** : `20260831_092500_fk_cascade_fix.ts` est **écrite à la main**, pas générée par diff. Le générateur de Payload produit toujours `ON DELETE SET NULL` pour la relation de `tenantsArrayField`, ce qui est incohérent avec la colonne `tenant_id` en `NOT NULL`. Une régénération naïve de la baseline perdrait ce correctif `CASCADE` — la suppression de tenant se remettrait à planter en HTTP 500.

Détail de forme : dans les fichiers de migration, séparer `import type { MigrateUpArgs, MigrateDownArgs }` de `import { sql }` — le loader maison n'élide pas les imports type-only mélangés à des valeurs.

---

## Infra & faits opérationnels

- **Conteneur** : 1× taille **M = 512 Mo de RAM** — juste pour Next + Payload + Sentry. Un crash `memory quota exceeded` le 2026-08-31 (cause probable : activité de dev intense + Sentry, non confirmée). Si ça se reproduit : `scalingo --app civelo scale web:1:L` → 1 Go, ~+14 €/mois. **Action à coût — confirmer avec l'utilisateur d'abord.**
- **Limite de taille d'image Scalingo : 2048 Mo.** `.slugignore` exclut `/.next/cache` (cache webpack incrémental, ~1,9 Go, aucune utilité à l'exécution) — sans ça, l'image dépassait la limite après l'ajout de Sentry. `.slugignore` suit la sémantique Go `filepath.Match`.
- **SLA Scalingo** : 98 % sur 1 conteneur (≈ 14 h de panne/mois tolérées avant avoir). ~67 incidents plateforme sur 16 mois, résolution moyenne ~1h30. **Aucune redondance multi-région.** Filets de secours actuels : sauvegardes vérifiées + export mono-tenant (l'appli peut tourner ailleurs).
- **Addon Postgres** : id `ad-bcf68729-cff8-487c-a5b5-3e7c99a781a9`, plan `postgresql-starter-512`.
- **DNS** : cible CNAME `civelo.osc-fr1.scalingo.io`. L'enregistrement du domaine sur l'app Scalingo est automatisé (`lib/scalingoDomains.ts`, route `POST /api/tenant-domain/[id]`, token perso `SCALINGO_API_TOKEN` échangé contre un bearer 1 h). Le pointage DNS chez le registrar de la commune reste manuel.

---

## Sauvegardes

- Scalingo Postgres Starter : **sauvegardes quotidiennes automatiques, rétention 7 jours** (rien à configurer, inclus).
- **Vérifiées restaurables le 2026-08-31** — vraie restauration `pg_restore` dans un PG17 neuf (le dump est en format custom v1.16, PG16 ne sait pas le lire). Pas juste « le fichier existe ».
- Commandes : `scalingo --addon ad-bcf68729-cff8-487c-a5b5-3e7c99a781a9 --app civelo backups` / `backups-download`.
- Point de vigilance : 7 jours seulement. Un problème de données non détecté plus longtemps ne serait plus rattrapable par sauvegarde.

---

## Monitoring

- **Sentry** intégré le 2026-08-31 (setup manuel — le wizard officiel s'arrête sans rien produire, même en `--non-interactive`). Fichiers : `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `app/global-error.tsx` ; `next.config.mjs` wrappe `withSentryConfig(withPayload(nextConfig), …)`.
- Org Sentry : `studio-web-15`, projet : `civelo`. DSN dans `NEXT_PUBLIC_SENTRY_DSN` (`.env` local + variable Scalingo). Pas de `SENTRY_AUTH_TOKEN` → pas d'upload de sourcemaps (dégrade proprement, le build passe).
- **Routine cloud quotidienne** (8 h Paris / `0 6 * * *` UTC), `trigger_id: trig_01QTnxSYqd4scm3GtPhp3vYj` : lit Sentry via son **connecteur MCP** (`connector_uuid: be646c17-f74e-401a-a501-5c8b14339202`, `https://mcp.sentry.dev/mcp`) et envoie un résumé en français à `studiowebcantal@gmail.com`. Le curl direct vers `sentry.io` est bloqué depuis l'environnement cloud (politique d'egress) — d'où le passage obligé par le connecteur MCP.

---

## Souveraineté de l'hébergement (argument juridique secteur public)

- **Scalingo** : SAS française (Strasbourg), héberge sur l'infra **Outscale** (Dassault Systèmes), région **certifiée SecNumCloud** (ANSSI). Conforme RGPD, ISO 27001:2022.
- **OVHcloud** : français (Roubaix).
- Cette combinaison évite le *Cloud Act* américain — vrai argument concret pour une administration publique, pas juste marketing. Détaillé dans le briefing commercial à la racine de `Documents/perso/`.

---

## Export / réversibilité

- `scripts/export-tenant.ts` + `scripts/build-tenant-archive.ts` → produisent une **archive autonome dockerisée** qu'une commune peut faire héberger par n'importe quel prestataire (code + données + médias + `docker-compose.yml` + `DEPLOIEMENT.md`).
- Bouton **« Exporter le site »** dans l'admin « Mes sites » (super-admin uniquement, `admin/MesSites/SiteSettingsMenu.tsx`, au-dessus de « Supprimer »). Date du dernier export tracée dans `Tenants.derniereExportation` (champ en lecture seule, posé uniquement par la route `GET /api/tenant-export/[id]`).
- **Mode mono-tenant** (`SINGLE_TENANT_SLUG`) : le plugin multi-tenant reste chargé à l'identique → schéma DB strictement identique (vérifié par diff `pg_dump`). Seuls le comportement (filtres, sélecteur) et l'UI changent. Voir `architecture.md` §3 pour le `await headers()` à ne jamais retirer.
- Test de bout en bout : `scripts/e2e-archive-test.sh` (build archive → `docker compose up` sur base vierge → import → 20 vérifs : site public, images, absence d'URL S3, propagation d'une édition admin, absence de fuite cross-tenant, 1 seul tenant en base, un seul thème). Dernier run : 20/20. `EXPORT_TENANT_YES=1` bypass la confirmation interactive.

---

## Sécurité npm

- `npm audit` : 23 → 14 vulnérabilités, **la critique éliminée**.
- `next@15.4.11` embarque des copies de `sharp` / `postcss` avec des CVE connues. On ne peut pas bumper `next` (pinné exact, peer `@payloadcms/ui`). Contournement : `overrides` dans `package.json` force `sharp` / `postcss` à des versions saines dans l'arbre de `next`.
- `vitest` passé en `^4.1.11` (résout des CVE transitives). L'inclure dans le `tsc --noEmit` racine cassait la résolution des types `payload` → `tests/` est exclu du `tsconfig.json` racine, avec un `tests/tsconfig.json` dédié.
- Risque résiduel documenté : les CVE `sharp`/`postcss` disparaîtront quand Payload supportera Next 16.

---

## État des fonctionnalités

**✅ Fait**
- Multi-tenant + isolation testée
- Sécurité npm (voir ci-dessus)
- Suppression de tenant (contrainte FK réparée + migration)
- Onboarding automatique : clic « Nouveau site » → 18 pages génériques (hook `afterChange` de `Tenants` → `lib/seedDefaultPages.ts`) + domaine ajouté à l'app Scalingo via son API
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
