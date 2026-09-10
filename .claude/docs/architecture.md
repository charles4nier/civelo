# Architecture

Vue de haut de Civelo : ce qu'est le produit, la stack, le modèle multi-tenant, les rôles, la console super-admin, la carte du repo, les variables d'environnement.

Pour le modèle de contenu Payload (gabarits, menu, collections), voir [`content-model.md`](content-model.md). Pour tout ce qui est opérationnel (dev local, déploiement, migrations, infra), voir [`operations.md`](operations.md).

---

## 1. Le produit

Un **SaaS multi-tenant** : une seule application, une seule base, qui sert jusqu'à ~250 sites de communes (mairies) françaises. Onboarder une commune = une ligne en base + un enregistrement DNS, jamais un nouveau déploiement de code. Un correctif de sécurité se déploie **une fois**, pas 250 fois.

| | |
|---|---|
| Marque | Civelo — domaine `civelo.fr` |
| Repo GitHub | `github.com/charles4nier/civelo` (remote `origin`) |
| App Scalingo | `civelo`, région `osc-fr1` (remote `scalingo`, `git@ssh.osc-fr1.scalingo.com:civelo.git`) |
| Stockage objet | OVH Object Storage, bucket `civelo-storage` (`eu-west-par`) |
| Tarif *(à reconfirmer avant tout usage commercial)* | ~2900 € de mise en place + abonnement mensuel (~59 €) |
| Équipe | 2 personnes — le porteur (culture technique mais **pas développeur hands-on** : il cadre, décide, sert de mains pour les actions navigateur/terminal) + un associé au commercial |
| Client de référence | Saint-Hilaire-Bonneval, en ligne sur `edito.civelo.fr`. `app.civelo.fr` et `accueillant.civelo.fr` sont des démos avec du contenu fictif, pas de vraies communes |

**Règle commerciale (non négociable)** : ne JAMAIS employer « SaaS », « multi-tenant », « plateforme mutualisée » face à un client final. De son point de vue, il a **son** site : données isolées, sa propre adresse, son propre admin. Le briefing destiné à l'assistant de l'associé est à la racine de `Documents/perso/` (`civelo-briefing-commercial.md`).

---

## 2. Stack

| Couche | Choix | Contrainte |
|---|---|---|
| Framework | Next.js **15.4.11** | Pinné exact. `@payloadcms/ui@3.88.0` exige `next >=15.4.11 <15.5.0` (ou un saut Next 16, que Payload ne supporte pas encore). Bloque aussi la résolution de certaines CVE `next` — cf. `operations.md` §Sécurité |
| CMS | Payload CMS **3.88.0** + `@payloadcms/plugin-multi-tenant` | |
| Runtime | React 19, PostgreSQL 17 en prod (16 en local) | React 19 imposé par `@payloadcms/richtext-lexical` |
| Hébergement app | Scalingo, buildpack Node (pas de Dockerfile pour l'app principale) | Node auto-sélectionné (24.19.0), aucun pin `engines.node` |
| Stockage médias | S3 → bucket OVH. En mode mono-tenant : bascule sur disque local | |
| Monitoring | Sentry (`@sentry/nextjs@10`) | Setup manuel — cf. `operations.md` §Monitoring |
| Tests | Vitest 4 (`tests/`, exclu du `tsc` racine via `tests/tsconfig.json`) | |

**Le build de prod ne valide ni les types ni le lint** : `next.config.mjs` a `typescript.ignoreBuildErrors: true` et `eslint.ignoreDuringBuilds: true`. C'est pourquoi la règle « vrai build + vrai boot + vrai test » compte : `tsc --noEmit` en local est le seul garde-fou de type, et il n'est pas dans la CI.

`types/payload-types.ts` **n'existe pas** — le repo n'a pas de types Payload générés. Les types viennent des `CollectionConfig` directement.

### 3 thèmes visuels (`themes/`)

| Thème | État | Tenant |
|---|---|---|
| `edito` | Thème de référence, seul entièrement branché sur Payload, **audité RGAA (0 constat ouvert)** | Saint-Hilaire-Bonneval |
| `app` | Pages branchées sur Payload, contenu de démo | `app.civelo.fr` |
| `accueillant` | Pages construites, page Accueil au design bespoke d'origine restaurée | `accueillant.civelo.fr` |

`themes/registry.ts` mappe `Tenants.theme` → le `RootLayout` du thème. Chaque thème expose `components/` + `RootLayout.tsx`.

---

## 3. Modèle multi-tenant

### Résolution du tenant

Par le header **`Host`** de la requête, sans réécriture d'URL (pas de segment `/commune-a/...` : chaque commune a déjà son propre domaine).

- `shared/lib/tenant.ts` → `getCurrentTenant(payload)`, enveloppé dans `cache()` de React (dédup sur une requête). Lit `headers().get('host')`, retire un éventuel `www.`, cherche `Tenants.domaine`. Renvoie `null` (jamais d'exception) si rien ne matche.
- **Mode mono-tenant** (`SINGLE_TENANT_SLUG` défini, cas de l'archive livrable) : court-circuit — le seul tenant existant est renvoyé sans regarder l'hôte. `headers()` reste appelé quand même : c'est ce qui déclenche la détection « Dynamic API » de Next et empêche un pré-rendu statique (sinon l'archive fige le contenu de repli du moment du build). **Ne jamais retirer ce `await headers()`** — c'est un bug déjà vécu.

### Isolation

Chaque fonction de `lib/payload.ts` (`getNavLinks`, `getFooterData`, `getIdentiteData`, `getPageBySlug`…) résout le tenant courant et l'ajoute à son `where`. **Ne jamais faire une requête non scopée** qui pourrait renvoyer le contenu d'une autre commune.

Le filtrage automatique du plugin multi-tenant est scopé au cookie de l'admin — il ne protège **pas** les appels serveur du site public (sans cookie). Toute la garantie d'isolation du front public repose sur le `where` tenant ajouté à la main dans `lib/payload.ts`.

Suite de tests : `tests/tenant-isolation/` — `npm run test:isolation`. Existe mais **ne bloque pas** un déploiement (garde-fou CI manquant, cf. roadmap).

### Collections tenant-scopées

Via la config du plugin dans `payload.config.ts` : `pages`, `categories`, `media`, `documents`, `pois`, `sentiers`, plus `identite` / `bouton-entete` / `footer` (en `isGlobal: true`).

**`icones` n'est PAS tenant-scopée** — bibliothèque de noms `lucide-react` partagée, curatée une fois par le super-admin, identique pour toutes les communes. La scoper reviendrait à dupliquer ~40 lignes identiques par commune sans bénéfice d'isolation.

`Users` porte le champ `tenants` via `tenantsArrayField` (`@payloadcms/plugin-multi-tenant/fields`) — un utilisateur peut appartenir à plusieurs communes. C'est cette relation qui, via le défaut de l'adaptateur Postgres (`ON DELETE SET NULL` sur une colonne `NOT NULL`), a causé le bug de suppression de tenant — corrigé par une migration **écrite à la main** (`operations.md` §Migrations).

---

## 4. Les 3 rôles (`collections/access.ts`)

4 portes booléennes par rôle ; le scoping par tenant se pose par-dessus (plugin, ou explicite dans `Users.ts`).

| Fonction | Vrai pour |
|---|---|
| `isSuperAdmin` | `role === 'super-admin'` |
| `isAdminOrAbove` | `super-admin` ou `admin` |
| `isLoggedIn` | tout utilisateur authentifié |
| `isSuperAdminField` | `FieldAccess`, `super-admin` uniquement — verrous champ par champ |

- **super-admin** — l'équipe Civelo. Transversal à toutes les communes. Structure complète (pages, catégories, gabarits) + gestion de tous les comptes.
- **admin** — côté mairie (ex. le maire / le secrétaire général). Gère les comptes `editeur` de **sa (ses) commune(s) uniquement** (`Users.ts`, scopé par tenant). Ne touche **jamais** à la structure : ni pages, ni catégories, ni gabarits. Ne peut pas se promouvoir ni promouvoir au-dessus de `editeur`.
- **editeur** — contenu quotidien uniquement, sur sa (ses) commune(s).

Verrous champ par champ sur `pages` (accès `update` = `isSuperAdminField`) : `title`, `slug`, `menu`, `gabarit`, `liste.layoutType`, et tous les champs `icone` verrouillés par item. Détail du câblage collection par collection : `content-model.md` §Accès.

`scripts/create-admin-user.ts` — création d'un premier compte super-admin en ligne de commande (exécuté via le loader `_resolve-ts.mjs`, cf. `operations.md`).

---

## 5. Console super-admin & domaine d'administration

### `SUPER_ADMIN_DOMAIN`

Le domaine de la console qui voit **toutes** les communes avec le sélecteur de tenant Payload (`admin.civelo.fr` en prod, `localhost` en local). Tout autre domaine arrivant sur `/admin` est **verrouillé automatiquement** sur le tenant correspondant, sans sélecteur.

Mécanique du verrou :
- `middleware.ts` (runtime Edge, ne parle pas à Postgres) redirige vers `/api/lock-tenant` qui, lui (runtime Node), résout le tenant par domaine via l'API locale Payload et pose deux cookies : `tenant-locked-host` (encode `<host>::<tenantId>`, réimposé à chaque requête par le middleware car `payload-tenant` reste modifiable côté client) et `payload-tenant`.
- Sur le `SUPER_ADMIN_DOMAIN`, le middleware redirige vers `/admin` sans verrou.

### Tenant « Civelo Admin »

Un **vrai tenant** en base, avec `domaine = SUPER_ADMIN_DOMAIN`, qui héberge les comptes de l'équipe. Le hook `beforeChange` de `Users.ts` y rattache automatiquement tout nouvel utilisateur. Ce tenant est **exclu** de la grille « Mes sites ».

### Composants admin sur mesure (`admin/`)

| Dossier | Rôle |
|---|---|
| `admin/MesSites/` | Grille des sites (cards), popup de réglages par site : **Exporter le site** (super-admin) + **Supprimer**. `SiteSettingsMenu.tsx` |
| `admin/Dashboard/` | Tableau de bord d'accueil de l'admin |
| `admin/CreateTenantButton/` | Bouton « Nouveau site » → `POST /api/tenants` → déclenche le seed 18 pages + l'enregistrement DNS Scalingo |
| `admin/Nav/`, `admin/LoginLogo/`, `admin/BreadcrumbHome/` | Chrome de l'admin (le `LoginLogo` retombe sur un libellé générique : affiché avant tout contexte de tenant) |
| `admin/IconPickerField/`, `admin/IconPreviewField/`, `admin/IconCell/` | Sélecteur d'icône `lucide-react` |
| `admin/RowLabel/`, `admin/DynamicArrayLabel/`, `admin/ArrayAddRowBefore/`, `admin/SectionHeading/`, `admin/LabelWithInfo/`, `admin/HiddenLabel/` | Aides d'UI sur les champs répétables / la mise en forme du formulaire |
| `admin/lib/` | Helpers partagés de ces composants |

Routes API custom (`app/(payload)/api/`) : `lock-tenant`, `tenant-domain/[id]` (enregistrement DNS), `tenant-export/[id]` (archive). Le catch-all Payload est `[...slug]` — **ne jamais** placer une route custom sous un chemin qui entrerait en collision avec lui.

---

## 6. Carte du repo

```
├── app/(frontend)/        → routes publiques (route group)
├── app/(payload)/
│   ├── admin/             → admin Payload (+ importMap.js généré)
│   ├── api/               → [...slug] (catch-all Payload) + lock-tenant + tenant-domain + tenant-export
│   ├── layout.tsx, custom.css
├── app/global-error.tsx   → catch-all top-level pour Sentry
├── admin/                 → composants admin sur mesure (cf. §5)
├── themes/{edito,app,accueillant}/  → chacun : components/, RootLayout.tsx  ;  registry.ts fait le mapping
├── collections/           → Pages, Tenants, Users, Media, Documents, Categories, Pois, Sentiers, Icones, access.ts
├── globals/               → Footer, Identite, BoutonEntete
│                            ⚠ nommage legacy : ce sont des COLLECTIONS tenant-scopées (isGlobal:true côté plugin), pas des Globals Payload
├── lib/
│   ├── payload.ts         → couche data (getNavLinks, getFooterData, getIdentiteData…), résout le tenant à chaque appel
│   ├── seedDefaultPages.ts→ seed des 18 pages génériques (hook afterChange de Tenants)
│   └── scalingoDomains.ts → enregistrement auto du domaine via l'API Scalingo
├── shared/lib/tenant.ts   → getCurrentTenant()
├── middleware.ts          → verrou de tenant sur /admin hors SUPER_ADMIN_DOMAIN
├── migrations/            → baseline + fk_cascade_fix + index.ts
├── scripts/
│   ├── migrate-run.ts / migrate-create.ts   → remplacent le CLI Payload (cassé sur ce Node)
│   ├── export-tenant.ts / build-tenant-archive.ts / e2e-archive-test.sh  → export mono-tenant
│   ├── import-tenant.template.ts   → copié dans chaque archive (erreur tsc attendue hors archive)
│   ├── create-admin-user.ts, seed*.ts, gen-importmap.ts, migrate-mongo-to-postgres.ts
│   └── _resolve-ts.mjs   → loader ESM maison pour exécuter les .ts
├── Procfile               → web + postdeploy (migrations)
├── .slugignore            → exclut /.next/cache de l'image déployée
├── instrumentation.ts, instrumentation-client.ts, sentry.{server,edge}.config.ts
└── tests/                 → tenant-isolation/  (+ tsconfig.json propre)
```

---

## 7. Variables d'environnement

| Variable | Rôle | Sensible |
|---|---|---|
| `DATABASE_URI` | Connexion Postgres (local : container Docker ; prod : addon Scalingo, aussi exposé en `DATABASE_URL`) | oui |
| `PAYLOAD_SECRET` | Secret Payload — valeur aléatoire longue, différente par environnement | oui |
| `SUPER_ADMIN_DOMAIN` | Domaine de la console qui voit toutes les communes (`admin.civelo.fr` en prod, `localhost` en local) | non |
| `SINGLE_TENANT_SLUG` | Si défini → mode mono-tenant (archive livrable) : court-circuit de la résolution par hôte | non |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Stockage médias (bucket OVH en prod, MinIO en local). Absents → disque local | oui (clés) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry, injecté client + serveur | non (public par nature) |
| `NEXT_PUBLIC_SITE_URL` | URL publique de base (liens absolus, sitemap) | non |
| `SCALINGO_API_TOKEN` | Token API perso Scalingo — enregistrement DNS automatique. **Posé par l'utilisateur directement sur Scalingo, jamais collé en chat** | oui (élevé) |
| `SCALINGO_APP_NAME` | Nom de l'app Scalingo (défaut `civelo`) — cible CNAME `${APP_NAME}.osc-fr1.scalingo.io` | non |
| `MONGO_LEGACY_URI` | Ancienne base MongoDB, le temps de la bascule des données. À retirer une fois la migration terminée | oui |
| `PAYLOAD_MIGRATING` | `true` pendant le hook postdeploy → désactive le mode `push` de Payload | non |
| `EXPORT_TENANT_YES` | `1` → bypass de la confirmation interactive de `export-tenant.ts` (utilisé par la route d'export) | non |
| `NODE_ENV` / `NEXT_RUNTIME` / `CI` | Standard Next/Node — `NEXT_RUNTIME` (`nodejs`/`edge`) route le chargement Sentry dans `instrumentation.ts` | non |

Prod (vérifié) : `NEXT_PUBLIC_SENTRY_DSN`, `SCALINGO_API_TOKEN`, `SUPER_ADMIN_DOMAIN` sont bien positionnés.

---

## 8. Pattern de repli de `lib/payload.ts`

Chaque `get*Data()` de `lib/payload.ts` :
1. `const payload = await getPayloadClient()` (client Payload local, singleton) ;
2. résout le tenant courant (`getCurrentTenant`) ;
3. `find` scopé au tenant ;
4. **si Payload est injoignable ou si rien ne matche → repli sur une valeur codée en dur**, jamais d'exception qui casserait le rendu.

⚠ Les valeurs de repli (`DEFAULT_NAV_LINKS`, `FOOTER_FALLBACK`) ont été neutralisées en contenu **générique** lors du pivot multi-tenant. Avant ça, elles étaient spécifiques à Saint-Hilaire-Bonneval — une commune fraîchement onboardée aux globals vides aurait affiché l'adresse et la nav de Saint-Hilaire. Piège de test : un mauvais `Host` en local fait tomber sur ce repli silencieusement (cf. `operations.md` §Pièges locaux).
