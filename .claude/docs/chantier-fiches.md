# Chantier « fiches » — plan (décidé le 2026-09-29, pilote Actualités codé le 2026-09-29)

Plan **cible**, pas l'état actuel. Tant que le chantier n'est pas livré, l'état réel reste celui de [`content-model.md`](content-model.md). Le *pourquoi* est dans [`decisions-log.md`](decisions-log.md), décision 98.

---

## 1. Le problème

Aujourd'hui, un élément de liste (actualité, événement, démarche, commerce, document, projet) est une **ligne de tableau dans le document de la page liste** (`itemsActualites`, `itemsAgenda`… dans `collections/Pages.ts`). Il n'a pas d'existence propre :

- **pas d'URL** : impossible de cliquer sur une carte de grille pour ouvrir un contenu, de partager une actualité, de la faire référencer, ni de servir une **redirection** depuis l'ancien site d'une mairie vers un contenu précis ;
- **pas de vrai contenu** : une actualité n'a qu'un `extrait`, un document n'a que son PDF. Au regard du **RGAA (critère 13.3, version accessible des documents en téléchargement ; formulation et dérogation « avant le 23/09/2018 » à vérifier sur le référentiel officiel)**, les PDF des mairies sont presque toujours des scans : la seule version accessible réaliste, c'est un texte HTML à côté du PDF ;
- **tout dans un seul document** : une page Actualités après 3 ans, c'est des centaines de lignes. Chaque ajout réenregistre toute la page, deux éditeurs se bloquent, et il n'y a ni brouillon ni historique par élément ;
- la **recherche** et la **newsletter** (icônes présentes sur l'accueil atelier, services non branchés) n'ont rien de propre à indexer ni à envoyer.

## 2. Le modèle retenu

### Vocabulaire

**Fiche** : un contenu publié dans une page liste, avec sa propre URL. C'est une sorte d'article de blog. Le mot est **montré à la mairie** : menu « Publier une fiche », bouton « Nouvelle fiche ».

### Une seule collection `fiches`, rattachée à une page

- Tenant-scopée (plugin multi-tenant, comme `pages`).
- Relation **`page` obligatoire** vers une page de gabarit Liste de la même commune. C'est elle qui donne l'URL, la place dans le menu et les champs spécifiques de la fiche.
- Le type de la fiche (le `layoutType` de sa page) est **recopié sur la fiche** à la création (hook) : les champs conditionnels (`admin.condition`) et les requêtes n'ont pas besoin de relire la page.
- Une seule collection plutôt qu'une par type : une seule résolution d'URL, une seule requête de recherche, un seul gabarit de fiche à décliner, et deux pages du même type (ex. deux agendas) marchent sans développement.

### Socle commun à toutes les fiches

| Champ | Détail |
|---|---|
| Titre | obligatoire ; donne le `<h1>` et le slug |
| Slug | calculé depuis le titre, unique par commune + page |
| Image principale | facultative ; en haut de la fiche et sur la carte de grille ; `alt` obligatoire via `media` |
| Chapô | 2-3 lignes ; grille, résultats de recherche, newsletter |
| Texte | richText Lexical **restreint** : intertitres H2/H3 uniquement (le H1 est le titre), gras, listes, liens, images dans le texte ; pas de couleur ni de taille libres |
| Pièces jointes | un ou plusieurs `documents`, affichés avec nom, format et poids |
| Statut | brouillon / publié, aperçu (même mécanique que `pages`, décision du 2026-09-16) |
| Référencement | titre + description, préremplis depuis titre et chapô |

### Champs propres au type (hérités de la page)

| Type (`layoutType` de la page) | Champs en plus |
|---|---|
| Actualités | date, catégorie, épingler sur l'accueil |
| Agenda | date, horaire, lieu, catégorie |
| Démarches | catégorie (le `contenu` actuel devient le texte) |
| Annuaire | catégorie, badge, adresse, téléphone, e-mail, site web, contact nommé facultatif (aide : accord de la personne requis) |
| Publications (ex-Document) | type (compte rendu, arrêté, budget…), date ; aide du champ Texte : « version accessible du PDF » |
| Projets | statut (à l'étude, en cours, terminé), date |

**Budget/Projet se sépare** : un budget est une Publication de type Budget, un projet est une fiche Projets. Le champ `nature` disparaît.

Les catégories restent verrouillées par page (`filterOptions` sur la page de la fiche).

### Ce qui ne devient pas une fiche

Élus (trombinoscope), numéros utiles, fermetures des horaires, blocs de l'accueil (accès rapides, Découvrir, diaporama) : ce sont de la mise en page ou des lignes d'information, ils restent dans leur page. Salles (catalogue de lieux) : peut-être plus tard. POI et sentiers : déjà des collections, pourront recevoir une fiche plus tard sans migration.

## 3. Les pages

- **Les pages liste restent dans `pages`** : elles portent l'URL, la place dans le menu, le nom, le texte d'intro, l'encart du bas, le référencement de la liste, et servent de cible aux liens (accès rapides, diaporama).
- Elles **ne contiennent plus** les tableaux d'éléments. À la place : un panneau « Les fiches affichées sur cette page se gèrent dans *Publier une fiche › <nom de la page>* », avec un lien.
- Les autres pages (Accueil, Éditorial, Horaires, Contact, Élus, Salles, Numéros utiles, Carte) **ne changent pas** : la mairie continue d'en modifier le contenu.
- Côté visiteur, les pages liste ne changent pas (même URL, hero, filtres, grille, encart). Seule différence : **chaque carte ouvre sa fiche**.

### Création de pages : toujours super-admin

La création et la suppression de pages restent **réservées au super-admin** (règle actuelle, décision 10 et suivantes, confirmée). Une mairie qui a besoin d'une page non prévue la demande : page de texte (Éditorial) ou liste de fiches (sur le modèle d'un des types). Garde-fous, valables aussi pour le super-admin :

- slug calculé depuis le titre ; **renommage = redirection automatique** de l'ancienne URL ;
- une page naît en brouillon et n'entre dans le menu du site qu'une fois publiée ;
- suppression bloquée tant que la page a des fiches ou qu'un lien de l'accueil pointe vers elle, avec un message qui dit pourquoi.

## 4. L'admin

**Un seul chemin** pour publier (deux entrées vers la même chose perturberaient les éditeurs ; décidé le 2026-09-29) :

```
Publier une fiche          ← construit depuis les pages liste de la commune
  Actualités
  Agenda
  Démarches
  Commerces
  Vie associative
  …                        ← une entrée par page liste, avec le nom de la page

Structure du site          ← surtout super-admin
  Pages
  Catégories

Médias & fichiers
  Images
  Documents
```

- Le groupe « Publier une fiche » **n'est pas écrit en dur** : une entrée par page Liste de la commune, libellée avec le titre de la page. Une page créée, renommée ou absente met le menu à jour d'elle-même.
- Un clic ouvre la **liste des fiches de cette page** (colonnes date/titre/statut, recherche, filtres, pagination), avec un bouton **« Nouvelle fiche »**, qui crée une fiche déjà rattachée à la page.
- Le libellé du bouton est générique : on ne peut pas dériver « Nouveau commerce » de « Commerces & artisans ».

À vérifier à l'implémentation : Payload sait-il préremplir `page` quand on crée depuis une vue filtrée ? Sinon, lien de création sur mesure dans `admin/Nav/`. Le groupe dynamique demande de toute façon du sur-mesure dans `admin/Nav/`, qui l'est déjà.

## 5. URL et redirections

- Fiche : `/<chemin de la page liste>/<slug de la fiche>` (ex. `/vivre/commerces/boulangerie-dupont`), résolue par `app/(frontend)/[...slug]/page.tsx` : si le chemin complet n'est pas une page, on tente « page liste parente + fiche ». Les routes statiques existantes (`/mairie/actualites`…) ne captent que leur propre chemin, sans conflit.
- **Actualités et publications : date dans l'URL** (`/mairie/actualites/2026-09-29-titre`), pour éviter les doublons d'une année à l'autre (« Repas des aînés » tous les ans). Décidé le 2026-09-29. Les autres types n'ont que le titre.
- Collection **`redirections`** (tenant-scopée) : ancienne URL → page ou fiche (relation, pas d'URL recopiée). Lue dans le `[...slug]` avant la 404, puis `permanentRedirect` (301). Pas dans `middleware.ts` : runtime Edge, pas d'accès à Postgres (cf. décision 97). Sert à la reprise des sites existants et aux renommages.

## 6. Ce que le chantier touche

- Schéma : collection `fiches` + `redirections`, suppression des tableaux `items*` de `pages`. **Par migration** (`npm run migrate:create`), jamais d'`ALTER` à la main (règle 5).
- **Migration des données** en prod : script qui déplace, pour chaque commune, chaque ligne `items*` en fiche rattachée à sa page, puis vide les tableaux. Répété d'abord sur une copie de la base. C'est le point délicat.
- `lib/payload.ts` : `getActualitesItems`, `getAgendaItems`, `getAnnuaireItems`, `getDemarchesItems`, `getDocumentItems`, `getBudgetProjetItems`, `getAccueilData` (actus épinglées, agenda) lisent `fiches`. **Même forme de sortie qu'aujourd'hui** pour ne toucher ni les thèmes ni les contenus de secours (ni le skill maquette-commune).
- Nouveau gabarit de fiche dans chaque thème (atelier d'abord), cartes de grille en liens.
- `lib/seedDefaultPages.ts`, export/import mono-tenant (`scripts/export-tenant.ts`, `import-tenant.template.ts`), tests d'isolation (`tests/tenant-isolation/`) : ajouter `fiches` et `redirections`.
- Sitemap : ajouter les fiches.
- Doc : `content-model.md` réécrit une fois livré.

## 7. Ordre

1. **Pilote Actualités, de bout en bout** : collection `fiches` (socle + champs Actualités), migration des actualités de Saint-Hilaire, entrée « Publier une fiche › Actualités », fiche rendue dans le thème atelier, grille cliquable, sitemap. Valide le modèle.
2. Les 5 autres types, sur le même modèle (dont la séparation Budget / Projets).
3. `redirections` + garde-fous de renommage et de suppression des pages.
4. **Recherche** : requêtes scopées par commune sur `fiches` + titres des pages, résultats vers les fiches, dans la popin existante (`themes/atelier/components/FloatingButtons`, `SearchModal`).
5. **Newsletter** : inscriptions (consentement, désinscription) puis envoi des fiches Actualités. Suppose le choix d'un fournisseur d'e-mails transactionnels (voir `roadmap.md`, « Email / SMTP »), pas encore fait.

## 8. État du pilote Actualités (2026-09-29, déployé le 2026-09-29)

Codé et vérifié en local sur une base jetable (anciennes migrations appliquées par le code de `main`, communes de test avec des actualités à l'ancienne, puis migration par le nouveau code), puis déployé. La répétition sur une copie de la base de prod n'a pas été faite (téléchargement de la sauvegarde refusé par le garde-fou « données personnelles » de l'agent) ; à la place, la migration a été rendue tolérante aux anciennes données incomplètes (voir « reprise » ci-dessous) et testée sur ces cas.

**Fichiers**
- `collections/Fiches.ts` (collection), `collections/fichesTypes.ts` (`LAYOUTS_EN_FICHES = ['actualites']` : les types déjà passés en fiches), `collections/preview.ts` (aperçu commun pages/fiches), `shared/lib/slug.ts`.
- `migrations/20260929_094633_fiches_actualites.ts` : crée les tables, copie chaque actualité en fiche publiée (API locale, mêmes hooks que l'admin ; ancien `extrait` → chapô, `lienDocument` → `pageLiee`), puis supprime `pages_liste_items_actualites` (+ table de versions). `tenant_id` en CASCADE. `down` recopie les fiches publiées dans l'ancien tableau (testé).
- Admin : `admin/Nav` (groupe « Publier une fiche », construit depuis les pages Liste de la commune ; « Toutes les fiches » super-admin seulement), `admin/FichesListHeader` (nom de la page + seul bouton « Nouvelle fiche »), `admin/FichePageField` (page préremplie depuis `?page=`, type recopié), `admin/PanneauFiches` (renvoi depuis la page Actualités), raccourci « Nouvelle actualité » du tableau de bord.
- Site, **4 thèmes** : `lib/payload.ts` (`getActualitesItems` lit les fiches, même forme de sortie + `href` ; `getFiche`), `app/(frontend)/[...slug]/page.tsx` (fiche + métadonnées, `FicheLayout` choisi par thème). Corps de fiche commun : `shared/components/FicheContent` + mixin `shared/styles/_fiche-body.scss` ; chaque thème n'a que son en-tête (`themes/<thème>/components/FicheLayout` ; préau et belvédère réutilisent leur `PageHeader`, qui gagne un niveau `parent` dans le fil d'Ariane). Cartes cliquables dans la liste (`ActualitesLayout`) et sur l'accueil (`home/News`) des 4 thèmes.
- « Reprise » (`req.context.reprise`, migration et import d'archive) : catégorie et date ne sont pas exigées pour les anciennes données ; un extrait vide devient le titre.
- Export/import d'une commune : `fiches` exportée, réimportée avec relations et images du texte réécrites (`context.conserverSlug`).
- Tests d'isolation : 3 tests fiches (fiches de B jamais servies à A, même URL dans deux communes, brouillon jamais servi) ; `next/headers` simulé pour `isPreviewing`.

**Vérifié** : migration montante et descendante, URL (`AAAA-MM-JJ-titre`, date à l'heure de Paris, suffixe en cas de doublon, unicité par commune), 404 pour une fiche inconnue ou d'une autre commune, rendu de la liste, de la fiche et de l'accueil (fiche épinglée en premier), parcours éditeur dans Chrome (menu, liste filtrée, « Nouvelle fiche » préremplie, champs du type), 12/12 tests d'isolation.

**Limites connues du pilote**
- Préau et belvédère : les cartes de repli (données statiques, sans `href`) n'affichent plus leur faux « Lire la suite », qui n'était pas un lien.
- Les actualités migrées n'ont pas de texte complet (l'ancien modèle n'en avait pas) : leur fiche montre le chapô seul, à compléter par la mairie.
- Les actualités ajoutées dans un brouillon de page jamais publié ne sont pas reprises.
- `scripts/full-copy-tenant.ts` et `scripts/seed-demo-content-from-edito.ts` (outils de démo) ne copient plus les actualités : à adapter avant la prochaine copie de démo.
- Pas encore de sitemap (il n'en existe pas du tout aujourd'hui).
- Constaté pendant les tests, **préexistant sur `main`** : une frappe robot ultra-rapide (tous les caractères dans la même milliseconde) dans n'importe quel formulaire de l'admin, en `next dev`, provoque « Maximum update depth exceeded ». Rien à la frappe humaine.

**Déploiement** : 32 actualités copiées en fiches en prod (4 sites de démo × 8), sauvegarde manuelle `6abb95dd` juste avant.

## 9. Suite du chantier (2026-09-29 → 30)

Étapes 2 à 5 du §7 (« fais tout, on corrigera »).

**2. Les 5 autres types en fiches** — migration `20260929_135445_fiches_autres_types`.
- `LAYOUTS_EN_FICHES` = les 6 types. Champs ajoutés à `fiches` (affichés selon le type) : `horaire`, `lieu` (agenda) ; `badge`, `adresse`, `telephone`, `email`, `siteWeb` (annuaire) ; `icone`, verrouillée au super-admin (démarches) ; `nature`, `statut` (budget/projet). Catégorie obligatoire sauf budget/projet ; date dans l'URL aussi pour l'agenda.
- **Budget/Projet n'est finalement pas séparé** (écart au plan §2) : une fiche budget/projet garde `nature` (budget | projet), la page « Budget & projets » ne change pas. Séparer supposait de restructurer les pages ; à reprendre si utile.
- `fiches` devient `orderable` : l'ordre manuel de l'annuaire et des démarches est conservé (clés `_order` posées dans l'ordre des anciens tableaux ; les fiches déjà en base en reçoivent une).
- Lecture : les 6 `get*Items` passent par `findFichesDePage` ; même forme de sortie qu'avant + adresse de la fiche (`href` pour actualités et agenda, `ficheHref` ailleurs ; documents et budgets gardent `href` = le PDF). Encart « Infos pratiques » sur la fiche (horaire/lieu, coordonnées cliquables, statut d'un projet).
- 4 thèmes : nom d'un commerce et titre d'un événement cliquables, « Voir la fiche » dans une démarche dépliée, cartes documents / budgets / projets vers la fiche (plutôt que le PDF brut), agenda de l'accueil cliquable.
- Migration testée sur une base montée jusqu'à l'état de prod puis remplie avec le code de prod (10 éléments, cas limites : catégorie supprimée, texte vide), montée et descente.

**3. Redirections** — collection `redirections` (migration `20260929_140701_redirections_newsletter`).
- Ancienne adresse (collée telle quelle : domaine retiré, décodée, sans barre finale, requête `?id=…` conservée) → page ou fiche. Gérées par l'admin de la commune et le super-admin (menu « Paramètres › Redirections »).
- Résolution dans `app/(frontend)/[...slug]` avant la 404 (`getRedirection`, 308 via `permanentRedirect`) : correspondance exacte, puis plus long préfixe redirigé vers une page (les fiches d'une page renommée suivent).
- Page dont l'adresse change (tout enregistrement sauf un brouillon) : redirection créée automatiquement (`origine: renommage`, hook `Pages`), et une redirection qui partait de la nouvelle adresse est supprimée. Pas de condition sur le statut de l'ancienne version : les pages semées à la création d'une commune restent `draft` en base tout en étant servies (constaté en test).
- Suppression d'une page bloquée si elle a des fiches, ou si l'accueil (accès rapides, diaporama, boutons du hero) ou le bouton d'en-tête pointe vers elle.
- Limite : les pages servies par une route statique (`app/(frontend)/commerces/page.tsx`…) lisent leur page par un slug écrit en dur ; si on les renomme, la nouvelle adresse (servie par `[...slug]`) marche, mais l'ancienne route statique retombe sur ses données de repli au lieu de rediriger.

**4. Recherche** — `rechercher()` dans `lib/payload.ts` : pages et fiches publiées de la commune, titre + chapô + texte des fiches, sans accents ni casse, tous les mots requis, filtrage en mémoire (pas d'index plein texte). Route `/api/recherche` (popin atelier, résultats au fil de la frappe) et page `/recherche?q=` dans les 4 thèmes (formulaire GET, sans JS ; non indexée). La loupe de l'en-tête préau mène à `/recherche`.

**5. Newsletter, inscriptions seules** — collection `abonnes-newsletter` (données personnelles : admin et super-admin, menu « Paramètres › Lettre d'information », export CSV `/api/newsletter/export`). Inscription `POST /api/newsletter` (consentement obligatoire, champ piège, réinscription sans doublon), désinscription `/api/newsletter/desinscription?jeton=…` prête pour les futurs envois. Popin d'inscription dans atelier (bouton du bloc Agenda). **Aucun e-mail envoyé** : ni confirmation (pas de double opt-in), ni envoi de lettre, tant qu'aucun fournisseur n'est choisi.

**Vérifié en local** (base montée jusqu'à l'état de prod) : les 5 listes et 5 fiches en 200 dans les 4 thèmes ; redirections (saisie, renommage, fiches d'une page renommée, 308/404) ; recherche (accents, casse, texte des fiches, page `/recherche`) ; newsletter (inscription, refus sans consentement ou adresse invalide, robot, doublon, désinscription, réinscription, export CSV admin / refusé à l'éditeur et à l'anonyme, API REST fermée) ; popins atelier dans Chrome (clavier, focus, Échap) ; 14/14 tests d'isolation (+ recherche et redirections).

**Restes / limites**
- Scripts anciens encore écrits pour les tableaux `liste.itemsXxx` : `scripts/seed.ts`, `migrate-mongo-to-postgres.ts`, `full-copy-tenant.ts`, `seed-demo-content-from-edito.ts`, `localize-media-for-tenant.ts` (outils de démo et de bascule, plus à jour). Dans `import-tenant.template.ts`, la réécriture de ces tableaux est devenue sans effet.
- Newsletter : seulement dans atelier (les 3 autres thèmes n'avaient pas de bouton).
- Recherche : pas de popin dans clocher et belvédère (pas de bouton existant) ; la page `/recherche` existe partout mais n'est liée que depuis atelier et préau.

