# Chantier Payload — rendre le site contributable

Objectif : passer d'un contenu hydraté/en dur (le template actuel) à un site où le client (mairie) peut créer et gérer ses propres pages, via Payload CMS. Le dev (toi) fournit des **gabarits**, le client les remplit.

Vision produit : vendre au client une **architecture**, pas juste un site — une réflexion sur ce qu'est un site de mairie standardisé, pensée pour bien fonctionner à l'usage. Le classement du menu (L'essentiel / Votre mairie / Ma commune / Tourisme & découverte) est central à cette architecture et doit être conservé tel quel.

## Décisions actées

### 1. Gabarit et menu sont deux champs indépendants, pas une hiérarchie

Une page a deux décisions parallèles, pas imbriquées :

- **`gabarit`** — liste fermée définie par le dev (Annuaire, Éditorial, Documents filtrables, Page spéciale...). Détermine le composant qui rend la page et les champs que Payload expose à l'éditeur.
- **`menu`** — où la page vit dans la navigation.

Pourquoi séparé : le même gabarit sert déjà à plusieurs endroits différents du menu dans le code actuel (`AnnuaireLayout` → Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs). Rien ne garantit qu'une future commune voudra la même correspondance gabarit ↔ section. Coupler les deux réintroduirait une contrainte qui n'existe pas structurellement.

### 2. Toute page doit être dans le menu

Pas de page orpheline (liée seulement depuis une card ou le footer) : `menu` est un champ **obligatoire**, pas optionnel.

### 3. Une page = une seule entrée de menu

Pas de page listée à deux endroits. Principe : la clarté prime sur la flexibilité ici. Un seul choix de section, pas une relation multiple.

### 4. N'importe quel gabarit dans n'importe quelle section

Aucune restriction gabarit ↔ section. C'est explicitement vu comme la force du système (flexibilité totale pour les communes futures), pas un risque.

### 5. Ordre dans un sous-menu : drag-and-drop, pas de champ `order` numérique

Réordonnancement par glisser-déposer dans l'admin Payload (pattern nativement supporté). Évite les conflits/incohérences de numéros d'ordre entre pages.

### 6. Le gabarit "Liste" est unique — la variation se fait par `carte`, pas par un nouveau gabarit

En étudiant les 18 pages existantes, plusieurs (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs, Mes démarches, Actualités, Documents & publications, Budget & projets, Agenda) partagent exactement le même squelette : Hero + 1 ou 2 filtres + collection d'items + CTA optionnel. Seul ce qui varie change réellement :

- les **champs** de chaque item (ex. adresse/tél pour un commerce, date/heure/lieu pour un événement, fichier à uploader pour un document)
- le **rendu** de l'item (fiche statique, accordéon expansible, pavé date...)
- le **comportement de la collection** qui va avec (tri "plus récent d'abord" vs tri chronologique, groupement, états calculés comme "passé/à venir")

Plutôt que multiplier les gabarits pour capturer ces différences, tout ça est porté par un champ **`carte`** — obligatoire, affiché dès qu'on choisit le gabarit "Liste" (pas une option secondaire découverte plus tard dans le formulaire). Une carte n'est donc pas qu'un template visuel d'item : elle embarque champs + rendu + stratégie de traitement de la collection entière.

**Cartes identifiées pour le gabarit Liste** : Annuaire, Démarches (accordéon), Actualités, Document, Budget/Projet, Agenda.

**Nombre de filtres** (1 ou 2) et **présence d'un CTA de fin** restent des réglages de configuration du gabarit Liste, indépendants du choix de carte.

### 7. Un gabarit démarre minimal et évolue avec le besoin réel

Ex. "Catalogue de lieux/prestations" démarre avec un seul bloc de contenu, "salles" (collection extensible — ajouter une salle = ajouter une entrée, pas toucher au code). D'autres blocs (ex. un encart "intro") pourront s'ajouter plus tard si le besoin se confirme, sans repartir de zéro. Principe général : ne pas sur-designer un gabarit pour des besoins hypothétiques, l'étoffer quand un cas réel se présente.

### 8. Aucune page hors gabarit — tout est contribuable, y compris Horaires et Carte interactive

Le client doit pouvoir contribuer partout, pas seulement là où c'est structurellement simple. Horaires et Carte interactive ont donc chacune un vrai gabarit, avec des champs structurés plutôt qu'un texte libre :

- **Horaires** : tableau de 7 lignes (jour, matin, après-midi) + liste de fermetures exceptionnelles + bloc de contacts pratiques
- **Carte interactive** : le rendu Leaflet reste du code, mais les POI et les sentiers deviennent une collection éditable (nom, catégorie, description, image, coordonnées) au lieu d'un fichier `data.ts` en dur

### 9. Gabarits multi-instances vs. gabarits singleton

Deux familles, toutes les deux contribuables :

- **Multi-instances** — Liste, Éditorial, Trombinoscope, Catalogue de lieux, Contact, Numéros utiles : le client peut en créer plusieurs pages (même s'il n'en existe qu'une aujourd'hui pour certains, ex. Trombinoscope pourrait aussi servir pour "Le personnel administratif")
- **Singleton contribuable** — Accueil, Horaires, Carte interactive : une seule instance possible par site, mais le contenu reste éditable par le client, pas codé en dur

### 10. L'éditeur mairie ne décide jamais rien de structurel ou visuel — seulement le contenu

Règle générale qui chapeaute plusieurs décisions précédentes, formulée explicitement pour ne laisser aucune ambiguïté :

- **Le type de carte est verrouillé par page**, fixé une fois à la création de la page (setup), jamais changeable en ajoutant un item. Une page "Commerces" utilise la carte "Annuaire" pour toujours.
- **Les catégories sont verrouillées par page, par défaut** — reprennent exactement ce qui existe déjà dans le code pour les pages connues aujourd'hui (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs, Actualités...). L'éditeur choisit parmi la liste fournie, n'en invente pas.
- **Icône + couleur sont toujours verrouillées pour l'éditeur, jamais un choix direct** — mais le niveau de verrouillage dépend de la carte : la plupart du temps elles suivent la **catégorie** (Annuaire, Actualités, Documents, Agenda), mais certaines cartes verrouillent l'icône **par item** plutôt que par catégorie, quand des items d'une même catégorie ont besoin d'être distingués visuellement. Cas identifié : **Démarches**, où chaque démarche (Naissance, Mariage, Décès...) garde sa propre icône même au sein d'une même catégorie ("État civil") — forcer l'alignement strict par catégorie ferait perdre cette distinction utile sans rien gagner en cohérence. Dans les deux cas, le principe reste intact : c'est toi (dev, au setup) qui fixes l'association, jamais l'éditeur.
- **Seule exception : la liste de type "universelle"** (nouveau besoin non anticipé, créée plus tard) — sort de ce cadre verrouillé, pioche dans l'ensemble des catégories déjà définies sur le site. C'est l'échappatoire explicite, pas la norme.

Ce qui reste possible au quotidien pour l'éditeur mairie : ajouter/modifier/supprimer des items de contenu (un commerce, une démarche, un événement...) dans les listes existantes. Rien de structurel.

Ce qui est fixé **au setup du projet** (toi, avec l'utilisateur, à chaque nouvelle commune) : le choix de carte par page, la liste de catégories par page, et l'association catégorie ↔ icône ↔ couleur — les couleurs étant redéfinies selon la charte graphique du client à chaque onboarding.

**Action à faire** : lister exhaustivement toutes les catégories déjà utilisées sur le site (tous les types de carte confondus — Annuaire des 4 pages, Actualités, Documents, Budget/Projets, Démarches, Agenda...), comme base de départ pour le setup de chaque nouvelle page.

### 11. Aperçu visuel par défaut pour chaque `carte` et chaque `gabarit`

Quand l'éditeur déroule le menu de choix (carte ou gabarit), chaque option doit s'afficher avec une **image d'aperçu**, pas juste un nom en texte — pour que le choix soit immédiatement compréhensible sans avoir à connaître le rendu final par cœur. S'applique aux deux niveaux : le choix du `gabarit` d'une page, et le choix de la `carte` dans le gabarit Liste.

Implique côté Payload un composant de champ personnalisé (les select natifs n'affichent pas d'image par option) — pas un simple champ standard.

**Action à faire** : produire une capture/illustration par carte et par gabarit existants, à stocker comme assets fixes (pas modifiables par le client, ce sont les aperçus des gabarits eux-mêmes).

### 12. Ordre des items à l'intérieur d'une page Liste : chronologique par défaut, drag-and-drop en override

Même logique que la décision 5 (ordre des sous-menus), appliquée cette fois aux items d'une liste (une actualité, une démarche, un événement...) :

- **Par défaut**, les items s'affichent dans l'ordre chronologique (le sens exact — plus récent d'abord ou date à venir croissante — dépend de la carte, déjà couvert par la décision 6).
- **L'éditeur peut réordonnancer manuellement par drag-and-drop** dans l'admin Payload si besoin, sans passer par un champ `order` numérique explicite.

### 13. Création et suppression de page réservées au dev, jamais au client

Extension directe de la décision 10 : supprimer (ou créer) une page est un acte structurel, pas un acte de contenu — ça peut casser un lien référencé ailleurs (ex. un bloc Accueil) ou désorganiser le menu. Le client garde la main sur le contenu et les items à l'intérieur des pages existantes, jamais sur l'existence des pages elles-mêmes.

Côté Payload : rôle "éditeur mairie" limité à l'édition de contenu/items ; création/suppression de pages réservée au rôle admin (le dev).

### 14. Liens inter-pages via `relationship` Payload, jamais une URL en texte

Tout bloc qui pointe vers une autre page du site (ex. les tuiles "Accès rapides" ou les cards "Découvrir" de l'Accueil) référence la page par un champ `relationship` (ID du document), pas par une URL recopiée en dur. Le lien réel (slug actuel) est résolu au rendu.

Pourquoi : garantit que le lien reste correct même si une page est renommée (son slug change). Le risque de lien mort par suppression est déjà écarté par la décision 13 (seul le dev supprime), mais la relation reste la bonne pratique pour éviter un état dupliqué (URL recopiée qui pourrait diverger du vrai chemin).

**Correction (vérifié dans le code réel, la première version de cette décision était fausse)** : les cards "Découvrir" de l'Accueil ne pointent pas vers la Carte interactive filtrée par catégorie. Elles pointent vers un **POI précis** via `?id=...` (ex. `?id=etang-bonneval`). Pas de champ hybride nécessaire — une relation simple vers un POI ou un Sentier suffit (voir décision 23, `pois`/`sentiers` en collections séparées justement pour permettre cette relation).

**Deuxième correction (l'analyse ci-dessus était trop rapide — vérifiée à nouveau en profondeur pendant le setup Payload, décision 26)** : `?id=` fonctionne en réalité. La page (`app/tourisme/carte-interactive/page.tsx`) lit `searchParams.id` côté serveur et le passe en prop à `CarteInteractive` → `MapClient`, qui l'utilise pour présélectionner le POI et faire un `FlyTo` dessus. Les liens Découvrir ne sont donc pas morts. Seul `?category=` (jamais utilisé par Découvrir de toute façon) n'est pas lu — pas un bug réel, juste un paramètre prévu mais non exploité. Retenu comme leçon : vérifier le comportement réel (lancer le site) avant d'affirmer un manque, pas seulement grep les noms de hooks attendus.

### 15. Les 4 sections de menu sont fixes, non modifiables côté client

Aucune section ne peut être renommée, supprimée, ni une 5e ajoutée par l'éditeur mairie. C'est explicitement le format de données éprouvé qui constitue le produit vendu (voir intro), pas un choix de configuration laissé à chaque commune.

### 16. Bloc "Actus" de l'Accueil : les 3 dernières par défaut, épinglage manuel possible

Par défaut, le bloc affiche les 3 actualités les plus récentes (calcul automatique). L'éditeur peut épingler une actu précise sur un emplacement à la place du calcul automatique.

**Mécanisme concret (décision 36)** : pas un champ croisé sur l'Accueil — une case à cocher `epinglee` directement sur chaque actu (`liste.itemsActualites[].epinglee`, sur la page "Actualités"). Au rendu, l'Accueil va chercher cette page et prend l'item épinglé ; si plusieurs actus sont épinglées en même temps, la plus récente (champ `date` de l'actu) est prioritaire.

### 17. Le "prochain événement" est intégré à la carte "L'essentiel en un clic" (QuickAccess), pas un bloc séparé

Plusieurs itérations avant de converger (remplacer la 3e actu → encart sous Actus → bloc autonome façon footer entre Actus et Contact) : la version retenue et implémentée sur le site en dur, c'est une **bande pleine largeur intégrée en bas de la carte QuickAccess** ("L'essentiel en un clic"), pas un bloc séparé plus loin sur la page.

- Le bloc Actus reste un vrai bloc Actus, intact, 3 actus (décision 16) — aucune logique d'agenda dedans.
- La tuile "Agenda du village" de QuickAccess faisait doublon avec cette bande — **retirée**, QuickAccess passe de 4 à 3 tuiles.
- La bande agenda occupe toute la largeur du bas de la carte QuickAccess (bleed jusqu'aux bords de la carte, sous les 3 tuiles), fond vert (`$gradient-forest`, même thématique que le bloc Contact) pour apporter de la couleur et se détacher du reste de la carte (claire) — signale immédiatement "ceci est un événement", pas une actu. Pas de bordure top colorée (retirée, jugée superflue avec celle déjà présente sur la carte QuickAccess elle-même).
- Contenu : date unique mise en avant (jour + mois, gros format), titre de l'événement, lien vers `/agenda`. Calculé dynamiquement à chaque rendu (l'événement à venir le plus proche), jamais stocké — à jour chaque jour sans intervention.
- Pas redondant avec le lien "Agenda" du menu "L'essentiel" (le lien menu sert une recherche active, la bande home pousse l'info à un visiteur qui n'irait pas la chercher spontanément).
- **Agenda vide** : si aucun événement à venir n'est programmé, la bande ne s'affiche simplement pas (pas de fallback à gérer).

### 18. Ordre des blocs Accueil (état final)

Après plusieurs réagencements successifs, l'ordre retenu : **Hero → QuickAccess (avec bande agenda intégrée) → Actualités → Mot du maire → Découvrir (Tourisme & Patrimoine) → Contact**.

Raisonnement : les deux contenus "vivants" (accès rapides + prochain rendez-vous, puis actualités) se suivent en premier — c'est ce que le visiteur récurrent vient chercher. Le mot du maire (contenu statique, quasi jamais mis à jour) vient après, comme transition éditoriale vers le contenu découverte/tourisme, plutôt qu'en détour avant les actualités. Contact toujours en clôture.

Au passage, les fonds de section Actualités et Découvrir ont été inversés : c'est désormais **Découvrir** qui porte le fond teinté (`$secondary-40`), Actualités reste sur le fond neutre de la page.

### 19. Une seule collection Payload `pages` pour tous les gabarits, avec champs conditionnels

Plutôt qu'une collection séparée par gabarit (`pagesListe`, `pagesEditorial`, `pagesTrombinoscope`...), toutes les pages du site — quel que soit leur gabarit — vivent dans **une seule collection `pages`**. Le champ `gabarit` est une colonne de cette collection (pas une collection à part), et les champs propres à chaque gabarit (ex. `carte` pour le gabarit Liste, `sections` pour Éditorial) n'apparaissent dans le formulaire d'édition que si le `gabarit` correspondant est sélectionné (`admin.condition` côté Payload).

**Pourquoi :**
- Le menu du site doit lister toutes les pages, tous gabarits confondus (décisions 1 à 5) — une collection unique permet une seule requête, alors que des collections séparées demanderaient d'agréger N collections à chaque affichage du menu.
- Les liens inter-pages (décision 14, champs `relationship`) pointent simplement vers `pages`, sans avoir besoin d'une relation polymorphe vers plusieurs collections cibles possibles.
- Expérience éditeur mairie plus simple : un seul menu "Pages" dans l'admin Payload avec toutes les pages listées (colonnes personnalisables, ex. afficher `gabarit` et `menu` directement dans la liste), plutôt qu'une dizaine de menus à mémoriser selon le gabarit.

Coût accepté : le schéma de la collection `pages` empile les champs de tous les gabarits (plus gros qu'une collection dédiée), à surveiller si le nombre de gabarits augmente beaucoup.

### 20. MongoDB comme moteur de base de données (pas Postgres, MySQL non supporté par Payload)

Contexte d'infra (à conserver ici, pas dérivable du code) : base de données **unique et partagée**, hébergée en DaaS sur Scalingo, distinguant les communes par un ID interne. Mais **pas de BO centralisé** : chaque commune est un projet Next.js séparé (comme `saint-hilaire-demo`), avec son propre Payload embarqué (ses propres routes `/admin` et `/api`) — cohérent avec le principe déjà en place sur `Commune.site` (déploiements séparés, pas de fusion multi-zones). `saint-hilaire-demo` est le **template de base** ; chaque commune déployée en sera une **variante** (le code peut diverger d'un projet à l'autre au fil du temps), pas une copie strictement synchronisée.

MySQL éliminé d'office : **non supporté par Payload**, dont les adaptateurs officiels sont PostgreSQL, MongoDB et SQLite (source : [documentation Payload](https://payloadcms.com/docs/database/overview)).

Entre Postgres et MongoDB, **MongoDB retenu**, pour une raison directement liée à cette archi multi-instances :

- MongoDB est schemaless au niveau base — chaque instance Payload (donc chaque commune) peut avoir un `payload.config.ts` légèrement différent sans rien casser chez les autres, ce qui correspond exactement au fonctionnement "template de base + variantes par projet" décrit ci-dessus.
- Postgres impose un schéma réel (tables générées par migration). Avec N projets déployés séparément partageant la même base, il faudrait que leurs migrations restent strictement synchronisées sur les collections partagées — une discipline lourde, en tension avec le principe "chaque commune peut varier".
- MongoDB est aussi l'adaptateur historique/le plus mature de Payload.
- Scalingo propose les deux en DaaS (PostgreSQL et MongoDB), donc pas de contrainte d'hébergement qui aurait tranché à la place.

### 21. Schéma de champs des 6 cartes du gabarit Liste

Établi en étudiant le code réel de chaque page (pas inventé). Rappel : icône/couleur ne sont jamais des champs éditeur, verrouillées par le dev au niveau catégorie ou item selon la carte (décision 10).

**Annuaire** (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs)
- `nom` (texte, requis)
- `categorie` (select, liste verrouillée par page)
- `badge` (texte, optionnel — sigle avant le nom, ex. "FCSH")
- `description` (texte, optionnel)
- `contacts` (liste répétable, optionnelle) : `type` (adresse / horaires / téléphone / email) + `valeur` (texte)

**Démarches** (accordéon)
- `titre`, `categorie` (select verrouillé), `resume` (texte court, visible fermé), `contenu` (richText — paragraphes, listes, liens externes, encarts type "note")
- Icône verrouillée par item, pas par catégorie (cf. décision 10 amendée)

**Actualités**
- `titre`, `categorie` (select verrouillé), `date` (vrai champ date), `extrait` (texte)
- `epinglee` (case à cocher, décision 16/36) — épingle cette actu sur l'Accueil
- `lienDocument` (relation optionnelle vers une page — remplace le `href` en dur actuel, décision 14)
- **Pas de page de détail** : une actu reste un extrait, jamais de contenu long ni de "lire la suite" (cohérent avec le retrait de ce lien sur la home et sur `/mairie/actualites`, tous deux corrigés faute de vraie destination)

**Document**
- `titre`, `type` (select verrouillé : Comptes-rendus / Bulletins / Budget / Arrêtés / Urbanisme), `date`, `fichier` (upload — remplace le `href: '#'` placeholder)
- L'upload Payload donne nativement format et poids du fichier, réutilisable pour l'affichage accessible du lien de téléchargement (point resté ouvert de l'audit RGAA — voir [[project-saint-hilaire-rgaa-audit]])

**Budget/Projet** (une seule carte, deux natures)
- `nature` (Budget / Projet), `titre`, `date`
- si Budget : `fichier` (upload, comme Document)
- si Projet : `statut` (À venir / En cours / Terminé), `description`

**Agenda**
- `titre`, `categorie` (select verrouillé : Conseil municipal / Manifestation / Vie associative / Cérémonie), `date`, `horaire` (texte libre — formats trop variables pour forcer deux champs début/fin), `lieu`, `description`

### 22. Collections `telephones` et `emails` — source unique des coordonnées, jamais de texte libre dupliqué

Découvert en modélisant : les coordonnées de la mairie sont aujourd'hui ressaisies en texte libre à 4 endroits différents (Footer, CTA/Accueil, page Contact, Horaires) — et ont déjà divergé dans le code actuel (numéros et emails différents selon l'endroit). Une mairie a en réalité **plusieurs** numéros/emails (secrétariat, urbanisme, standard...), donc pas un simple champ global unique — il faut une vraie liste, gérée une fois.

- Deux collections dédiées, `telephones` et `emails` (pas un array imbriqué dans un global — même raisonnement que pour `pois`/`sentiers`, décision 23 : un array imbriqué ne peut pas être proprement référencé par une relation ailleurs).
  - `telephones` : `label` (texte, ex. "Secrétariat", "Urbanisme"), `numero` (texte)
  - `emails` : `label` (texte, ex. "Contact général"), `adresse` (texte)
- Partout où un numéro/email doit apparaître (CTA de l'Accueil, page Contact, Horaires, Footer), le champ est une **relation** vers `telephones`/`emails` — jamais une resaisie. Concrètement pour l'éditeur : un menu déroulant listant les numéros/emails déjà enregistrés, pas un champ texte libre.
- Étend directement le principe de la décision 14 (relation plutôt que texte dupliqué) aux données de contact, pas seulement aux liens de page.
- L'adresse postale reste un champ texte simple (pas de liste identifiée à ce jour — une seule mairie physique par commune, pas de besoin observé de multi-adresses).

### 23. Schéma de champs des 3 gabarits singleton

Établi en étudiant le code réel (Hero, QuickAccess, MayorWord, Discover, CTA, Horaires, features/carte).

**Accueil** (blocs dans l'ordre actuel — décision 18)
- Hero : `image`, `titre`, `description`, `boutonPrincipal` / `boutonSecondaire` (chacun : `label` + `lien` en relation, décision 14)
- QuickAccess ("L'essentiel en un clic") : `items` — liste fixe de 3, icône verrouillée par item (décision 10 amendée), `titre`, `description`, `lien` (relation). La bande agenda intégrée n'a aucun champ, calcul automatique (décision 17)
- Actualités : aucun champ propre, calcul automatique des 3 dernières + épinglage optionnel par emplacement (décision 16)
- Mot du maire : `image`, `citation`, `nomSignataire`, `statNombre`, `statLibelle`
- Découvrir : `cards` — liste fixe de 3, `etiquette` (texte court), `titre`, `description`, `image`, `lien` (relation vers un POI ou un Sentier précis — décision 14 corrigée)
- Contact (CTA) : `titre`, `description`, `bouton` ; coordonnées via relation vers `telephones`/`emails` (décision 22), pas de texte libre

**Horaires**
- `horaires` : liste fixe de 7 lignes, `jour` verrouillé (Lundi → Dimanche, non éditable), `matin`/`après-midi` éditables (texte libre : horaire ou "Fermé")
- `fermetures` : liste répétable de texte libre
- `contactsPratiques` : même sous-schéma que les contacts Annuaire (icône verrouillée par item, `label`, `nom`, `description`, coordonnées en relation vers `telephones`/`emails`)

**Carte interactive**
- La page singleton elle-même n'a quasiment aucun champ propre — le rendu Leaflet reste du code (décision 8)
- `pois` et `sentiers` sont deux **collections Payload séparées** (pas des tableaux imbriqués dans le singleton), pour permettre une vraie relation depuis Découvrir (même raisonnement que décision 22)
  - `pois` : `nom`, `description`, `categorie` (select verrouillé : Hébergement / Site à visiter), `latitude`, `longitude`, `image`
  - `sentiers` : `nom`, `description`, `distance` (texte, ex. "7,5 km"), `duree` (texte, ex. "2h30"), `trace` (liste de coordonnées lat/lng), `image`

### 24. Inventaire des catégories existantes (action de la décision 10)

Relevé exhaustif dans le code réel de `saint-hilaire-demo`, base de départ pour le setup de toute nouvelle commune. Rappel décision 10 : chaque page Annuaire a sa **propre** liste verrouillée (pas une liste Annuaire unique partagée entre les 4 pages).

- **Commerces** (Annuaire) : Alimentation, Restauration, Cafés - Bars, Beauté, Santé, Garages - mécanique, Artisans & entreprises, Autres
- **Vie associative** (Annuaire) : Éducation & famille, Sports, Culture & patrimoine, Mémoire & solidarités, Engagement civique, Nature
- **Enfance & jeunesse** (Annuaire) : École, Petite enfance, Centre de loisirs, Assistantes maternelles
- **Sports & loisirs** (Annuaire) : Équipements sportifs, Sports collectifs, Sports individuels, Loisirs & plein air
- **Démarches** : État civil, Scolarité, Citoyenneté, Urbanisme & voirie, Environnement, Titres & documents
- **Actualités** : Mairie, Vie locale, Travaux, Événements
- **Documents** : Comptes-rendus, Bulletins municipaux, Budget, Arrêtés, Urbanisme
- **Agenda** : Conseil municipal, Manifestation, Vie associative, Cérémonie
- **Carte interactive (POI)** : Hébergement, Site à visiter

**Budget/Projet n'a pas de "catégorie" au sens de la décision 10** — `nature` (Budget/Projet) est un discriminant structurel comme celui du gabarit Liste lui-même, et `statut` (À venir/En cours/Terminé) est un état temporel, pas une classification à icône/couleur fixe. Pas d'ambiguïté à lever ici, juste une précision pour ne pas chercher une liste qui n'existe pas.

**Correction appliquée au code** : la catégorie "Citoyenneté" de Vie associative faisait doublon exact avec celle de Démarches — problématique pour la liste universelle (décision 10, point 4), qui pioche dans l'ensemble des catégories déjà définies sur le site et se serait retrouvée avec deux entrées identiques mais de sens différent. Éclatée en trois catégories plus précises, mappées sur les 3 associations concernées : **Mémoire & solidarités** (Anciens combattants), **Engagement civique** (FNATH 87), **Nature** (Association communale de chasse agréée — pensé pour accueillir aussi de futures associations de pêche etc.). Vie associative passe de 4 à 6 catégories.

Point de vigilance restant : "Vie associative" est à la fois un nom de page ET une catégorie d'Agenda — pas un problème technique (catégories verrouillées par page, décision 10), mais à garder en tête pour ne pas confondre au setup d'une nouvelle commune.

Cet inventaire sert aussi de pioche pour l'échappatoire "liste universelle" (décision 10, point 4).

### 25. Modèle de gestion des médias : deux collections upload, `media` et `documents`

Deux collections Payload de type upload plutôt qu'une seule, pour séparer images et fichiers téléchargeables — usages différents, contraintes de format différentes, et évite à l'éditeur de voir des PDF mélangés aux photos quand il choisit une image.

- **`media`** (images — hero, cards Découvrir, Mot du maire, POI, aperçus de gabarit/carte de la décision 11) : `image` (upload, `mimeTypes` restreint aux formats image), `alt` (texte, **obligatoire** — déjà une exigence RGAA couverte par l'audit, voir [[project-saint-hilaire-rgaa-audit]]), `credit` (texte, optionnel)
- **`documents`** (fichiers téléchargeables — cartes Document et Budget/Projet) : `fichier` (upload, `mimeTypes` PDF a minima), `titre` (texte, optionnel si déjà porté par la page qui l'utilise)
  - L'upload Payload donne nativement format et poids, réutilisable pour l'affichage accessible du lien de téléchargement (même point RGAA que noté en décision 21)

### 26. Setup technique — upgrade Next.js 15 + React 19 nécessaire avant Payload, Payload core installé

Phase 2 démarrée (item 5 de la feuille de route). Payload 3.x exige `next@^15.2.3` minimum ; le projet était sur `14.1.3`. Chaîne de prérequis découverte en installant réellement (pas en lisant seulement la doc) :

- **Next.js** : `14.1.3` → `15.4.11` (pas la toute dernière 15.x — `@payloadcms/next@3.88.0` a une plage de compatibilité stricte par patchs : `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0`. `15.4.11` est la version la plus haute qui satisfait à la fois Payload et le "dernier stable possible").
- **React** : `18.3.1` → `19.2.8` — pas un choix, `@payloadcms/richtext-lexical` exige React 19 en dur (nécessaire pour le champ `contenu` richText de la carte Démarches, décision 21). `react-dom` et les types associés alignés en cascade.
- **react-leaflet** : `4.2.1` → `5.0.0`, **react-leaflet-cluster** : `2.1.0` → `4.1.3` — react-leaflet 4 ne supporte pas React 19 (peer dep `^18.0.0` strict). La version 5 corrige aussi un bug connu de double-init de la carte sous React 19/StrictMode qui touchait la v4.

**Deux vraies régressions trouvées et corrigées en testant réellement le site (dev server + build complet), pas supposées :**
1. `features/carte/index.tsx` utilisait `dynamic(..., { ssr: false })` dans un Server Component — interdit depuis Next 15. Fix : ajout de `'use client'`.
2. `app/tourisme/carte-interactive/page.tsx` typait `searchParams` en objet synchrone — Next 15 le passe en `Promise`. Fix : signature `async`, `await searchParams`. En creusant ce fix, découverte que `?id=` fonctionnait déjà correctement (voir correction décision 14) — juste mal typé pour Next 15.
3. `react-leaflet-cluster` a changé son chemin d'assets CSS (`lib/assets/` → `dist/assets/`) entre la v2 et la v4 — import cassé, corrigé dans `MapClient.tsx`.

Site revérifié à chaque étape (typecheck, `npm run dev` + smoke test de toutes les routes, `npm run build` complet) — aucune régression restante.

**Payload core installé** : `payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/db-mongodb`, `sharp` (tous en version `^3.88.0` / compatibles).

**Vulnérabilités npm connues et acceptées** : `next@15.4.11` embarque des versions de `postcss`/`sharp` avec des CVE connues (XSS PostCSS, libvips). Le seul correctif proposé par `npm audit` force un passage à `next@16`, incompatible avec Payload aujourd'hui — tradeoff accepté en attendant que Payload supporte Next 16.

### 27. Collection `pages` écrite (item 6) — deux vraies découvertes en l'implémentant

`collections/Pages.ts` : une collection, `title`/`slug`/`menu`/`gabarit` en commun, puis un `group` par gabarit avec `admin.condition` sur `data.gabarit`, exactement le modèle de la décision 19. Deux points non anticipés, découverts en écrivant le vrai code (pas en le concevant sur le papier) :

**1. Les catégories verrouillées par page (décision 10) ne peuvent pas être un simple `select` statique.** Un `select` Payload a une liste d'options fixe dans le code — il ne peut pas varier selon la page en cours d'édition. Nouvelle collection `categories` créée : `nom`, `page` (relation vers `pages`, verrouille l'appartenance), `icone`, `couleur`. Chaque champ "catégorie" d'un item (Annuaire, Démarches, Actualités, Document, Agenda) devient une relation vers `categories`, filtrée via `filterOptions` pour ne montrer que les catégories de la page en cours (`{ page: { equals: id } }`). Bénéfice supplémentaire : l'inventaire de la décision 24 devient littéralement les données de seed de cette collection, et la liste "universelle" (décision 10, point 4) est juste une catégorie sans `page` associée.

**2. Tension entre réordonnancement natif et relation propre — RÉSOLUE en décision 35.** Les items d'une carte (une actu, un commerce...) étaient modélisés en `array` Payload, ce qui donnait le drag-and-drop natif voulu par la décision 12, mais un `array` n'est pas une collection : ses lignes n'ont pas d'identité relatable par un champ `relationship`. ~~Solution de repli actuelle : `actuEpinglee` est un champ texte~~ — corrigé, voir décision 35 : les actus sont sorties dans leur propre collection, le drag-and-drop est conservé via `orderable` (même mécanisme que `pages`, décision 5) plutôt que via un `array`.

Autres choix faits en écrivant le fichier :
- Horaires : les 7 jours sont des champs fixes nommés (`lundi`, `mardi`...), pas un `array` — empêche structurellement l'éditeur d'en ajouter ou supprimer, plus fiable qu'un array avec lignes "verrouillées".
- Le champ `menu` reste **obligatoire pour toutes les pages, y compris l'Accueil** — tranché après coup : plutôt qu'une exception spécifique pour l'Accueil (n'appartient à aucune des 4 sections, on y accède par le logo), une seule règle sans cas particulier. `required: true` simple, pas de fonction `validate`.
- Singleton (décision 9) appliqué via un hook `beforeValidate` qui rejette la création d'une 2e page du même gabarit singleton, plutôt qu'un `global` Payload séparé — un `global` ne peut pas être la cible d'un champ `relationship` (décision 14), alors qu'Horaires et Carte interactive doivent rester relationnables depuis le menu et les autres pages.

**Collections de support créées au passage** (nécessaires pour que les relations de `pages` pointent vers quelque chose de réel) : `categories`, `telephones`, `emails`, `media`, `documents`, `pois`, `sentiers`. Tout enregistré dans `payload.config.ts`. Typecheck et build complets validés, comme pour l'item 5 — sans connexion réelle à une base (choix de l'utilisateur, item 5).

### 28. Admin Payload en français

`i18n.supportedLanguages: { en, fr }`, `fallbackLanguage: 'fr'` dans `payload.config.ts` (package `@payloadcms/translations`, `fr` bien disponible en traduction officielle). Anglais gardé en repli, pas retiré.

### 29. Modèle de rôles à 3 niveaux (décision 13 amendée), item 7 de la feuille de route

Chaque instance Payload étant un déploiement par commune (décision 20), il n'y a pas de "super-admin transversal" qui verrait toutes les communes depuis un seul endroit — le modèle ci-dessous s'applique **par instance** :

- **super-admin** (vous + votre associé) — pleins pouvoirs dans l'instance : structure complète (pages, catégories, gabarits) ET gestion de tous les comptes, y compris les autres super-admin/admin. Confirmé que l'associé fera à terme de l'intégration/setup de projet, donc légitime en super-admin, pas juste en visualisation.
- **admin** (côté mairie — ex. secrétaire général) — gère les comptes "éditeur" de sa propre commune (création/désactivation), mais **jamais** la structure (décision 10) : pas de création/suppression de page, pas de catégories, pas de gabarits. Ne peut pas non plus se promouvoir lui-même ni promouvoir quelqu'un à un rôle égal ou supérieur au sien.
- **editeur** — contenu quotidien uniquement, comme prévu depuis le début.

**Implémenté dans `collections/access.ts`** (`isSuperAdmin`, `isAdminOrAbove`, `isLoggedIn`, `isSuperAdminField`) et câblé collection par collection :
- `pages` : création/suppression réservées à `isSuperAdmin` ; mise à jour ouverte à tous les connectés, mais verrouillage **champ par champ** sur `title`, `slug`, `menu`, `gabarit`, `liste.layoutType`, et tous les champs `icone` verrouillés par item (décision 10 amendée) — accès `update` restreint à `isSuperAdminField` sur chacun.
- `categories`, `telephones`, `emails` : CRUD réservé à `isSuperAdmin` (fixées au setup, décision 10/22), lecture ouverte aux connectés (nécessaire pour que les menus déroulants de relation fonctionnent pour l'éditeur).
- `media`, `documents` : upload/édition ouverts à tous les connectés (usage quotidien), suppression réservée à `isAdminOrAbove` (fichier potentiellement référencé ailleurs).
- `pois`, `sentiers` : CRUD ouvert à tous les connectés — décision 8 les qualifie explicitement de collections "éditables" par la mairie, contrairement aux catégories/coordonnées.
- `users` : création/modification par `isAdminOrAbove`, mais un `admin` ne peut créer/passer un utilisateur qu'au rôle `editeur` (jamais `admin` ou `super-admin`) — vérifié à la fois en accès de collection (`create`/`update`) et en accès de champ sur `role` (`update` réservé à `isSuperAdminField`), deux verrous complémentaires plutôt redondants qu'un seul insuffisant.

**Idée notée, pas développée maintenant** (pour ne pas s'éparpiller hors feuille de route) : un script CLI pour créer un nouveau projet commune "en quelques secondes" à partir du template, pertinent une fois que l'associé fera vraiment de l'intégration. À ajouter comme phase de la feuille de route quand on y arrivera.

### 30. Composant d'aperçu visuel (décision 11), item 8 de la feuille de route

`fields/PreviewPicker/index.tsx` — composant de champ Payload générique (`SelectFieldClientComponent`), affiche les options d'un `select` en grille d'aperçus image + libellé plutôt qu'un menu déroulant texte, sélection au clic. Un seul composant réutilisé pour les deux usages identifiés en décision 11 (`gabarit` et `liste.layoutType`), via une fonction `previewPickerComponent(previewImages)` qui injecte la carte image→option en `clientProps`.

`previewImages` est laissé **vide** pour l'instant : produire les captures elles-mêmes est l'item 9 (pas encore fait), pas ce composant. Tant qu'aucune image n'est fournie pour une option, le composant affiche un placeholder "Aperçu à venir" plutôt qu'une image cassée.

**Limite honnête à connaître** : Payload résout les composants admin personnalisés via un `importMap` (actuellement vide, `app/(payload)/admin/importMap.js`) — normalement régénéré automatiquement par Payload au démarrage d'un vrai serveur de dev connecté à une base. Comme l'item 5 a délibérément laissé ça de côté ("on prépare juste le code"), ce composant est **écrit et validé par typecheck/build**, mais son enregistrement dans l'importMap ne sera confirmé qu'au premier vrai lancement avec une base connectée.

### 31. Aperçus visuels produits — illustrations schématiques, pas des captures (item 9)

**Limite d'outillage à connaître** : aucun outil de capture d'écran/navigateur disponible dans cette session pour produire de vraies captures du site rendu. Décision 11 autorisait explicitement "capture **ou illustration**" — parti pris pour des illustrations schématiques (wireframes SVG), l'option que je peux réellement produire honnêtement.

15 SVG générés (`public/admin-previews/`) — 9 gabarits + 6 cartes, un accent couleur distinct par type, structure en blocs représentant la mise en page réelle (ex. gabarit Liste : bandeau hero + pastilles de filtres + grille de cartes ; carte Agenda : pavé date + titre + lieu). Vérifiés visuellement via une galerie QA avant câblage. Câblés dans `collections/Pages.ts` (`GABARIT_PREVIEWS`, `LAYOUT_TYPE_PREVIEWS`) sur les champs `gabarit` et `liste.layoutType`. Typecheck et build validés.

Si de vraies captures du site en prod sont voulues plus tard (rendu réel plutôt que schématique), il suffira de remplacer les chemins dans ces deux constantes — le composant `PreviewPicker` ne change pas.

### 32. Script de seed — migration du contenu en dur (item 10), phase 3 close

`scripts/seed.ts` — importe les données existantes depuis les `data.ts`/`index.tsx` du site plutôt que de les retranscrire à la main (évite les erreurs de transcription sur ~150 entrées). Deux fichiers modifiés pour exporter des consts jusqu'ici locales (`articles` dans `features/actualites`, `docs` dans `features/documents`, `maire`/`adjoints`/`delegues`/`conseillers` dans `features/elus`, `urgences`/`locaux` dans `features/numeros-utiles`) — changement additif, aucun comportement du site modifié.

**Couverture complète (données réelles, importées)** : les 4 pages Annuaire (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs), Agenda, Actualités, Documents & publications, Budget & projets, Numéros utiles, Trombinoscope (élus), POI & sentiers de la Carte interactive, Location de salles (retranscrite à la main mais structure tabulaire simple, faible risque).

**Trois limites assumées explicitement, pas masquées :**
1. **Aucun fichier binaire réel disponible** — tous les champs `upload` (images, PDF) restent vides après le seed. Les sources actuelles sont soit des URL Unsplash externes soit des `href: '#'` placeholders, rien à uploader depuis ce script.
2. **Pas de conversion JSX → Lexical automatisée** — Démarches, Histoire, La commune, Contact, Horaires, Accueil et Carte interactive sont créées avec leur structure (titre, menu, gabarit) mais sans contenu riche : un convertisseur JSX → Lexical fiable est un vrai projet à part, hors scope ici. Ces 7 pages nécessitent une complétion manuelle dans l'éditeur de l'admin après le seed.
3. **Coordonnées mairie divergentes, non arbitrées** — le code actuel a 3 numéros et 2 emails différents selon l'endroit (déjà noté en décision 22). Le script seed les entrées séparément avec des libellés explicites ("page Horaires", "page Contact", "ancien CTA Accueil") plutôt que d'en choisir un arbitrairement — **à l'utilisateur de trancher lequel est le vrai numéro** et de nettoyer les doublons après le seed.

**Découverte en migrant les données réelles** : deux trous de schéma corrigés dans `collections/Pages.ts`/`Categories.ts` au passage — `numerosUtiles.contactsLocaux` n'avait pas de champ `label` (impossible de nommer "Mairie de..." avant un numéro), et `Categories.couleur` ne proposait que 5 couleurs alors que Documents utilise "terracotta", absent de cette liste. Les deux corrigés, typecheck et build revalidés.

**Non exécuté** dans cette session (pas de base connectée, choix explicite de l'item 5) — écrit et validé par typecheck uniquement. À lancer via `npx tsx scripts/seed.ts` une fois `DATABASE_URI` renseigné.

### 33. Branchement front sur Payload (items 11-12) — phase 4, périmètre partiel assumé

**Découverte structurante avant même de commencer** : passer une icône comme référence de composant React (`icon={Store}`) d'un Server Component vers un Client Component est impossible — React ne peut pas sérialiser une fonction à travers la frontière Server → Client. Tant que le front lisait des `data.ts` statiques dans des composants `'use client'`, ça ne posait pas de problème (tout restait côté client). Dès qu'une page devient un Server Component pour interroger Payload, ce mur apparaît. Corrigé en changeant `AnnuaireCardData.icon` et `ContactCard.icon`/`eyebrowIcon` de `LucideIcon` (composant) vers `string` (nom d'icône), résolu côté client dans `shared/lib/icons.ts` — 7 fichiers touchés (`ContactCard`, `AnnuaireLayout`, les 4 pages Annuaire, `Contact`, `Horaires`).

**Deuxième découverte, en testant le build réel (pas en écrivant le code à l'aveugle)** : la première version de `shared/lib/icons.ts` faisait `import * as LucideIcons from 'lucide-react'` pour résoudre un nom en composant — ça embarque les ~1600 icônes du paquet dans le bundle client, mesuré à +167 Ko sur les pages Annuaire (110 Ko → 277 Ko au build). Remplacé par `lucide-react/dynamic` (`DynamicIcon`), qui importe une seule icône à la demande par nom — retombé à 150 Ko.

**Couche de données** : `lib/payload.ts` — `getPayloadClient()` (instance mise en cache), `getNavLinks()`, `getAnnuaireItems(slug)`, `resolvePageHref()` (décision 14). Chaque fonction de lecture a un **repli explicite** vers les données statiques existantes en cas d'erreur (`try/catch` autour de l'appel Payload) — nécessaire car `app/layout.tsx` (donc *toutes* les pages) appelle désormais `getNavLinks()` : sans repli, tout le site serait devenu indépendant d'une base connectée en permanence, cassant le fonctionnement autonome gardé jusqu'ici (item 5). Vérifié en conditions réelles : build et dev server tournent sans base connectée, les logs confirment le repli (`[payload] ... : base injoignable, repli sur ...`), le site rend exactement comme avant.

**Périmètre réellement branché sur Payload** (avec repli) :
- Menu du Header (décisions 1-5) — dynamique depuis la collection `pages`, groupé par `menu`, trié par `_order`
- Les 4 pages Annuaire (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs) — entièrement rebranchées, `getAnnuaireItems()` + repli sur leurs `data.ts`

**Périmètre non touché, pattern établi mais pas appliqué** — Démarches, Actualités, Documents, Budget & projets, Agenda, Trombinoscope, Éditorial (Histoire, La commune), Catalogue de lieux, Numéros utiles, Carte interactive, Accueil : toujours sur leurs données statiques d'origine, aucune régression, mais pas encore de lecture Payload. Le pattern (fetch + repli, `lib/payload.ts`) est répétable mécaniquement pour chacune — non fait ici par choix de périmètre, pas par oubli.

**Décision 14 (relations résolues au rendu)** : `resolvePageHref()` écrite et disponible, mais pas encore consommée nulle part — aucune des pages branchées cette session n'a de champ `relationship` en jeu dans son rendu actuel (les boutons Hero/Découvrir de l'Accueil, qui en auraient besoin, n'ont pas été rebranchés).

Typecheck et build complets validés à chaque étape, comme pour tout le reste de la phase 2/3.

### 34. Le champ `carte` renommé `layoutType` — ambiguïté de vocabulaire, pas un changement de structure

Repéré en réfléchissant à la route générique (item futur) : le mot "carte" servait à deux choses différentes dans le modèle. (1) le champ qui choisit, à l'intérieur du gabarit Liste, quelle mise en page utiliser (Annuaire/Démarches/Actualités/Document/Budget-Projet/Agenda) — décision 6 ; (2) le petit composant visuel par item (`ContactCard`) qu'un layout comme `AnnuaireLayout` importe et affiche pour chaque élément de la collection. Les deux existaient déjà clairement séparés dans le code (`AnnuaireLayout` importe `ContactCard`), mais le champ Payload n°1 s'appelait `carte`, ce qui laissait croire qu'il s'agissait du composant visuel n°2.

**Renommé partout : `carte` → `layoutType`.** Aucun changement de structure — toujours un seul gabarit Liste, toujours 6 variantes, toujours le même principe (décision 6 reste valide sur le fond, seul le nom du champ change). Fichiers touchés : `collections/Pages.ts` (champ `liste.carte` → `liste.layoutType`, constante `CARTE_PREVIEWS` → `LAYOUT_TYPE_PREVIEWS`, commentaires de section), `scripts/seed.ts` (tous les `liste: { carte: ... }` → `liste: { layoutType: ... }`). Le mot "carte" reste réservé, dans le code et la doc à partir de maintenant, au petit composant visuel par item (`ContactCard` et ses futurs équivalents).

Typecheck et build revalidés après renommage.

### 35. ~~Actualités sorties dans leur propre collection~~ — annulée, voir décision 36

Tension identifiée en décision 27 (point 2) et laissée ouverte : `itemsActualites` vivait en `array` dans `pages.liste`, donc pas relatable, donc `actuEpinglee` (Accueil) devait se rabattre sur un champ texte (titre à faire correspondre à la main — fragile, pas une vraie relation).

Solution tentée à l'époque : nouvelle collection `collections/Actualites.ts`, même logique que `pois`/`sentiers` (décision 23) — chaque actu comme document séparé, avec un champ `page` (relation vers `pages`) la rattachant à sa page Liste, `orderable: true` pour garder le glisser-déposer, `actuEpinglee` devenu un vrai `relationship: 'actualites'`.

**Revenue en arrière (décision 36)** : cassait le modèle éditeur unique ("j'ouvre une page, je gère son contenu dedans") sur lequel tout le reste du chantier est construit — Actualités devenait le seul layoutType à vivre hors de sa page, dans un onglet séparé du même nom que la page elle-même. Source réelle de confusion en pratique, pas juste théorique — voir décision 36.

**Ce paragraphe est gardé pour la trace**, mais la collection `Actualites` n'existe plus dans le code.

### 36. Actualités réintégrées dans `pages.liste` — le modèle éditeur unique passait avant la relation Payload "propre"

Malentendu identifié en discutant du parcours éditeur concret : depuis le début, le modèle attendu côté client est **un seul et même geste pour tout contenu de type Liste** — ouvrir la page dans l'onglet "Pages", et gérer son contenu directement dans son formulaire (un `array`), quel que soit le layoutType. C'est toujours vrai pour Démarches, Document, Budget/Projet, Agenda, Annuaire.

La décision 35 avait cassé cette règle pour Actualités seulement, en la faisant vivre dans un onglet séparé du sidebar Payload, portant le même nom que la page "Actualités" elle-même (deux objets différents, même libellé, à deux endroits de l'écran) — repéré comme un vrai facteur de confusion en se projetant dans l'usage réel, pas un simple détail cosmétique.

**Retour arrière complet** :
- Collection `collections/Actualites.ts` supprimée, retirée de `payload.config.ts`.
- `pages.liste.itemsActualites` redevient un `array`, structurellement identique aux autres layoutType (`titre`, `categorie`, `date`, `extrait`, `lienDocument`).
- Champ `epinglee` (case à cocher) ajouté à chaque item — remplace la relation Payload `actuEpinglee` qui vivait sur l'Accueil. L'Accueil n'a plus de champ dédié : au rendu, il va chercher la page "Actualités" et lit son tableau.
- **Règle de départage si plusieurs actus épinglées en même temps** (cas demandé explicitement) : la plus récente par `date` (le champ de publication de l'actu) l'emporte. Pas de champ de date de création dédié — un `array` Payload n'a pas d'horodatage par ligne, et le champ `date` déjà présent sur chaque actu porte la même information en pratique.
- `scripts/seed.ts` : `seedActualites` revient au pattern `seedAgenda` (construit `itemsActualites`, un seul `payload.update` sur la page, plus de boucle `payload.create` par actu).
- Glisser-déposer toujours natif au champ `array`, rien à perdre par rapport à décision 35 sur ce point.

Typecheck revalidé après le retour arrière.

### 37. Item 13 (phase 5) — 5 cartes Liste restantes extraites en composants réutilisables

Agenda, Actualités, Document, Budget/Projet, Démarches suivent maintenant le même pattern qu'Annuaire (décision 33) : un composant `shared/components/XxxLayout` (Client Component, reçoit les données en props), et `features/xxx/index.tsx` devenu un Server Component `async` qui appelle une fonction dédiée de `lib/payload.ts` (`getAgendaItems`, `getActualitesItems`, `getDocumentItems`, `getBudgetProjetItems`, `getDemarchesItems`) avec repli sur les données statiques existantes si Payload est injoignable — même garde-fou que le reste (item 11/12).

Points notables :
- Les filtres par catégorie ne sont plus des unions TypeScript figées : les catégories viennent de la collection `categories` (dynamique, décision 10), `categorie.couleur` fournit directement la variante visuelle (plus de mapping en dur par nom de catégorie).
- **Démarches** : `contenu` est un champ richText (Lexical), rendu via `<RichText data={...} />` de `@payloadcms/richtext-lexical/react`. `lib/payload.ts` reste une couche de données pures (ne retourne jamais de JSX) — c'est `features/demarches/index.tsx` (Server Component) qui enveloppe `contenu` dans `<RichText>` avant de le passer en prop au composant partagé, sous forme de `ReactNode` déjà résolu. Tant que le contenu n'a pas été rédigé dans l'admin (décision 32), il s'affiche vide — comportement déjà documenté, pas un bug.
- Repli statique : les dates du fallback Actualités (texte français "12 Mai 2026") sont converties en ISO au chargement, pour rester compatibles avec le format que `date` retourne côté Payload.

Typecheck, build et vérification par `curl` sur les 5 pages (contenu réel présent dans le HTML rendu) validés.

## Catalogue des gabarits (état actuel)

| Gabarit | Type | Pages actuelles | Notes |
|---|---|---|---|
| **Liste** | Multi-instances | Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs, Mes démarches, Actualités, Documents & publications, Budget & projets, Agenda | Hero + filtre(s) + collection + CTA optionnel ; varie par `carte` (voir ci-dessus) |
| **Éditorial** | Multi-instances | Histoire, La commune | Hero + suite de sections texte/image |
| **Trombinoscope** | Multi-instances | Le maire & les élus | Bloc intro + membres groupés par délégation + infos réunion |
| **Catalogue de lieux/prestations** | Multi-instances | Location de salles | N fiches détaillées (description, capacité, tarifs groupés par public) + CTA |
| **Contact** | Multi-instances | Contact | Fiches coordonnées + formulaire |
| **Numéros utiles** | Multi-instances | Numéros utiles | Bloc urgences + bloc contacts locaux |
| **Accueil** | Singleton | `/` | Composé de blocs fixes (Hero, Accès rapides + agenda, Actus, Mot du maire, Découvrir, CTA — ordre décision 18) |
| **Horaires** | Singleton | Horaires & informations | Tableau jours × créneaux + fermetures exceptionnelles + contacts pratiques |
| **Carte interactive** | Singleton | Carte interactive | Rendu Leaflet en code, POI/sentiers en collection éditable |

## Questions encore ouvertes

- Tension `?category=` jamais consommée par la Carte interactive (décision 14 corrigée) — pas un bug bloquant (`?id=` fonctionne), juste un paramètre prévu mais inutilisé aujourd'hui

## Feuille de route

Ordre proposé pour la suite du chantier, du plus structurant au plus périphérique.

**Phase 1 — Modélisation du contenu** (aucun code, juste la spec)
1. ~~Schéma de champs par carte (Annuaire, Démarches, Actualités, Document, Budget/Projet, Agenda)~~ — fait, décision 21
2. ~~Schéma de champs des gabarits singleton (Accueil, Horaires, Carte interactive)~~ — fait, décisions 22 et 23
3. ~~Inventaire exhaustif des catégories du site~~ — fait, décision 24
4. ~~Modèle de gestion des médias~~ — fait, décision 25

Phase 1 terminée.

**Phase 2 — Setup technique Payload**
5. ~~Init du projet Payload dans `saint-hilaire-demo`~~ — fait, décision 26 (`payload.config.ts`, collection `Users` minimale, routes `app/(payload)/admin` et `/api`, `next.config.mjs` et `tsconfig.json` mis à jour). Pas encore connecté à une vraie base (choix explicite : "on prépare juste le code") — `DATABASE_URI` à renseigner dans `.env` (voir `.env.example`) quand une base sera disponible.
6. ~~Collection `pages` unique avec champs conditionnels par gabarit~~ — fait, décision 27 (+ collections de support `categories`, `telephones`, `emails`, `media`, `documents`, `pois`, `sentiers`)
7. ~~Modèle de rôles/accès concret complet~~ — fait, décision 29 (3 niveaux : super-admin/admin/éditeur, `collections/access.ts` câblé sur toutes les collections)
8. ~~Composant de champ personnalisé pour les aperçus visuels gabarit/carte~~ — fait, décision 30 (`fields/PreviewPicker`), enregistrement dans l'importMap à confirmer au premier lancement réel

Phase 2 terminée.

**Phase 3 — Contenu**
9. ~~Production des aperçus visuels par carte/gabarit~~ — fait, décision 31 (illustrations schématiques, pas des captures — outil de capture indisponible)
10. ~~Migration du contenu actuel en dur vers Payload~~ — fait, décision 32 (`scripts/seed.ts`), 3 limites assumées (uploads, JSX→richText, coordonnées divergentes non arbitrées), pas encore exécuté (pas de base connectée)

Phase 3 terminée.

**Phase 4 — Intégration front**
11. ~~Brancher les composants React existants sur Payload~~ — fait pour le Header (menu dynamique) et les 4 pages Annuaire, décision 33. Pattern établi, pas encore appliqué aux 14 autres pages (Démarches, Actualités, Documents, Budget & projets, Agenda, Trombinoscope, Éditorial, Catalogue de lieux, Numéros utiles, Carte interactive, Accueil)
12. Menu dynamique ~~fait~~ (décision 33). Relations résolues au rendu (`resolvePageHref`, décision 14) : écrites, pas encore consommées — aucune page branchée n'a de champ `relationship` en jeu pour l'instant

**Phase 5 — Routage dynamique** (identifiée en discutant)
13. Extraire les 12 gabarits/cartes restants en composants réutilisables (même travail que celui déjà fait pour `AnnuaireLayout`/`EditorialLayout`) : ~~Démarches, Actualités, Document, Budget/Projet, Agenda (les 5 cartes de Liste restantes)~~ — fait, décision 37. Restent : Trombinoscope, Catalogue de lieux, Contact, Numéros utiles, Horaires, Carte interactive, Accueil
14. Route générique `app/[...slug]/page.tsx` — lit `slug`/`gabarit`/`liste.layoutType` depuis Payload, dispatch vers le bon composant `XxxLayout` (tableau de correspondance), remplace les fichiers de route statiques un par un une fois chaque équivalent dynamique vérifié. Utilise `generateStaticParams()` pour garder le rendu statique (pas de perte de perf). Même pattern repli-si-Payload-indisponible que le reste.
15. Corriger le `slug: '/'` de l'Accueil dans `scripts/seed.ts` (bug repéré en discutant du routage — `/${page.slug}` donnerait `//`)

Phase 1 conditionne tout le reste — c'est par elle qu'on continue.

## Idées non actées

- **Slideshow à la place du bloc "Mot du maire"** : plusieurs slides (image + texte + valeur/chiffre en encart), pouvant porter le mot du maire mais aussi d'autres contenus mis en avant (événement, projet...). Navigation manuelle uniquement (pas d'auto-rotation, pour rester conforme RGAA 13.3). Réserve posée : si un slide sert à mettre en avant un événement, ça recouperait la bande agenda déjà intégrée à QuickAccess (décision 17) — à trancher si l'idée est reprise. Pas décidé, proposé comme option possible pour le client.
