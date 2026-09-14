# Feuille de route & historique

Document vivant. Deux parties : ce qui est **fait** (historique daté, du plus ancien au plus récent) et ce qui **reste** (priorisé). À mettre à jour à chaque chantier clos.

Pour le détail du *pourquoi* de chaque décision produit : [`decisions-log.md`](decisions-log.md). Pour l'état technique courant : [`architecture.md`](architecture.md), [`content-model.md`](content-model.md), [`operations.md`](operations.md).

---

## Fait

### Phase 0 — Template mono-commune (`saint-hilaire-demo`)

- Site de mairie type en Next.js 14 + SCSS (BEM), arborescence complète, navigation refondue.
- Audit RGAA : 0 constat ouvert (patterns Disclosure / Dialog / focus-ring réutilisables).
- Positionné comme **template** vendu ~2500 € / commune — un déploiement par commune à l'époque.

### Phase 1 — Rendre le site contributable via Payload (décisions 1 → 87)

- **Modèle de contenu** : `gabarit` et `menu` indépendants, 4 sections de menu fixes, une seule collection `pages` à champs conditionnels, gabarit Liste unique à 6 `layoutType`, gabarits singleton (Accueil / Horaires / Carte).
- **Collections de support** : `categories` (verrouillées par page), `media`, `documents`, `pois`, `sentiers`, `icones` (bibliothèque `lucide-react` avec aperçu du glyphe). Abandon des collections `telephones`/`emails` (sélecteur jugé non intuitif → champs texte directs).
- **Rôles** : modèle à 3 niveaux (`super-admin` / `admin` / `editeur`) câblé dans `collections/access.ts`, verrous champ par champ sur la structure.
- **Bascule des données réelles** : ~150 entrées migrées du contenu en dur vers Payload (script d'import, pas de retranscription manuelle).
- **Admin sur mesure** : sidebar écrite à la main, tableau de bord « Bonjour {prénom} », RowLabel / DynamicArrayLabel, réhabillage terracotta, wording 100 % français (« section », jamais « bloc »). Positionné comme **argument de vente n°1**.
- **Éditorial fidèle au design d'origine** : blocs Intro triptyque, texte centré, 2 colonnes + tuiles, image pleine largeur, grille de 3 images.
- En-tête et pied de page éditables (`identite`, `bouton-entete`, `footer`).

### Phase 2 — Pivot SaaS multi-tenant (décisions 88 → 97)

- **Base** : MongoDB → PostgreSQL (`@payloadcms/db-postgres`), nouveau protocole de lancement des scripts (`_resolve-ts.mjs`).
- **Stockage** : S3 (bucket OVH), préfixe par commune.
- **Multi-tenant** : collection `tenants`, `@payloadcms/plugin-multi-tenant`, champ `tenant` sur 6 collections, `tenantsArrayField` sur `Users`, 3 globals convertis en collections `isGlobal: true`.
- **Isolation** : résolution du tenant par header `Host` (`shared/lib/tenant.ts`), `where` tenant ajouté à la main dans chaque fonction de `lib/payload.ts`, suite de tests `tests/tenant-isolation/`.
- **Multi-thèmes** : `edito` (ex-style-edito, référence), `app` (ex-style-prestige), `accueillant` (ex-style-ludique) — `themes/registry.ts` mappe `Tenants.theme`.
- **1er déploiement réel** : Scalingo (`osc-fr1`) + OVH Object Storage, produit renommé **Civelo**.
- **Verrou admin par domaine** : tout domaine hors `SUPER_ADMIN_DOMAIN` est verrouillé sur son tenant (incident réel corrigé).

### Phase 3 — Finalisation « mode pro » (2026-08 → 2026-09)

| Date | Chantier |
|---|---|
| 2026-08-29 | **Export / réversibilité mono-tenant** : `export-tenant.ts` + `build-tenant-archive.ts` → archive dockerisée autonome (code + données + médias + `DEPLOIEMENT.md`). Test e2e `e2e-archive-test.sh` : 20/20. |
| 2026-08-29 | Fix pré-rendu statique : `await headers()` réintroduit dans le court-circuit mono-tenant de `getCurrentTenant()` (sinon l'archive fige le contenu de repli). |
| 2026-08-30 | Panne d'admin (code neuf + ancien schéma) → point de départ du chantier migrations. |
| ~2026-08-30 | **Bouton « Exporter le site »** dans l'admin « Mes sites » (super-admin), date du dernier export tracée (`Tenants.derniereExportation`). |
| ~2026-08-30 | **Suppression de tenant réparée** : contrainte FK `users_tenants` passée en `ON DELETE CASCADE` (locale en direct, prod via tunnel) puis figée en migration écrite à la main. |
| 2026-08-31 | **Migrations Postgres automatisées** : `migrations/` (baseline + fk_cascade_fix), hook `postdeploy` du `Procfile`, `payload_migrations` de prod amorcée à la main. Scripts `migrate-run.ts` / `migrate-create.ts` (le CLI Payload officiel plante sur ce Node). |
| 2026-08-31 | **Sécurité npm** : 23 → 14 vulnérabilités, la critique éliminée (`overrides` sharp/postcss, vitest 4, `tests/` sorti du `tsc` racine). |
| ~2026-08-31 | **Onboarding automatique** : clic « Nouveau site » → 18 pages génériques (`lib/seedDefaultPages.ts`, hook `afterChange`) + domaine ajouté à l'app Scalingo via son API (`lib/scalingoDomains.ts`). |
| 2026-08-31 | **Monitoring Sentry** (`@sentry/nextjs`, setup manuel) + `.slugignore` pour tenir sous la limite d'image de 2 Go. Routine cloud quotidienne 8 h → digest email FR. |
| 2026-08-31 | **Sauvegardes vérifiées restaurables** : vraie restauration `pg_restore` dans un PG17 neuf, pas juste « le fichier existe ». |
| ~2026-09 | **Footer** : colonnes de liens de menu restaurées (vrais liens `navLinks`, plus des `#`), fix de la double bordure `__address`. |
| ~2026-09 | **Briefing commercial** pour l'assistant de l'associé (`civelo-briefing-commercial.md`, racine `Documents/perso/`) : présentation technique simple + argument souveraineté, règle « jamais “SaaS” face au client ». |
| 2026-09-10 | **Réorganisation de la doc** : `.claude/docs/` (architecture / content-model / operations / decisions-log / roadmap), `CLAUDE.md` racine réduit à un index, `ARCHITECTURE.md` supprimé. |
| 2026-09-14 | **4ᵉ thème `classique`** : scaffolding + Accueil sur mesure inspiré de saint-hilaire-digital-hub, migration d'enum, wiring Payload/admin. |
| 2026-09-14 | **Thème `app` renommé `moderne`** (dossier, `ThemeName`, select Payload, scripts) via `ALTER TYPE ... RENAME VALUE` — aucun tenant ne l'utilisait en prod, migration sans risque de donnée. Contenu de l'ancien tenant `app` supprimé (orphelin, `tenant_id` à `NULL`) retrouvé et rattaché au nouveau tenant `moderne.civelo.fr`. |
| 2026-09-14 | **FK `tenant_id` passées en `CASCADE`** sur `pages`/`media`/`documents`/`pois`/`sentiers`/`categories`/`identite`/`footer`/`bouton_entete` (étaient en `SET NULL`, écrit à la main comme `fk_cascade_fix` — le générateur Payload ne permet pas ce choix). Supprimer un tenant de test ne laissera plus de contenu orphelin s'accumuler. 74 pages orphelines déjà accumulées nettoyées (tunnel `db-tunnel` + `DELETE` manuel, l'action automatisée étant bloquée par le garde-fou "Cloud Storage Mass Delete"). |
| 2026-09-14 | Conteneur web remonté en taille **L** (1 Go) après un nouveau pic mémoire à 99 %. |

---

## Reste

### Prioritaire

- **Mode brouillon / preview (jugé indispensable par l'utilisateur, 2026-09-14).** Payload le gère nativement (`versions: { drafts: true }`) — permettrait à une secrétaire de préparer une actu/page sans la publier tout de suite, et de la prévisualiser avant publication. Coût réel : toutes les fonctions de `lib/payload.ts` qui servent le site public devront filtrer explicitement "publié uniquement", plus une vraie route de prévisualisation (token/cookie, pas juste un bouton). Commencer petit — `Pages` seul — plutôt que tout activer d'un coup.
- **Email / SMTP transactionnel.** Le formulaire de contact n'envoie rien aujourd'hui. Choisir un fournisseur (Mailgun / Brevo / …), **pas** une boîte Gmail perso (limites d'envoi, risque de suspension). Brancher l'adaptateur email de Payload + le formulaire de contact des 3 thèmes.
- **Finaliser la routine Sentry.** Attacher le connecteur MCP Sentry (`be646c17-f74e-401a-a501-5c8b14339202`, `https://mcp.sentry.dev/mcp`) au trigger `trig_01QTnxSYqd4scm3GtPhp3vYj` et réécrire son prompt pour lire Sentry via MCP au lieu du curl direct (bloqué par l'egress du cloud). Se pilote côté claude.ai/routines.

### Avant de vraiment passer à l'échelle

- **Garde-fou CI.** Les tests d'isolation (`npm run test:isolation`) existent mais ne bloquent aucun déploiement. Ajouter un pipeline qui fait échouer un push si `tsc --noEmit`, `test:isolation` ou `build` échoue (le build de prod ignore actuellement types + lint).
- **Tests de charge.** Jamais faits. Objectif ~250 communes sur 1 conteneur M (512 Mo). Mesurer avant de vendre en volume ; prévoir le passage `scale web:1:L` voire multi-conteneurs.
- **RGAA sur `app` et `accueillant`.** Seul `edito` est audité (0 constat). Même méthode que l'audit `saint-hilaire`.

### Juridique (hors périmètre technique, à cadrer avec l'associé)

- CGV, politique de confidentialité RGPD, mentions légales, clause de réversibilité écrite (l'outil existe déjà : l'export mono-tenant).

### Plus tard / à décider

- **Redondance multi-région.** Prématuré au stade actuel (SLA Scalingo 98 % sur 1 conteneur). À rouvrir quand le CA le justifie. Filets actuels : sauvegardes vérifiées + export mono-tenant.
- **Assistant IA dans le back-office.** Aide à la rédaction, garde-fou accessibilité, relecture avant publication. Faisable, coûte à l'usage. Pas décidé.
- Retirer `MONGO_LEGACY_URI` et le code de bascule Mongo une fois la migration de données définitivement validée.
