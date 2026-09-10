# Modèle de contenu Payload

État **actuel** du modèle éditorial, distillé du journal des décisions (`decisions-log.md`). Le journal reste la source pour le *pourquoi* et l'historique (supersessions incluses) ; ce fichier dit ce qui est vrai aujourd'hui.

Principe qui chapeaute tout : **on vend une architecture, pas juste un site.** Le classement du menu et le catalogue de gabarits sont le produit éprouvé — pas un réglage laissé à chaque commune.

---

## 1. Une page = deux décisions parallèles

| Champ | Ce qu'il fixe | Qui le choisit |
|---|---|---|
| `gabarit` | Le composant qui rend la page + les champs que Payload expose | Dev, à la création de la page |
| `menu` | Où la page vit dans la navigation (une des 4 sections) | Dev, à la création |

- **Indépendants**, pas imbriqués : n'importe quel gabarit dans n'importe quelle section.
- `menu` est **obligatoire pour toutes les pages, y compris l'Accueil** (règle sans exception ; on y accède par le logo).
- Une page = **une seule** entrée de menu.
- **Les 4 sections de menu sont fixes** : L'essentiel / Votre mairie / Ma commune / Tourisme & découverte. Non renommables, non supprimables, pas de 5ᵉ.
- Ordre dans un sous-menu et ordre des items d'une liste : **glisser-déposer** dans l'admin (`orderable` / `array` Payload), jamais un champ `order` numérique. Par défaut chronologique pour les items, réordonnançable manuellement.

---

## 2. Une seule collection `pages`, champs conditionnels

Toutes les pages, tous gabarits confondus, vivent dans **`pages`**. `title` / `slug` / `menu` / `gabarit` en commun, puis un `group` par gabarit affiché seulement si `data.gabarit` correspond (`admin.condition`).

Pourquoi une seule collection : le menu se construit en une requête ; les liens inter-pages pointent vers une cible unique ; l'éditeur a un seul menu « Pages » à connaître.

`gabarit` est bloqué tant que `title` est vide (force un ordre de remplissage).

---

## 3. Catalogue des gabarits

### Multi-instances (l'éditeur peut en créer plusieurs — via le dev)

| Gabarit | Contenu |
|---|---|
| **Liste** | Hero + 1–2 filtres + collection d'items + CTA optionnel. La variante est portée par le champ **`liste.layoutType`** (voir §4). |
| **Éditorial** | Page à blocs modulaires : voir §5. Sert Histoire, La commune, et toute page rédactionnelle. |
| **Trombinoscope** | Liste de personnes avec photos (`membres[]` : nom, rôle, photo, email…). Élus aujourd'hui, pourrait servir au personnel administratif. |
| **Catalogue de lieux** | Collection extensible `salles[]` (ajouter une salle = une entrée, pas de code). Démarré minimal, étoffé au besoin réel. |
| **Contact** | `coordonnees` (adresse / téléphone / email à plat) + `precision`. |
| **Numéros utiles** | Deux tableaux : urgences + contacts locaux. |

### Singleton contribuable (une seule instance par site, contenu éditable)

| Gabarit | Contenu |
|---|---|
| **Accueil** | Blocs dans l'ordre : Section d'introduction (hero) → Section Accès rapides (3 tuiles + bande agenda auto) → Actualités (3 dernières, calcul auto + épinglage) → Mot du maire → Section Découverte (3 cards → POI/Sentier) → Section contact. |
| **Horaires** | 7 jours en champs fixes nommés (`lundi`…`dimanche`, `matin`/`aprèsMidi` éditables, jour non éditable) + fermetures exceptionnelles + contacts pratiques. |
| **Carte interactive** | Rendu Leaflet = code. Les POI et sentiers sont des collections éditables (voir §6). Quasi aucun champ propre sur la page. |

Le singleton est appliqué par un hook `beforeValidate` qui rejette la création d'une 2ᵉ page du même gabarit — **pas** un Global Payload (un Global ne peut pas être la cible d'un `relationship`, or Horaires et Carte doivent rester relationnables depuis le menu).

---

## 4. Le gabarit Liste et ses `layoutType`

Un **seul** gabarit Liste, 6 variantes via `liste.layoutType` (anciennement nommé `carte` — renommé pour ne pas le confondre avec le composant visuel par item, ex. `ContactCard`). Chaque `layoutType` embarque : les champs de l'item + son rendu + la stratégie de tri de la collection.

| `layoutType` | Champs d'item (résumé) | Tri |
|---|---|---|
| **Annuaire** (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs) | `nom`, `categorie`, `badge?`, `description?`, `adresse?`/`telephone?`/`email?` (à plat) | — |
| **Démarches** (accordéon) | `titre`, `categorie`, `resume`, `contenu` (richText). Icône verrouillée **par item** | — |
| **Actualités** | `titre`, `categorie`, `date`, `extrait`, `epinglee` (case → Accueil), `lienDocument?` (relation). Pas de page de détail | Plus récent d'abord |
| **Document** | `titre`, `type`, `date`, `fichier` (upload) | Récent d'abord ; filtre année calculé auto |
| **Budget/Projet** | `nature` (Budget/Projet), `titre`, `date` ; si Budget → `fichier` ; si Projet → `statut` + `description` | — |
| **Agenda** | `titre`, `categorie`, `date`, `horaire` (texte libre), `lieu`, `description` | Chronologique croissant |

Le **nombre de filtres est fixe par `layoutType`** (déterminé par le composant `XxxLayout`), jamais un choix éditeur. Le champ « Nombre de filtres » a été retiré.

---

## 5. Le gabarit Éditorial — blocs au choix

Blocs modulaires dans `sections`, sélectionnables dans « Ajouter un bloc ». Fidèles au design d'origine du template (pas des blocs génériques) :

- **Intro (triptyque + texte)** — carte de texte + 3 images (1 grande + 2 carrées), `positionImages` droite/gauche.
- **Texte centré (évolution)** — pleine largeur, fond teinté, texte centré max 800 px.
- **Titre + 2 colonnes + tuiles** — en-tête + 2 colonnes richText + jusqu'à 4 tuiles optionnelles (vide → 2 colonnes simples).
- **Image pleine largeur** — `imageDesktop` + `imageMobile` séparées (vraie art direction, pas un recadrage CSS).
- **Grille de 3 images** — 3 portraits, flex desktop / empilé mobile.

Rendu factorisé dans `shared/components/EditorialLayout/Sections.tsx` (un seul mappage bloc → JSX, réutilisé par la route générique `app/[...slug]/page.tsx` et les routes statiques).

Les images ne peuvent pas être migrées par script : `relationTo: 'media'` refuse une URL brute (`ValidationError`). Elles sont ajoutées par le client via l'admin ; le repli statique (`data.ts`) référence encore les fichiers `/public` directement.

---

## 6. Collections de support

| Collection | Rôle | Accès (cf. `access.ts`) |
|---|---|---|
| `categories` | Catégories verrouillées **par page** (un `select` statique ne peut pas varier selon la page). Champs : `nom`, `page` (relation), `icone` (relation `icones`), `couleur`. Une catégorie sans `page` = la « liste universelle » (échappatoire). | CRUD super-admin, lecture connectés |
| `icones` | Bibliothèque `lucide-react` : `nom` (FR, ex. « Téléphone ») + `icone` (nom exact du composant, ex. `Phone`). Aperçu du glyphe dans l'admin (`admin/IconPreviewField`, `IconCell`, `IconPickerField`). **Non tenant-scopée** — partagée, curatée une fois. | CRUD super-admin, lecture connectés |
| `media` | Images. `image` (upload, mimeTypes image), `alt` (**obligatoire** — exigence RGAA), `credit?`. | upload/édition connectés, suppression `isAdminOrAbove` |
| `documents` | Fichiers téléchargeables (PDF a minima). `fichier` (upload), `titre?`. | idem `media` |
| `pois` | `nom`, `description`, `categorie` (Hébergement / Site à visiter), `latitude`, `longitude`, `image`. **Éditables par la mairie** (décision 8). | CRUD connectés |
| `sentiers` | `nom`, `description`, `distance`, `duree`, `trace` (coordonnées), `image`. Éditables par la mairie. | CRUD connectés |

**Il n'y a plus de collections `telephones` / `emails`** (décision 22 annulée par 49) : téléphone et email sont des champs texte directs partout, jamais un sélecteur en liste.

### Globals (nommage legacy — ce sont des collections tenant-scopées en `isGlobal: true`)

| Slug | Contenu | Accès |
|---|---|---|
| `identite` | `titre`, `sousTitre`, `logo` (upload). Lu par Header **et** Footer (une seule saisie). | — |
| `bouton-entete` | Texte + lien vers une page (`boutonFields`). | `isLoggedIn` |
| `footer` | `description`, adresse/téléphone/email (`contactFields`), `joursOuverture`/`horaires` (2 champs simples), `facebook?`/`instagram?`. | `isLoggedIn` |

---

## 7. Ce que l'éditeur mairie ne fait jamais

Règle générale (décision 10) : **l'éditeur décide du contenu, jamais de la structure ni du visuel.**

- **Création / suppression de page** = acte structurel → super-admin uniquement (peut casser un lien référencé, désorganiser le menu).
- **`title`, `slug`, `menu`, `gabarit`, `liste.layoutType`** = verrouillés champ par champ (`isSuperAdminField`).
- **Type de carte (`layoutType`) verrouillé par page**, fixé une fois au setup.
- **Catégories verrouillées par page** : l'éditeur choisit dans la liste fournie, n'en invente pas. Chaque page Annuaire a sa **propre** liste.
- **Icône + couleur toujours verrouillées** : suivent la catégorie, sauf `layoutType` Démarches où l'icône est verrouillée par item.
- Les 7 jours des Horaires sont des champs fixes nommés (impossible d'en ajouter/supprimer).

Ce que l'éditeur fait au quotidien : ajouter / modifier / supprimer des items dans les listes existantes, éditer le contenu des pages existantes, gérer POI / sentiers / médias / documents.

Ce qui est fixé **au setup** (dev + porteur, à chaque nouvelle commune) : choix de `layoutType` par page, liste de catégories par page, association catégorie ↔ icône ↔ couleur (couleurs redéfinies selon la charte du client).

---

## 8. Liens inter-pages

Tout lien vers une autre page du site (tuiles Accès rapides, cards Découvrir…) est un champ **`relationship`** (ID du document), jamais une URL recopiée. Le slug réel est résolu au rendu → le lien survit à un renommage.

Les cards « Découvrir » de l'Accueil pointent vers un **POI ou un Sentier précis** (relation simple), rendu en `/tourisme/carte-interactive?id=...` — `?id=` est bien lu côté serveur et présélectionne le POI sur la carte.

---

## 9. Admin sur mesure

L'interface d'admin est **l'argument de vente n°1** auprès des mairies (une secrétaire l'utilise au quotidien ; le site public est surtout consulté par les habitants). D'où les composants sur mesure de `admin/` (sidebar `admin/Nav/` écrite à la main, tableau de bord, RowLabel/DynamicArrayLabel, etc. — cf. `architecture.md` §5).

Conventions de wording actées : **toujours « section », jamais « bloc »** ; zéro anglais dans les libellés ; l'aide de champ à droite de l'intitulé, pas en dessous. Admin en français (`i18n` fr, fallback fr, en gardé en repli).

Le sélecteur visuel de gabarit (`PreviewPicker` + SVG `public/admin-previews/`) est **abandonné à l'usage** mais laissé dans le repo (reprenable si de vraies captures existent un jour) — remplacé par un `select` classique avec `admin.description`.
