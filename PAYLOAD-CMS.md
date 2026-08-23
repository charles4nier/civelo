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

**Annulée par la décision 49** : le sélecteur en liste déroulante jugé pas intuitif à l'usage réel, surtout dans les fiches. `telephone`/`email` sont redevenus des champs texte directs, les collections `telephones`/`emails` supprimées.

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

### 38. Item 13 (phase 5) — Trombinoscope, Catalogue de lieux, Contact, Numéros utiles branchés, 3 schémas étoffés en le faisant

Même pattern que décision 37, mais trois gabarits avaient un schéma plus pauvre que leur contenu réel — écart repéré en implémentant, pas anticipé :

- **Trombinoscope** : `membres` n'avait aucun moyen de distinguer Maire / Adjoint / Conseiller délégué / Conseiller municipal (juste `fonction` en texte libre), et pas de champ `commissions` alors que le contenu réel en a systématiquement. Ajouté : `role` (select, discriminant explicite plutôt que deviner depuis le texte de `fonction`), `commissions` (liste répétable), `note` (texte libre, ex. "Président de toutes les commissions").
- **Catalogue de lieux** (`salles`) : le schéma minimal de décision 7 (`tarifs: [{public, prix}]`) ne portait ni groupes de tarifs (Manifestations / Vins d'honneur / Location / Cautions), ni caution par ligne, ni notes/consignes par salle — tout ça existe dans le contenu réel de Location de salles. Ajouté : `icone` (verrouillé par salle), `groupesTarifs` (groupe → lignes avec `public`/`prix`/`caution`), `notes` (texte + `type`: info/condition, pour distinguer "Assurance obligatoire" d'un encart neutre et "Traiteur obligatoire" d'une consigne mise en avant). `scripts/seed.ts` réécrit avec la structure correcte (la caution n'est plus repliée dans le texte du prix).
- **Contact** (`coordonnees`) : chaque coordonnée s'affiche comme une fiche (`ContactCard`) avec icône + catégorie + description, pas juste une ligne type/valeur. Icône/catégorie sont **dérivées de `type`** (phone→Phone/"Par téléphone", etc. — pas de nouveau champ, évite la redondance) ; seul `description` (texte libre, ex. horaires du standard) a été ajouté, c'est la seule info qui n'existait nulle part ailleurs.
- **Numéros utiles** : aucun écart, schéma déjà complet (décision 22/23) — juste branché.

Composants créés : `TrombinoscopeLayout`, `CatalogueLieuxLayout`, `ContactLayout`, `NumerosUtilesLayout`. Fonctions `lib/payload.ts` : `getTrombinoscopeData`, `getCatalogueLieuxItems`, `getContactData`, `getNumerosUtilesData`. Repli statique partout, même garde-fou que le reste.

Typecheck, build et vérification par `curl` (contenu réel dans le HTML rendu) validés sur les 4 pages.

### 39. Item 13 (phase 5) — Horaires et Carte interactive branchés

**Horaires** : aucun écart de schéma (décision 23 déjà complet). `HorairesLayout` créé, `getHorairesData()` reconstruit les 7 jours depuis les champs fixes (`horaires.lundi.matin`, etc.), `contactsPratiques` mappé vers des `ContactCard` — variante de couleur non stockée en base, attribuée par rotation sur une petite palette faute de champ dédié (mineur, cosmétique).

**Carte interactive** : cas particulier — `features/carte/MapClient.tsx` est un Client Component chargé via `dynamic(..., { ssr: false })`, qui ne peut PAS faire d'appel Payload lui-même (pas de fetch serveur dans un Client Component, et `ssr:false` interdit dans un Server Component sous Next 15 — décision 26). `pois`/`sentiers` importaient directement `./data` en dur.

**Résolu** : `pois`/`sentiers` sont remontés en props, de haut en bas — `app/tourisme/carte-interactive/page.tsx` (Server Component, déjà `async`) appelle `getCarteData()` (nouvelle fonction, interroge les collections `pois`/`sentiers`, décision 23) et passe le résultat (ou le repli statique) à `CarteInteractive`, qui les repasse tel quel à `MapClient`. Aucun changement dans la logique Leaflet elle-même.

Vérification limitée pour cette page : `MapClient` étant rendu uniquement côté client (`ssr:false`), son contenu n'apparaît pas dans le HTML servi par `curl` — le typecheck, le build, et le code de threading des props (purement mécanique) donnent une confiance raisonnable, mais un test visuel réel en navigateur reste à faire avant mise en prod.

### 40. Item 13 (phase 5) — Accueil branché, dernier des 12 gabarits/cartes

Contrairement aux autres gabarits, Accueil reste organisé en 6 sous-composants existants (`features/home/{Hero,QuickAccess,News,MayorWord,Discover,CTA}`) plutôt que d'être déplacé vers un `shared/components/AccueilLayout` unique : étant un singleton (décision 9), il n'y a aucun bénéfice de réutilisation à en tirer (contrairement à Annuaire/Agenda/etc. potentiellement réutilisés sur plusieurs pages) — un wrapper supplémentaire aurait été de l'indirection sans raison. `features/home/index.tsx` devient le point d'orchestration `async`, chaque sous-composant devient pur (props uniquement, plus d'import de données statiques en dur).

Points notables :
- **Recherche par `gabarit`, pas par `slug`** (`getAccueilData()`) : un singleton est garanti unique par gabarit (décision 9), pas besoin de connaître son slug exact pour le trouver — anticipe le même choix pour le routage générique (item 14).
- **Bloc Actus** : `pickHomeActus()` (nouvelle fonction pure dans `lib/payload.ts`) implémente la règle décidée (décision 16/36) — 3 dernières actus par défaut, la plus récente **parmi celles épinglées** passe en premier si il y en a une ou plusieurs.
- **Bloc agenda de QuickAccess** : calcule le prochain événement à partir des vraies données Agenda (`getAgendaItems`), avec repli sur `@features/agenda/data` si Payload est injoignable — **bug trouvé et corrigé en testant** : la première version oubliait ce repli, la bande agenda disparaissait silencieusement sans base connectée (repéré par le test `curl`, pas deviné).
- **Bloc Découvrir** : `lienPoi`/`lienSentier` (relations vers les collections `pois`/`sentiers`, décision 23) résolues en `/tourisme/carte-interactive?id=<id>`.
- Simplifications mineures assumées, cohérentes avec celles déjà faites ailleurs : le titre du Hero perd son `<span>` de mise en avant inline (texte simple en base) ; les couleurs des 3 tuiles QuickAccess et l'icône par carte Catalogue de lieux ne sont pas des champs dédiés, attribuées par rotation d'index.

Typecheck, build et vérification par `curl` (contenu réel + agenda dynamique + repli agenda testés) validés. **Phase 5, item 13 : terminé — les 12 gabarits/cartes sont tous branchés sur Payload.**

### 41. Item 14 (phase 5) — route générique `app/[...slug]/page.tsx`

Recadrage important en l'implémentant, par rapport à la formulation initiale de l'item 14 ("remplace les fichiers de route statiques un par un") : Next.js privilégie toujours une route plus spécifique sur un catch-all, donc **les 17 fichiers de route statiques existants n'ont pas besoin d'être supprimés pour que ça marche** — ils continuent de gérer leurs URL exactement comme avant, inchangés. Le vrai rôle de cette route générique, concrètement démontré par le fil de discussion qui a mené à l'item 14 ("j'admets que je crée une page, comment ça se répercute ?") : **rendre visible une page créée depuis l'admin qui n'a pas de fichier de route dédié** — c'est le cas qui n'avait aucune réponse jusqu'ici.

Mécanique : lit `slug`, va chercher la page via `getPageBySlug` (item 12, jusqu'ici écrite mais jamais appelée — corrigée au passage : elle plantait si Payload était injoignable, pas de `try/catch` comme le reste de `lib/payload.ts`), puis dispatch sur `gabarit` (et `liste.layoutType` pour le gabarit Liste) vers le composant `XxxLayout` correspondant, en rappelant la fonction `getXxxItems`/`getXxxData` déjà existante avec le `slug` réel — même fonctions que celles utilisées par les wrappers `features/*/index.tsx`, pas de nouvelle couche de données.

**Gabarits singleton (Accueil, Horaires, Carte interactive) volontairement absents du dispatch** : une seule instance possible par gabarit (décision 9), URL fixe déjà servie par une route dédiée — aucune situation où le catch-all aurait à en gérer une nouvelle occurrence.

**Pas de repli statique** dans cette route, à la différence de tout le reste du projet : une page purement dynamique n'a par construction aucun fichier en dur vers lequel se replier. Base injoignable ou page absente → `notFound()` (404), pas un plantage.

**Coût accepté** : double appel Payload pour la même page (`getPageBySlug` d'abord pour connaître le gabarit, puis `getXxxItems`/`getXxxData` qui refait sa propre recherche par slug) — accepté sciemment plutôt que de refactorer les fonctions existantes pour accepter un document déjà chargé ; coût négligeable pour un site de cette taille, la simplicité de garder chaque fonction autonome l'emporte.

**Nouveau, pas encore démontré ailleurs** : rendu du gabarit Éditorial depuis de vraies données Payload (`editorial.sections`, blocks `texte`/`image`) — jusqu'ici Histoire/La commune restent 100% statiques avec du contenu Lorem ipsum. Le rendu générique perd la mise en page sur-mesure de ces deux pages (cartes, sections stylées) au profit d'un rendu neutre (RichText + image pleine largeur) — attendu, cohérent avec la logique déjà actée (décision 20 : le template de base reste générique, le sur-mesure vit dans le code par commune).

Pas de `generateStaticParams()` : les pages purement dynamiques n'existent qu'après création dans l'admin, impossible de les connaître au moment du build sans base connectée (contrainte déjà posée, item 5). Cette route reste donc rendue à la demande (`ƒ` dans la sortie de build), pas prégénérée — écart de perf mineur assumé, cohérent avec `/tourisme/carte-interactive` déjà dans ce cas pour la même raison (`searchParams`).

Vérifié : `curl /demarches` sert toujours la route statique (200, inchangé) ; `curl` sur un slug inexistant traverse le catch-all et répond 404 proprement (base injoignable en local) plutôt que de planter. Typecheck et build validés.

**Phase 5 terminée.** Les 12 gabarits/cartes sont branchés sur Payload (item 13) et une page créée depuis l'admin sans fichier de route dédié est désormais servable (item 14).

### 42. Première exécution réelle contre une vraie base — plusieurs bugs bloquants trouvés et corrigés

MongoDB local en container Docker isolé (nom, volume et réseau dédiés — ne touche pas aux autres containers de la machine), `DATABASE_URI`/`PAYLOAD_SECRET` dans `.env` (gitignored). Premier lancement réel de `scripts/seed.ts` (jamais exécuté avant, décision 32) et premier accès réel à `/admin`.

**Bugs bloquants trouvés en exécutant, pas en relisant** :
- `itemsDocument.fichier`, `Pois.image`, `Sentiers.image`, `accueil.hero.image`, `accueil.mayorWord.image`, `accueil.discoverCards[].image` étaient `required: true` alors qu'aucun vrai fichier n'est disponible pour le seed (décision 32) — validation Payload en échec, seed impossible. Passés en optionnels, à compléter manuellement dans l'admin (comportement documenté depuis le début, juste jamais appliqué correctement au schéma).
- `seedTrombinoscope` était resté sur l'ancien schéma `fonction` en texte libre, jamais mis à jour après l'ajout de `role`/`commissions`/`note` (décision 38) — réécrit.
- `getPageBySlug` n'avait pas de `try/catch` (seule fonction de `lib/payload.ts` dans ce cas) — corrigé, cohérent avec le reste.
- L'Accueil (coquille vide au départ) a des champs texte `required` (`hero.titre`, `mayorWord.citation`) qui échouaient aussi — `seedPageShells` réécrit pour y mettre du vrai contenu (repris des fallbacks de `features/home/`), y compris de vraies relations vers les pages Démarches/Numéros utiles pour `quickAccessItems`/`boutonPrincipalLien`.
- `<Image src="">` : les champs `image` vides remontaient une chaîne vide plutôt que `undefined`/un repli — Next.js refuse ça. `uploadUrl()` (`lib/payload.ts`) prend maintenant un repli obligatoire vers un visuel statique existant.
- **Catégories sans icône/couleur** : `seedAnnuairePage`/`seedAgenda`/`seedActualites`/`seedDocuments` créaient les catégories sans reprendre les `categoryMeta` (icône/couleur) des pages statiques d'origine — tout s'affichait en gris/muted par défaut. Les mappings ont été extraits de chaque page statique et injectés dans le seed (`COMMERCES_CATEGORY_META`, `VIE_ASSOCIATIVE_CATEGORY_META`, etc.), pas de champ supplémentaire ajouté au schéma, juste des données manquantes au seed.
- Le seed lui-même ne pouvait pas s'exécuter directement (`npx tsx scripts/seed.ts`) : il importait les données statiques depuis les fichiers `features/*/index.tsx` (composants React), qui embarquent maintenant des imports `.scss` via les composants `shared/components/*Layout` — invalide hors bundler. Les données pures (`articles`, `docs`, `maire`/`adjoints`/etc., `urgences`/`locaux`) ont été extraites dans des `data.ts` dédiés (même pattern déjà utilisé pour commerces/vie-associative/etc.), important uniquement ces fichiers depuis le script.

Résultat vérifié : seed complet sans erreur (18 pages, 34 catégories avec icône/couleur réelles, 6 téléphones, 2 emails, 8 POI, 2 sentiers), site testé en dev ET en build de prod contre la vraie base (plus aucun repli statique déclenché), `/admin` accessible (propose la création du premier utilisateur — aucun `user` seedé, décision volontaire : les comptes se créent à la main, pas par script).

### 43. Interface admin sur-mesure — priorité produit, pas juste de l'esthétique

En regardant le vrai back-office Payload pour la première fois (décision 42), constat client : l'admin par défaut est "moche" et peu ergonomique. Décision de positionnement : **l'interface admin est l'argument de vente principal auprès des mairies, davantage que le site public lui-même** — une secrétaire de mairie l'utilise au quotidien, contrairement au site public qui est surtout consulté par les habitants.

Deux niveaux distincts identifiés, à ne pas confondre :
- **Petites améliorations sur l'admin Payload natif** (rapide, faible risque) : `admin.group` pour regrouper les collections du menu par sous-section (ex. "Contenu", "Configuration"), couleur d'accent, logo — garde les écrans par défaut de Payload, juste retouchés.
- **Interface entièrement sur-mesure** (chantier à part entière) : reconstruire les écrans en React par-dessus Payload utilisé en headless (API/base), pas les vues admin par défaut. Exemple concret donné par le client (capture d'écran) : sidebar avec icônes et sous-menus groupés, écran "Équipe municipale" en grille de cartes avec photos, pastilles de rôle colorées, réordonnancement par flèches, recherche/filtre, header avec sélecteur de commune et mode sombre.

**C'est la deuxième option qui est visée.** Techniquement possible (Payload est conçu pour être exploité en headless avec des vues 100% custom), mais c'est un vrai chantier front — refaire chaque écran principal (Trombinoscope, Pages, Actualités...) en composants sur-mesure, pas une session de finitions. Volontairement pas commencé ce soir (fin de session déjà longue) — à cadrer avec sa propre feuille de route (écrans prioritaires, système de composants réutilisable) lors d'une prochaine session, sur le même modèle que ce document pour le chantier données.

**Piste identifiée pour un futur écran prioritaire** : Agenda et Actualités ont besoin d'un écran de création minimal (juste les champs pertinents — titre/date/catégorie/lieu — pas le document Page complet avec son hero/menu/CTA). Décision explicite de ne PAS faire de ça un gabarit à part ni de revenir à des collections séparées (le modèle de données/routes reste celui de décision 6/36) — c'est un problème de vue d'admin, pas de schéma : une vue d'édition sur-mesure conditionnée sur `layoutType` peut cacher tout le bruit sans toucher aux données ni aux routes publiques. Pas commencé, à faire dans la session dédiée à l'interface.

### 44. Sidebar admin sur-mesure — premier écran concret du chantier interface

Remplace le `Nav` par défaut de Payload (`admin.components.Nav`) par un composant écrit à la main (`admin/Nav/index.tsx`), plutôt que de s'appuyer sur l'itération générique des collections de Payload — structure décidée avec le client, pas dérivée automatiquement :

- **Mon site** : Mes pages, Actualités et Agenda (raccourcis directs vers leur page via `?where[slug][equals]=...`, décidé après un aller-retour — la donnée reste dans `pages.liste`, seule la navigation pour la retrouver a changé), puis sous-groupe **Annuaire** (Téléphones, Emails)
- **Carte interactive** : Lieux (POI), Sentiers
- **Paramètres** : Catégories, Médiathèque, Documents, Utilisateurs

Style repris de la palette du site public ($leaf en vert d'accent sur l'item actif) plutôt qu'une nouvelle palette inventée pour l'admin. `useAuth`/`useConfig`/`Link` de `@payloadcms/ui` réutilisés pour rester dans les conventions Payload (session, base `/admin`) sans reconstruire l'authentification.

**Découverte utile en le construisant** : l'importMap (décision 41/42) se régénère automatiquement tant qu'un vrai serveur `next dev` tourne et regarde les fichiers — seule une régénération "à froid" (aucun serveur actif) nécessite le script de contournement (`scripts/gen-importmap.ts`).

### 45. Sélecteur visuel de gabarit/carte abandonné — retour à un menu déroulant classique avec descriptif

Le composant `PreviewPicker` (décision 11/30, aperçus image par option) jugé peu lisible à l'usage réel — testé pour la première fois ce soir. Remplacé par le `select` par défaut de Payload, avec un texte `admin.description` qui explique en une phrase ce que fait chaque option (ex. "Trombinoscope : liste des élus avec photos"), sur `gabarit` et `liste.layoutType`.

**Pas supprimé, juste plus utilisé** : `fields/PreviewPicker/` et les SVG dans `public/admin-previews/` restent dans le projet (reprenable plus tard, notamment si le chantier interface sur-mesure produit de vraies captures d'écran plutôt que des illustrations schématiques generées).

### 46. Retours client en rafale sur l'admin natif — wording, hiérarchie, réhabillage global

Session de retours directs en testant l'admin en vrai. Regroupés ici plutôt qu'en décisions séparées, tous dans la même direction (voir aussi [[feedback-admin-ui-design-direction]] en mémoire) :

- **Sidebar** (`admin/Nav/`) : "Mon site" liste maintenant **toutes les pages existantes** par leur titre (pas de raccourcis choisis à la main pour 2-3 pages, ça ne passait pas à l'échelle) + un lien "Nouvelle page" en haut. Lieux (POI)/Sentiers rattachés visuellement à "Mon site" (sous-groupe) plutôt qu'en section à part — restent des collections séparées (relation depuis Découvrir, décision 14/23), seule la présentation a changé. Médiathèque retirée (jugée inutile pour l'instant).
- **Palette/hiérarchie** : accent terracotta partout (pas de config `admin.css` dans cette version de Payload — le réhabillage global passe par `admin/Nav/global-overrides.scss`, chargé de façon non scopée puisque `Client.tsx` est toujours monté). Rayons `--style-radius-s/m/l` de Payload surchargés pour plus d'arrondi partout, `--theme-border-color` assoupli.
- **Bouton "+ Ajouter"** (`array-field__add-row`) et boutons d'action principaux (`btn--style-primary`) : reskinnés en pilule terracotta pleine, texte/icône blancs — plus le style discret par défaut.
- **Wording "Item"** : chaque champ tableau a maintenant un `labels: { singular, plural }` en français (ex. "Ajouter une actualité" au lieu de "Ajouter un item") — 22 champs tableau de `collections/Pages.ts` couverts.
- **Titre de section dynamique** (`admin/DynamicArrayLabel`) : pour les 9 tableaux qui sont le contenu principal (unique) de leur gabarit — les 6 `layoutType` de Liste, `membres` (Trombinoscope), `salles` (Catalogue de lieux), `coordonnees` (Contact) — le titre affiché au-dessus du tableau reprend en direct le champ `titre` de la page (ex. "Commerces & artisans" au lieu de "Liste de fiches"), via `useFormFields`. Pas appliqué aux tableaux secondaires (`commissions`, `contacts`, `groupesTarifs`...) ni aux gabarits à deux tableaux sur la même page (Numéros utiles, Horaires) où ça aurait dupliqué le même titre deux fois sans rien distinguer.
- **`gabarit` bloqué tant que `titre` est vide** (`admin.condition: (data) => Boolean(data?.title)`) — cohérent avec le titre dynamique ci-dessus, force un ordre de remplissage logique.
- **Premier bloc de la page (titre/slug/menu/gabarit) sans titre de section** — corrigé avec un champ `type: 'ui'` dédié (`admin/SectionHeading`) inséré avant `title`, "Informations générales".
- **`title`/`slug` en anglais** — `title` relabellé "Titre" ; `slug` gardé tel quel (jugé acceptable, terme technique). Les deux ont maintenant une description en italique (`.field-description { font-style: italic }`, global) expliquant à quoi ils servent, pour un usage non-technique.

**Non vérifié visuellement** — testé par typecheck et lecture du code, pas par un vrai rendu navigateur (contrainte de cette session : je ne dois plus faire de `next build`/`rm -rf .next` pendant que le `next dev` du client tourne, ça lui a corrompu son cache une fois déjà).

### 47. Deuxième vague de retours — capture d'écran de l'Accueil en vrai

Retours en observant concrètement le gabarit Accueil dans l'admin. Toujours "0 anglais", "clair et rapide", et un principe de vocabulaire fixé explicitement : **toujours "section", jamais "bloc"** — appliqué partout à partir de maintenant.

- **`admin/LabelWithInfo`** (nouveau) : l'aide contextuelle passe d'un texte permanent sous le champ à une icône ⓘ à côté de l'intitulé (infobulle au survol) — appliqué à `title`, `slug`, `menu`. `gabarit` garde sa description en dessous (texte trop long pour une infobulle).
- **`admin/RowLabel`** (nouveau) : chaque ligne d'un tableau affiche son vrai contenu + numéro (ex. "Fiche Boulangerie Martin 01") au lieu d'un intitulé générique — sur les mêmes 8 tableaux que le titre de section dynamique (décision 46).
- **Titre de chaque groupe/gabarit renommé "Organisation de la page"** (au lieu du nom auto-généré du gabarit, ex. "Accueil") — **transverse aux 9 gabarits**, pas seulement l'Accueil.
- **Sous-sections de l'Accueil renommées**, zéro anglais : `hero` → "Section d'introduction", `quickAccessItems` → "Section Accès rapides" (+ description), `mayorWord` → "Mot du maire", `discoverCards` → "Section Découverte" (+ description), `cta` → "Section contact".
- **CSS globale (`global-overrides.scss`)** : "Informations générales" (notre `SectionHeading`) et "Organisation de la page" (titre natif Payload d'un groupe) forcés à la même taille/graisse (18px/800) — incohérence visuelle repérée sur la capture. Les groupes de haut niveau (`hero`, `mayorWord`, `cta`) et les tableaux (`quickAccessItems`, `discoverCards`) reçoivent le même traitement de carte (bordure, radius, fond, padding) — avant, seuls les tableaux avaient un "encadré" visible, les groupes avaient juste une ligne fine, jugé incohérent.

Même limite que décision 46 : vérifié par typecheck, pas par rendu réel.

**Corrigé par la décision 48 ci-dessous** : "Organisation de la page" n'est plus renommé, il est retiré (`admin/HiddenLabel`) — "Informations générales" suffit seul comme repère de haut niveau. Plus de trait sous les groupes/sections. "Informations générales" est en corail (pas noir).

### 48. Simplification du modèle contact (annuaire + Contact + Horaires + Accueil)

Le tableau "choisis un type (adresse/horaires/téléphone/mail), puis remplis la valeur" (décision 22, `contactItemFields`) jugé trop compliqué à l'usage réel pour une secrétaire de mairie non technique — il fallait comprendre l'abstraction "type" avant de pouvoir saisir quoi que ce soit. Remplacé partout par 3 champs directs et explicites, tous optionnels : **Adresse** (texte), **Téléphone**, **Email** — `contactFields` dans `collections/Pages.ts` (voir décision 49 ci-dessous : `telephone`/`email` sont redevenus des champs texte directs, plus des relations). Le champ `type` disparaît : on affiche ce qui est attendu plutôt que de demander à l'éditeur de le choisir.

- **Passage array → group** sur les 4 emplacements qui utilisaient `contactItemFields` : `liste.itemsAnnuaire[].contacts`, `contact.coordonnees`, `accueil.cta.coordonnees`, `horaires.contactsPratiques[].contacts`. Un seul jeu de coordonnées par fiche/page (pas de second numéro) — simplification assumée, cohérente avec "on met ce qui est attendu, pas un tableau à gérer".
- Le bouton "Ajouter une coordonnée" disparaît avec l'array. Pas de titre de groupe "Coordonnées" non plus, sur les 4 emplacements (`admin/HiddenLabel`) : les coordonnées font partie intrinsèque de la section/fiche qui les contient (la fiche annuaire, la section contact de l'Accueil, le contact pratique des Horaires, la page Contact elle-même) — un titre séparé serait redondant. Les 3 sous-libellés Adresse/Téléphone/Email suffisent à comprendre ce qui est attendu.
- `lib/payload.ts` : `PayloadContactItem`/`mapContacts` remplacés par `PayloadContactGroup`/`mapContactGroup` ; `getContactData` reconstruit jusqu'à 3 cartes (une par champ rempli) au lieu d'itérer un tableau.
- `scripts/seed.ts` : `buildContacts` ne reprend plus que `adresse` (texte libre dans la donnée source) — `telephone`/`email` restent volontairement non peuplés par le seed (numéros propres à chaque commerçant/association de l'annuaire, pas des coordonnées mairie réutilisables via les collections `telephones`/`emails`, décision 22) ; `hours` n'a plus de champ correspondant dans le modèle simplifié et n'est plus repris.

Vérifié par `npx tsc --noEmit` (propre sur l'ensemble du projet), pas par rendu réel (même limite que décisions 46/47).

### 49. Suppression des collections `telephones`/`emails` (annule décision 22)

Retour client sur le vif : "je ne veux plus d'annuaire de mail ni de tel [...] tu fais toujours choisir dans une liste [...] c'est pas du tout intuitif ce système." La logique de décision 22 (numéro/email jamais en texte libre, toujours une relation vers une collection centrale `telephones`/`emails`, pour n'avoir qu'un seul endroit à corriger si un numéro change) est explicitement abandonnée : le compromis "source unique" ne valait pas la complexité d'un sélecteur en liste déroulante à l'usage réel, notamment dans les fiches.

- **`telephone`/`email` redeviennent des champs directs** (`type: 'text'` / `type: 'email'`, ce dernier avec la validation native de Payload) sur les 4 emplacements de `contactFields` (décision 48) et sur les 3 autres endroits qui utilisaient encore une relation : `liste.cta.email` (CTA de bas de liste), `trombinoscope.membres[].email`, `numerosUtiles.contactsLocaux[].telephone`.
- **Collections `Telephones`/`Emails` supprimées** (`collections/Telephones.ts`, `collections/Emails.ts`, retirées de `payload.config.ts`).
- **Sidebar** (`admin/Nav/Client.tsx`) : sous-section "Annuaire" (liens Téléphones/Emails) retirée — plus de collection à y faire pointer.
- `lib/payload.ts` : `PayloadContactGroup.telephone`/`email` passent de `{numero:string}|string` / `{adresse:string}|string` (forme relation-résolue-ou-id) à `string` simple ; `mapContactGroup`, `getContactData`, `getNumerosUtilesData` simplifiés en conséquence (plus de `typeof === 'object'`).
- `scripts/seed.ts` : `seedTelephonesEmails` supprimée. `seedNumerosUtiles` reprend directement `locaux[].number` (déjà un numéro en clair dans `features/numeros-utiles/data.ts`) au lieu de résoudre une relation. Les numéros/emails mairie qui étaient seedés dans les collections supprimées (secrétariat, urbanisme...) ne sont plus repris nulle part — à ressaisir manuellement dans l'admin si besoin (pages Contact/Horaires/Accueil).

Vérifié par `npx tsc --noEmit` (propre) + recherche exhaustive des références résiduelles à `telephones`/`emails` dans le code (aucune trouvée). Pas vérifié par rendu réel.

### 50. Retrait du sous-groupe `coordonnees`/`contacts` — champs à plat

Retour client en inspectant le DOM de l'admin (section contact de l'Accueil) : Adresse/Téléphone/Email s'affichaient dans un wrapper `field-type group-field group-field--within-group group-field--gutter`, visuellement détaché du flux normal des autres champs de la section. Plutôt que de continuer à chasser les classes CSS de Payload (approche déjà jugée peu fiable en décision 46/47), le sous-groupe est retiré à la source : `contactFields` est désormais **inséré à plat** (`...contactFields`) directement dans le tableau `fields` du parent, sur les 4 emplacements de la décision 48, au lieu d'être enveloppé dans un `{ name: 'coordonnees'/'contacts', type: 'group', fields: contactFields }`.

- **`liste.itemsAnnuaire[].contacts`** → `adresse`/`telephone`/`email` deviennent des champs directs de la fiche (aux côtés de `nom`/`badge`/`description`), plus de sous-objet `contacts`.
- **`contact.coordonnees`** → idem, à plat dans `contact`. Collision évitée avec la `description` de page (textarea) déjà présente au même niveau : le texte d'accompagnement des coordonnées (décision 38) est renommé `description` → **`precision`**.
- **`accueil.cta.coordonnees`** → idem, à plat dans `cta` (aux côtés de `titre`/`description`/`boutonLabel`).
- **`horaires.contactsPratiques[].contacts`** → idem, à plat dans chaque ligne (aux côtés de `label`/`nom`/`description`).
- `lib/payload.ts` : `PayloadAnnuaireItem`, `PayloadContactPratique`, `PayloadAccueil.cta` étendent maintenant `PayloadContactGroup` directement (`&`) plutôt que de porter un champ `contacts?`/`coordonnees?` séparé ; `PayloadContactCoordonnee` renommé `PayloadContact` (avec `precision`) ; tous les appels `mapContactGroup(x.contacts)` → `mapContactGroup(x)`.
- `scripts/seed.ts` : le seed annuaire reprend maintenant `item.phone`/`item.email` directement dans `itemsAnnuaire` (en plus de `item.address`) — possible car décision 49 a fait de `telephone`/`email` des champs texte directs, plus des relations qui ne convenaient pas aux coordonnées de tiers. `buildContacts` supprimée (plus nécessaire, les champs sont assignés directement).

Vérifié par `npx tsc --noEmit` (propre) + recherche exhaustive des références résiduelles à `coordonnees`/`.contacts` côté schéma (les occurrences restantes de `.contacts` dans `features/`/`shared/components/` sont la prop d'affichage `ContactItem[]` déjà résolue, sans rapport avec le champ Payload). Pas vérifié par rendu réel.

### 51. Bug réel trouvé — `label`/`required` jamais fournis à un composant Label personnalisé

Retour client avec capture d'écran : dans "Informations générales", Titre/Slug/Menu n'affichaient plus que l'icône ⓘ, sans le texte de l'intitulé (alors que "Gabarit", qui n'utilise pas de composant Label personnalisé, s'affichait normalement). D'abord attribué par erreur à du cache navigateur/serveur (comme le retour précédent sur "Coordonnées") — en réalité un vrai bug de code, présent depuis la décision 46.

**Cause racine** (trouvée en lisant le code source de `@payloadcms/ui`, `RenderServerComponent`/`renderField.js`) : Payload ne passe **jamais** `label`/`required` directement en props à un composant `admin.components.Label` personnalisé — seulement au composant `FieldLabel` interne par défaut. Un composant Label personnalisé reçoit `field` (la config client du champ, avec `field.label`/`field.required` dedans), pas `label`/`required` au premier niveau. Le type `GenericLabelProps` de Payload déclare pourtant `label`/`required` comme props valides — un piège : ça compile, mais ces props ne sont jamais peuplées à l'exécution pour un composant custom.

- **`admin/LabelWithInfo`** : lisait `label`/`required` directement — toujours `undefined`, `FieldLabel` ne rendait donc rien (elle retourne `null` si `label` est falsy). Corrigé : lit `field?.label`/`field?.required` (typé via un cast local, `field` couvrant plusieurs types de champs qui n'ont pas tous `label`).
- **`admin/DynamicArrayLabel`** : même bug — le repli sur le libellé statique (tableau) quand `titre` est vide ne s'affichait jamais. Corrigé de la même façon.
- **`admin/RowLabel`** : non affecté (n'utilise pas `label`/`required`, lit `useRowLabel()`).
- **`admin/HiddenLabel`** : non affecté (ne rend jamais rien, quels que soient les props).

Bug présent depuis la décision 46, jamais détecté avant faute de rendu réel vérifié (limite déjà notée sur les décisions 46 à 50). Première fois qu'un retour utilisateur pointe vers un vrai bug de code plutôt qu'un problème de cache/rendu pas à jour — à garder en tête : ne pas systématiquement supposer le cache la prochaine fois qu'un retour visuel semble contredire le code.

### 52. Wording des champs bouton (Section d'introduction)

Retour client : `boutonPrincipalLabel`/`boutonSecondaireLabel` s'affichaient avec le libellé générique "Label" (auto-généré par Payload, faute de `label` explicite), ne disant pas de quel bouton il s'agit. Un regroupement en encadré visuel (texte + lien dans un sous-groupe avec bordure) a été tenté puis retiré à la demande du client au milieu du travail — un style CSS deviné sans pouvoir voir le rendu réel était jugé trop risqué à garder ; préférence pour des champs plats déjà éprouvés (cohérent avec la décision 50).

- **`boutonPrincipalLabel`/`boutonSecondaireLabel`** : libellé explicite ajouté — "Texte du bouton principal"/"Texte du bouton secondaire" (au lieu du "Label" générique).
- **`boutonPrincipalLien`/`boutonSecondaireLien`** : libellé explicite "Lien du bouton principal"/"Lien du bouton secondaire" + explication : "Vers quelle page du site voulez-vous que ce bouton redirige ?" (voir décision 53 ci-dessous : en description toujours visible, pas en info-bulle).
- **Confirmé au passage** : ces champs sont déjà des `relationship → pages` (menu déroulant de toutes les pages du site), cohérent avec tous les autres champs de navigation interne du BO (`quickAccessItems.lien`, `lienDocument`) — aucun changement nécessaire sur ce point, déjà le bon pattern partout où un bouton pointe vers une page du site (à distinguer des liens vers `pois`/`sentiers`, qui sont un autre type de destination).
- `collections/Pages.ts` : factorisé dans un helper `boutonFields(prefix, label)` (retourne les 2 champs plats), réutilisé pour principal et secondaire — évite la duplication du wording sans introduire de sous-groupe.

Vérifié par `npx tsc --noEmit` (propre). Pas vérifié par rendu réel.

### 53. Abandon de l'info-bulle ⓘ (`admin/LabelWithInfo`) — description toujours visible

Retour client, après le correctif du bug de la décision 51 (le texte de l'intitulé était revenu, l'icône ⓘ aussi) : "tu avais aussi supprimé les infos... l'explication pour titre, menu et slug" puis, en testant concrètement, "tu as mis une bulle i mais elle ne renvoie rien" — l'info-bulle au survol (texte natif HTML `title`, décision 46/47) ne s'affiche pas de façon perceptible à l'usage réel.

- **`title`/`slug`/`menu`** : `admin.components.Label` (`LabelWithInfo`) retiré, remplacé par un simple `admin.description` — texte toujours visible sous le champ, en italique (`.field-description`, déjà stylée globalement depuis la décision 46), plutôt que caché derrière un survol. Même pattern que `gabarit`, qui avait gardé sa description en dessous depuis le début.
- **`boutonPrincipalLien`/`boutonSecondaireLien`** (décision 52, ajoutés dans la même session avec le même pattern d'info-bulle) : corrigés en même temps, avant même un premier retour dessus — même `admin.description`.
- **`admin/LabelWithInfo`** : plus utilisé nulle part dans `collections/Pages.ts` après ce changement. Pas supprimé (même logique que `PreviewPicker`, décision 44 : repris plus tard si le survol est un jour fiabilisé/nécessaire) — mais son info-bulle native n'a pas été diagnostiquée plus loin ; à vérifier avant toute réutilisation.

Vérifié par `npx tsc --noEmit` (propre). Pas vérifié par rendu réel — mais cette fois le choix (texte toujours visible) ne dépend plus d'un survol qui pourrait à nouveau ne rien afficher.

**Corrigé par la décision 54 ci-dessous** : le placement (sous le champ) n'était pas celui voulu — déplacé à droite de l'intitulé.

### 54. Explication à droite de l'intitulé, pas en dessous

Retour client sur le placement choisi en décision 53 : "j'aurais préféré que ce soit à droite de l'intitulé du champ, genre Titre – explication." `admin/LabelWithInfo` reprend son rôle (retiré en décision 53), mais change de forme : au lieu d'une icône ⓘ avec info-bulle au survol (jamais fiable, décision 53), il concatène l'explication directement après l'intitulé, sur la même ligne, séparée par un tiret — toujours visible, aucune interaction requise.

- `admin/LabelWithInfo` réécrit : rendu `<FieldLabel label={field?.label} /> – {info}` au lieu de l'icône + `title` HTML. `style.scss` mis à jour en conséquence (plus de `.label-with-info__icon`, nouveau `.label-with-info__explanation` en italique, ton atténué).
- Réappliqué sur `title`/`slug`/`menu` et `boutonPrincipalLien`/`boutonSecondaireLien` (les `admin.description` de la décision 53 remplacés par ce composant).
- Toujours le même bug de fond corrigé en décision 51 (`field.label`, pas `label` au premier niveau) : ce composant en dépend directement, donc tout changement futur dessus doit re-vérifier ce point.

Vérifié par `npx tsc --noEmit` (propre). Pas vérifié par rendu réel.

### 55. Collection `Icônes` — remplace le texte libre lucide-react partout

Retour client, dans la foulée : "pour les icônes, je voudrais aussi le même principe que pour les pages, que ça ouvre une liste avec le nom de l'icône et la visualisation de l'icône... dans paramètres il faudrait ajouter une section icône." Jusqu'ici, chaque champ "icône" (catégories, démarches, salles, tuiles d'accès rapide de l'Accueil, contacts pratiques des Horaires) était un texte libre : l'éditeur devait connaître et taper à la main le nom exact d'un composant lucide-react, sans repère visuel — la note laissée dans `Categories.ts` en décision 11 anticipait déjà ce chantier ("remplacé par un vrai sélecteur visuel"). Même logique que la décision 49 (téléphones/emails) : remplacer une saisie libre par une vraie liste gérée, relation plutôt que texte.

- **Nouvelle collection `Icones`** (`collections/Icones.ts`, slug `icones`) : `nom` (texte, ex. "Téléphone") + `icone` (texte, nom exact du composant lucide-react, ex. "Phone"). Créée/gérée par le super-admin uniquement (même logique que `Categories`, décision 10) ; lisible par tous. Ajoutée à `payload.config.ts` et à la sidebar (`admin/Nav/Client.tsx`) sous Paramètres, entre Catégories et Documents.
- **`admin/IconPreviewField`** (nouveau, `afterInput`) : aperçu du glyphe rendu à côté de l'input pendant la saisie du nom lucide-react, sur la fiche d'une icône. En `afterInput` plutôt qu'en `Field` complet — l'input texte natif de Payload continue de fonctionner tel quel (évite de réimplémenter la logique d'un champ natif à la main, cf. la prudence acquise en décision 51).
- **`admin/IconCell`** (nouveau, `admin.components.Cell` sur le champ `icone`) : la liste `/collections/icones` affiche le glyphe + le nom, pas juste le texte brut — répond au "ça ouvre une liste avec le nom de l'icône et la visualisation de l'icône" pour la gestion en Paramètres.
- **Les 5 champs "icône" existants convertis** de `type: 'text'` à `type: 'relationship', relationTo: 'icones'` : `Categories.icone`, `liste.itemsDemarches[].icone`, `catalogueLieux.salles[].icone`, `accueil.quickAccessItems[].icone`, `horaires.contactsPratiques[].icone`. Chacun ouvre désormais le même sélecteur en liste (recherche + nom) que les champs `relationship → pages` — plus de faute de frappe possible, plus besoin de connaître lucide-react par cœur.
- **Limite assumée à l'origine, levée par la décision 56 ci-dessous** : le sélecteur de relation par défaut de Payload n'affichait que le nom dans sa liste, pas le glyphe — jugé essentiel par le client ("oui je veux le glyphe, c'est essentiel"), donc repris immédiatement après.
- `lib/payload.ts` : nouveau type `PayloadIconRelation` (`{icone?, nom?} | string`) + helper `resolveIconName()` (avec surcharge de type pour un usage avec/sans valeur de repli) ; tous les champs `PayloadCategory.icone`, `PayloadDemarcheItem.icone`, `PayloadCatalogueSalle.icone`, `PayloadContactPratique.icone`, `quickAccessItems[].icone` mis à jour et leurs 5 points de lecture adaptés.
- `scripts/seed.ts` : nouvelle fonction `seedIcones()` (liste `SEED_ICONES`, 25 icônes reprenant tout ce qui était déjà utilisé en dur dans ce script) exécutée en tout premier, retourne une map nom-lucide → id, propagée aux fonctions qui en ont besoin (`seedAnnuairePage`, `seedCatalogueLieux`, `seedPageShells`). Commentaire obsolète sur `seedTelephonesEmails()` (supprimée en décision 49) corrigé au passage dans l'en-tête du fichier.

Vérifié par `npx tsc --noEmit` (propre). Pas vérifié par rendu réel.

### 56. Glyphe dans la liste de choix — `admin/IconPickerField` (remplace le sélecteur natif)

"Oui je veux le glyphe, c'est essentiel" — le sélecteur en liste déroulante par défaut d'un champ `relationship` (utilisé pour "Icône" depuis la décision 55) n'affiche que le nom, jamais le glyphe rendu, dans sa propre liste d'options. Confirmé non négociable, donc repris tout de suite plutôt que différé.

- **`admin/IconPickerField`** (nouveau) remplace entièrement le rendu par défaut du champ (`admin.components.Field`, pas juste `Label`/`afterInput`/`Cell` comme les décisions précédentes) sur les 5 champs "icône" (décision 55). Architecture à deux étages, même principe que `admin/Nav` :
  - `index.tsx` — Server Component qui récupère la liste complète des icônes une fois (`payload.find({collection:'icones', ...})`, `payload` reçu via les ServerProps injectées automatiquement par Payload).
  - `Client.tsx` — composant 100% custom (bouton déclencheur + panneau avec recherche + liste cliquable, chaque ligne glyphe + nom), utilisant `useField<string>({path})` de `@payloadcms/ui` pour lire/écrire la valeur du champ directement (un `relationship` à une seule collection stocke un id brut, pas un objet `{relationTo, value}` — vérifié dans le code source de `RelationshipField` avant d'écrire quoi que ce soit, même discipline que la décision 51).
  - Choix délibéré de ne PAS réutiliser les internes react-select de Payload (non documentés, non conçus pour être étendus) plutôt qu'une reconstruction complète et autonome — moins de surface de bug caché, même si plus de code écrit à la main.
- **Pourquoi une réécriture complète plutôt qu'une simple option de formatage** : `RenderField.js` (côté Payload) montre qu'un `admin.components.Field` personnalisé remplace intégralement le composant par défaut du type de champ (`RelationshipField` inclus) — il n'existe pas de point d'extension plus léger (genre `formatOptionLabel`) exposé publiquement pour injecter un rendu personnalisé dans les options d'un `relationship` existant.
- `collections/Pages.ts` : nouveau helper `iconField(access?)` factorisant les 5 usages (`label:'Icône'`, `admin.components.Field:'/admin/IconPickerField'`, `access` optionnel pour les 4 verrouillés au super-admin). `Categories.ts` câblé directement (pas de helper partagé entre les deux fichiers).
- **`app/(payload)/admin/importMap.js`** : `scripts/gen-importmap.ts` échouait à ce moment (voir cause racine identifiée en décision 58 : mauvaise version de Node active). Les 4 entrées manquantes (`LabelWithInfo` — jamais régénéré depuis son introduction en décision 46/54 —, `IconPickerField`, `IconPreviewField`, `IconCell`) ajoutées à la main en attendant, en suivant le format déjà généré. **Depuis remplacé** : `next dev` (ou une régénération manuelle réussie après la décision 58) a régénéré le fichier proprement, avec les vrais hash — les entrées ajoutées à la main ont fait leur office le temps de débloquer la suite.

Vérifié par `npx tsc --noEmit` (propre). Pas vérifié par rendu réel — c'est le composant le plus ambitieux de la session (lecture/écriture directe de la valeur du champ, pas juste de l'affichage), donc celui qui mérite le premier test réel le plus attentif.

### 57. `admin/IconPreviewField`/`IconCell`/`IconPickerField` réécrits pour réutiliser `LucideIconByName`

Les 3 composants de la décision 55/56 faisaient chacun `import * as LucideIcons from 'lucide-react'` puis un lookup par nom (`LucideIcons[name]`) — exactement le pattern documenté comme abandonné dans `shared/lib/icons.ts` (mesuré : +167 Ko de bundle, tout lucide-react embarqué au lieu d'un import à la demande). Repéré en auditant le code pour la décision 58 ci-dessous (pas un retour client), corrigé avant que ça ne devienne un vrai problème de taille de bundle admin.

- Les 3 composants réutilisent maintenant `LucideIconByName` (`@shared/lib/icons`, `lucide-react/dynamic`) — même fonction que le site public (`QuickAccess`, `ContactCard`, `DemarchesLayout`...), au lieu de dupliquer une logique de résolution différente et plus coûteuse.
- CSS de repli devenue inutile supprimée (`.icon-preview-field__empty`, `.icon-picker__placeholder`) — `LucideIconByName` a son propre repli (`HelpCircle`) intégré, plus besoin d'un état vide géré à la main.

Vérifié par `npx tsc --noEmit` (propre).

### 58. Cause racine des échecs `tsx`/Payload : version de Node — bug réel trouvé et incident de duplication corrigé

Le client a demandé de reporter dans la collection `Icones` **toutes** les icônes déjà utilisées dans le code du site (pas seulement celles déjà branchées à un champ éditable, décision 55/58 ci-dessus étend `SEED_ICONES` à 37 entrées après audit exhaustif de `features/**/*.tsx` — y compris le contenu statique de secours des Démarches/Contact/Horaires, item 10, pas encore migré). Puis, autorisation explicite ("vas-y fais-le") de résoudre l'erreur `ERR_PACKAGE_PATH_NOT_EXPORTED` qui bloquait tout script Payload Local API lancé via `tsx` depuis plusieurs décisions (46, 55, 56).

**Cause racine trouvée** (pas devinée) : le shell par défaut de ce projet a Node **v16.15.0** actif (`node --version`), alors que Payload exige `^18.20.2 || >=20.9.0` (`node_modules/payload/package.json`) et sa dépendance `file-type@21.3.4` exige `>=20` et est pur ESM (`"type": "module"`, aucune condition `require` dans ses `exports`) — un `require('file-type')` sous Node 16 ne peut tout simplement pas le résoudre. Rien à voir avec `tsx`, ni avec `richtext-lexical` (l'incompatibilité ESM/CJS notée en décision 30/44 était un problème voisin mais distinct). `nvm` est installé sur la machine avec plusieurs versions plus récentes déjà disponibles (`v20.19.5`, `v22.21.1`) — non actives par défaut dans ce shell.

- **Contournement retenu** : `nvm use 22` (ou 20) avant tout script Payload Local API, plus `node --env-file=.env node_modules/.bin/tsx <script>` — `payload.config.ts` lit `process.env.PAYLOAD_SECRET`/`DATABASE_URI` directement (pas de `dotenv` dans les dépendances), auto-chargé par Next.js mais pas par un script `tsx` autonome. `--env-file` est un flag natif Node ≥20 (pas besoin d'installer `dotenv`).
- **Bug réel trouvé en testant ce contournement** : exporter `seedIcones`/`SEED_ICONES` depuis `scripts/seed.ts` pour les réutiliser dans un script isolé (`scripts/seed-icones.ts`, décision 58) a eu un effet de bord inattendu — `seed.ts` avait un appel `seed().then(...)` au niveau racine du module, qui s'exécute **dès l'import**, pas seulement à l'exécution directe du fichier. Importer `seedIcones` déclenchait donc AUSSI tout `seed()` en parallèle. Corrigé par un garde d'entrée standard ESM : `if (process.argv[1] === fileURLToPath(import.meta.url)) { seed()... }`.
- **Incident et réparation** : ce bug non détecté avant un premier run réel a fait tourner `seedIcones()` 4 fois (2 exécutions du script × 2 appels concurrents chacune), créant 148 icônes au lieu de 37. Vérifié par une lecture directe de la base (`payload.find` sur `icones`/`pages`/`categories`, aucun autre doublon trouvé — l'exécution parallèle de `seed()` s'est arrêtée tôt, avant `seedAnnuairePage`, à cause d'un `process.exit()` concurrent). Réparé : les 148 icônes supprimées puis les 37 recréées une seule fois, une fois le bug corrigé. Scripts de diagnostic/réparation utilisés une fois puis supprimés (pas des outils à garder dans le projet).
- **`scripts/seed-icones.ts`** (nouveau, permanent) : seed isolé de la seule collection `Icones`, réutilisable sans relancer tout `seed.ts` (qui échouerait de toute façon sur la page Accueil déjà seedée, singleton, décision 9).

Vérifié par lecture directe de la base après coup (37 icônes, aucun doublon de slug de page). Le vrai `npx tsx scripts/gen-importmap.ts` (décision 55/56) fonctionne maintenant aussi sous Node 22 — plus besoin des entrées d'`importMap.js` ajoutées à la main.

**Correctif immédiat** : "je veux que des noms en français" — quelques `nom` de `SEED_ICONES` n'étaient pas du français propre (anglicismes "Fitness"/"Email", tournures doubles "Trophée / Sport", "Justice / Civique", "Vérifié / Sécurité"...). Toute la liste relue et simplifiée à un seul concept par nom, en français sans exception (ex. "Fitness" → "Musculation", "Email" → "Courriel", "Vérifié / Sécurité" → "Sécurité"). Les 37 icônes déjà seedées supprimées puis recréées avec les noms corrigés (rien n'y référençait encore).

### 59. Reliaison des 34 catégories existantes à leurs icônes d'origine

"Relie bien les catégories aux icônes, en fonction de ce que j'avais dans le site" — les 34 catégories déjà en base avaient été seedées **avant** la conversion de `Categories.icone` en relation (décision 55) : leur champ `icone` contenait encore l'ancienne valeur texte (ex. `"TreePine"`), désormais interprétée comme une relation vers `icones` — donc cassée (une chaîne de caractères n'est pas un identifiant Mongo valide).

- Script ponctuel (`scripts/relink-category-icons.ts`, supprimé après usage) : reconstruit le mapping catégorie → icône d'origine à partir des 4 constantes `*_CATEGORY_META` de `scripts/seed.ts` (ce sont elles qui reflètent fidèlement le rendu statique du site avant migration, comme documenté dans leur propre commentaire), retrouve l'id de chaque icône correspondante dans la collection `icones`, et met à jour chaque catégorie.
- **Piège Mongoose rencontré et contourné** : lire les catégories avec la profondeur par défaut de Payload fait planter la requête (`CastError`, Payload/Mongoose tente de peupler `icone` comme une relation et échoue sur l'ancienne valeur texte). Corrigé avec `depth: 0` sur la lecture — retourne la valeur brute telle quelle, sans tentative de résolution, seul le `nom` de la catégorie (pas son ancien `icone`) sert à retrouver la bonne icône.
- **Résultat** : 21 catégories reliées avec succès (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs). 13 catégories ignorées sans erreur — Agenda/Actualités/Documents (`AGENDA_CATEGORY_META`, `ACTUALITES_CATEGORY_META`, `DOCUMENTS_CATEGORY_META`) n'ont jamais eu d'icône dans le site d'origine, seulement une couleur — comportement attendu, pas un oubli. "Cafés - Bars" (type TypeScript valide dans `features/commerces/data.ts`) n'apparaît dans aucune des deux listes : aucun commerce réel n'utilise cette catégorie aujourd'hui, donc elle n'a jamais existé comme document en base — pas un bug de ce script.

Vérifié par la sortie du script (compte exact 21 + 13 = 34, aucune "icône introuvable"). Confirmé par le client en testant en vrai (icônes identiques à la version en dur, vérifié entrée par entrée contre `features/*/index.tsx`).

### 60. Sous-catégorie "Mes pages" dans "Mon site"

"Mes pages" ajoutée comme sous-en-tête explicite (`admin/Nav/Client.tsx`), même pattern que "Lieux & sentiers" juste en dessous — regroupe "+ Nouvelle page" et la liste de toutes les pages existantes, plutôt que de les laisser au premier niveau de "Mon site" sans repère.

### 61. En-tête et pied de page éditables — 3 nouveaux `globals` Payload

Chantier discuté avant d'être codé (voir l'échange dans la session) : l'en-tête et le pied de page du site étaient entièrement en dur dans `shared/components/Header`/`Footer`, aucun moyen pour le client de changer son logo, son numéro, ses horaires ou le bouton d'action de l'en-tête. Le client a proposé le découpage, confirmé après discussion :

- **`Identite`** (slug `identite`, "Identité du site") : `titre`, `sousTitre`, `logo` (upload). Un seul global, lu à la fois par le Header et le Footer — évite la resaisie qui existait déjà en dur en double dans les deux composants ("ça fait chier de le taper deux fois").
- **`BoutonEntete`** (slug `bouton-entete`, "Bouton d'en-tête") : réutilise `boutonFields` (décision 52, maintenant exportée depuis `collections/Pages.ts`) — texte + lien vers une page du site. Séparé de l'identité : contenu que le client change plus souvent (quelle page mettre en avant), pas une donnée de marque fixe. Accès `isLoggedIn` (pas verrouillé super-admin) — n'importe quel éditeur peut changer le texte et la cible.
- **`Footer`** (slug `footer`, "Pied de page") : réutilise `contactFields` (décision 48/49/50, maintenant exportée) pour adresse/téléphone/email — cohérence totale avec le reste du site. Ajoute `description` (texte de présentation), `joursOuverture`/`horaires` (2 champs texte simples, pas le modèle jour-par-jour complet de la page Horaires — le pied de page n'affichait qu'une seule ligne récapitulative avant, pas un tableau), `facebook`/`instagram` (texte, optionnels).

**Placement dans la sidebar — décidé en discussion** : les 3 restent groupés sous "Mon site" (nouveau sous-en-tête "En-tête & pied de page"), pas éclatés entre "Mon site" et "Paramètres" comme envisagé un temps. Raisonnement retenu : la distinction "Mon site" / "Paramètres" jusqu'ici, c'est "contenu que le client édite" vs "listes structurelles gérées une fois par le dev" (catégories, icônes) — en-tête et pied de page sont clairement du premier type, les séparer aurait cassé ce repère mental.

- `lib/payload.ts` : `getIdentiteData`/`getBoutonEnteteData`/`getFooterData`, avec repli sur les valeurs qui étaient codées en dur si Payload est injoignable (même logique que `DEFAULT_NAV_LINKS`).
- `app/(frontend)/layout.tsx` : les 3 fetchés en parallèle (`Promise.all`) avec `getNavLinks`, passés en props à `Header`/`Footer`.
- **Nettoyage au passage dans `Footer`** : colonnes de liens "La mairie" (Délibérations & arrêtés, Démarches en ligne, Marchés publics) et "Découvrir" (Tourisme & loisirs, Vie associative, Agenda communal, Patrimoine), ainsi que les liens légaux du bas (Mentions légales, Accessibilité, Confidentialité, Plan du site), **retirés** — c'étaient tous des `href="#"` qui ne menaient nulle part ("aucun lien ne mène actuellement vers une redirection de site interne", observation du client). Un lien mort a été jugé pire qu'un lien absent ; pas remplacés par du contenu inventé. Grille CSS ajustée de 3 à 2 colonnes en conséquence. À reprendre dans un chantier séparé si des pages réelles doivent être créées pour ces liens.
- **Seed** : `seedSiteSettings()` (exportée, `scripts/seed.ts`) peuple les 3 globals avec les valeurs d'origine (titre, sous-titre, adresse, jours/horaires, bouton → page "Location de salles"). `telephone`/`email`/`facebook`/`instagram` laissés vides : aucune valeur d'origine à migrer, à saisir par le client. Exécutée isolément via `scripts/seed-site-settings.ts` (même raison que `seed-icones.ts`, décision 58 : `seed()` complet replanterait sur les slugs déjà seedés).

**Bug de données pré-existant découvert et corrigé en cours de route** : lire la page "Location de salles" pour trouver son id (pour le lien du bouton) faisait planter Payload — `CastError` Mongoose sur `catalogueLieux.salles[].icone`, qui portait encore l'ancienne valeur texte ("Building2") d'avant la décision 55, exactement comme les catégories en décision 59. Différence cette fois : `depth: 0` sur la requête n'a **pas** suffi (contrairement aux catégories) — Mongoose caste apparemment ce genre de champ imbriqué dans un tableau dès l'hydratation du document, avant même que la profondeur de peuplement de Payload n'entre en jeu. Contourné en écrivant directement via le driver MongoDB natif (`payload.db.connection.db`), qui bypasse le cast Mongoose. Un audit complet de toutes les pages a ensuite trouvé le même problème sur `accueil.quickAccessItems[].icone` (3 tuiles) — corrigé de la même façon. Scripts de diagnostic/réparation utilisés une fois puis supprimés.

Vérifié par l'exécution réelle du seed isolé (aucune erreur après les 2 correctifs) et un audit final confirmant zéro icône obsolète restante dans toute la base.

### 62. Migration du contenu réel des 13 démarches

Suite à l'audit "est-ce que tout est transféré ?" (le plus gros manque identifié) : les 13 démarches n'existaient que dans le JSX statique de secours (`features/demarches/index.tsx`), jamais dans `itemsDemarches` — contrairement à l'essentiel du reste du site, ce n'est pas du Lorem ipsum mais du vrai contenu déjà rédigé, donc une vraie migration, pas une invention de contenu.

- Un convertisseur JSX→Lexical générique reste hors scope (décision 32 — cas trop variés à couvrir de façon fiable). Ici, transcription manuelle entrée par entrée d'un contenu fini et connu (13 démarches, pas un flux arbitraire) : un petit builder construit à la main la structure JSON Lexical attendue (paragraphes, listes à puces, liens), vérifiée contre les types de `lexical`/`@payloadcms/richtext-lexical` (`SerializedTextNode`, `SerializedLinkNode`...) avant d'écrire quoi que ce soit — même discipline que la décision 51 (lire le code source plutôt que deviner un format).
- Les 6 catégories de démarches (État civil, Scolarité, Citoyenneté, Urbanisme & voirie, Environnement, Titres & documents) n'existaient pas non plus (jamais seedées, puisque `itemsDemarches` ne l'était pas) — créées au passage, liées à la page comme pour l'Annuaire.
- Icônes de chaque démarche (Baby, Heart, PenLine, Skull, ShieldCheck, GraduationCap, Bus, Users, CreditCard, Hammer, Building, Recycle, Sprout) : toutes déjà présentes dans la collection `Icones` (décision 55/58), pas de nouvelle icône à créer.
- Contenu du site officiel externe préservé tel quel : liens vers Service-Public.fr, ANTS, Région Nouvelle-Aquitaine, Syded87 — rien de raccourci ni résumé, transcription fidèle du texte existant.
- Script de migration (`scripts/migrate-demarches.ts`, usage unique) supprimé après exécution, comme les autres scripts ponctuels de cette session.

Vérifié par une relecture complète via l'API Payload après écriture (13 démarches, catégories et icônes bien résolues en relations, nombre de blocs de contenu par démarche cohérent avec le texte d'origine) — pas seulement un statut "sans erreur" à l'écriture.

### 63. Coordonnées manquantes dans la section contact de l'Accueil

Retour client : la section contact (`accueil.cta`) de l'Accueil affichait un titre/description/bouton corrects mais pas d'adresse/téléphone/email — un oubli du premier seed (`seedPageShells`), pas une conséquence des décisions 48/49/50 sur les coordonnées.

- **Source des vraies données : `/Users/c.fournier/Documents/perso/saint-hilaire-demo`** — l'ancien projet de travail avant le déménagement vers `communes/style-edito` (voir mémoire du chantier), toujours dans le périmètre autorisé de ce compte. Son composant `features/home/CTA/index.tsx` contient les coordonnées d'origine en dur : adresse "Le Bourg, 87260 Saint-Hilaire-Bonneval", téléphone "05 55 00 61 65", email "contact@saint-hilaire-bonneval.fr" — cohérent avec `titre`/`description`/`boutonLabel`, déjà corrects, qui viennent du même composant.
- `scripts/seed.ts` corrigé pour les prochains seeds complets. Base déjà seedée corrigée séparément (page Accueil = singleton, un seed complet aurait replanté sur les pages déjà existantes, décision 58/61) : lecture de `accueil` à `depth: 0`, fusion à la main en JS des 3 nouveaux champs dans `cta` (sans écraser `titre`/`description`/`boutonLabel`, ni le reste d'`accueil` — pas fait confiance à un merge partiel de Payload à une profondeur incertaine, préféré fusionner explicitement avant écriture).
- **Piste à garder en tête** : `saint-hilaire-demo` reste une source fiable pour retrouver du contenu réel oublié en cours de migration — à consulter en priorité avant d'inventer quoi que ce soit, si d'autres trous du même genre sont trouvés plus tard.

Vérifié par une relecture complète de la page Accueil après écriture (hero, 3 tuiles, mot du maire, 3 cartes découverte tous intacts, `cta` complet avec les 6 champs).

### 64. Coordonnées perdues sur les 63 fiches annuaire — rebranchées

Même famille de problème que la décision 63, à plus grande échelle : "je vois aussi que des données ont été perdues en cours de route... remplir toutes les fiches médecin, commerçant etc." Vérifié : les 63 fiches des 4 pages Annuaire (Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs) n'avaient **aucune** adresse/téléphone/email en base — ces champs n'existaient tout simplement pas sur les documents. Cause : ces pages ont été seedées avec le schéma `contacts` d'origine (décision 22), jamais re-seedées après les refontes successives de ce schéma (décisions 48, 49, 50) — chaque changement de schéma rendait la donnée existante un peu plus incompatible, sans jamais la faire migrer.

- Script ponctuel (`scripts/backfill-annuaire-contacts.ts`, supprimé après usage) : reprend le même mapping que `seedAnnuairePage` (déjà correct dans le code depuis la décision 50/58) mais en `update`, en faisant correspondre chaque fiche existante à son entrée source par le nom (`nom` en base = `name` dans `features/*/data.ts`), plutôt que de tout recréer.
- **Piège de données trouvé en route** : 2 fiches commerces ("L'Adéquate", "Les Chevaux de Moncontour") ont un site web stocké dans le champ `email` de la donnée source d'origine ("www.ladequate.fr", "leschevauxdemoncontour.com") — pas une adresse email valide, rejetée par le champ `email` strict de Payload. Exclues proprement (regex de validation avant écriture) plutôt que de planter tout le script ou d'écrire une donnée invalide ; loggées pour rester visibles.
- **Résultat** : 63/63 fiches correspondues sans exception. Les champs qui restent vides ensuite (ex. **aucune** des 12 fiches "Vie associative" n'a de téléphone) reflètent fidèlement l'absence de cette donnée dans la source elle-même (vérifié : `features/vie-associative/data.ts` n'a jamais eu de champ `phone`) — pas un oubli du script.

Vérifié par une relecture complète des 4 pages après écriture (comptage avant/après des champs manquants par page, confirmation que les champs encore vides correspondent à une absence réelle dans la source).

### 65. Champ "Site web" ajouté à `contactFields`

Suite directe de la décision 64 : les 2 sites web trouvés mal rangés dans l'ancien champ `email` méritent leur propre champ plutôt que d'être perdus ou de rester coincés dans un champ qui les rejette (validation stricte du type `email`).

- **`contactFields`** (`collections/Pages.ts`) étendu avec `siteWeb` (texte) — se propage automatiquement partout où ce tableau est réutilisé : fiches Annuaire, Contact, Accueil (section contact), Horaires (contacts pratiques), Pied de page (décision 61).
- **`ContactItem`** (`shared/components/ContactCard`) étendu avec le type `'website'` — icône `Globe`, lien cliquable qui s'ouvre dans un nouvel onglet. `websiteHref()` ajoute `https://` si absent (les valeurs source n'ont pas toutes un protocole, ex. "www.ladequate.fr") tout en affichant la valeur telle quelle.
- **`features/home/CTA/index.tsx`** : `ICONS`/`LABELS` (mapping type → icône/libellé, propre à ce composant) mis à jour en conséquence — repéré par le typecheck, pas oublié silencieusement.
- **Page Contact** (`getContactData`) : nouvelle carte "Sur le web" si `siteWeb` est renseigné, même pattern que les cartes téléphone/email/adresse existantes.
- **Données sources corrigées à la racine** (`features/commerces/data.ts`) : les 2 valeurs de site web déplacées du champ `email` (invalide) vers un nouveau champ `website` — pour qu'un futur seed complet depuis zéro produise directement la bonne donnée, sans repasser par un script de réparation. `AnnuaireSourceItem`/`seedAnnuairePage` (`scripts/seed.ts`) mis à jour pour le reprendre (`siteWeb: item.website`).
- Base déjà seedée corrigée séparément (script ponctuel, supprimé après usage) : les 2 fiches concernées ("L'Adéquate", "Les Chevaux de Moncontour") ont maintenant leur site web au bon endroit.

Vérifié par `npx tsc --noEmit` (propre — a justement débusqué le mapping `ICONS`/`LABELS` du CTA qui aurait sinon silencieusement affiché une icône manquante pour le type `website`) et par l'exécution réelle du script de correction.

### 66. "Médiathèque" réintégrée à la sidebar, renommée "Médias"

Retirée en décision 46 ("jugée inutile pour l'instant"), remise après un usage réel : en testant l'upload d'images (logo, hero...), plusieurs doublons se sont accumulés dans la collection `media` (Payload ajoute `-1`, `-2`... au nom de fichier au lieu d'écraser quand le même nom existe déjà — repéré 5 images uploadées 2 à 3 fois chacune). Sans lien direct dans la sidebar, impossible de les repérer ou de les nettoyer facilement. Renommée "Médias" au passage (moins ambigu que "Médiathèque").

- `admin/Nav/Client.tsx` : lien "Médias" ajouté sous Paramètres (entre Icônes et Documents), icône `Images`.

Pas d'action sur les doublons eux-mêmes cette fois — juste rendu l'accès possible pour que le client les gère lui-même (garder laquelle, supprimer les autres) depuis l'admin, plutôt que de trancher à sa place laquelle des 2-3 versions de chaque image garder.

### 67. Sous-groupes de "Mon site" repliables (fermés par défaut), ligne de séparation retirée

"Retire les lignes en dessous des sous-catégories Lieux et sentiers, En-tête et Mes pages. Peut-on aussi faire un dropdown à ce niveau ? Les tabs sont fermés quand on ouvre Mon site, et je peux déployer ?"

- **`admin/Nav/Client.tsx`** : `NavSubheaderItem` (un simple séparateur texte suivi d'items toujours visibles) remplacé par `NavSubgroupItem` (`{kind:'subgroup', label, items}`) — chaque sous-groupe ("Mes pages", "En-tête & pied de page", "Lieux & sentiers") a maintenant son propre état replié/déplié, **fermé par défaut** (`useState(false)`), avec un bouton + chevron comme "Mon site"/"Paramètres" mais un cran plus petit (nouveau composant `NavSubgroup`, même principe que `NavGroup`).
- **`admin/Nav/style.scss`** : `.admin-nav__subheader` (avec sa `border-bottom`) remplacée par `.admin-nav__subgroup`/`.admin-nav__subgroup-header`/`.admin-nav__subgroup-chevron`/`.admin-nav__subgroup-items` — pas de ligne de séparation dans le nouveau style.
- `Paramètres` non concerné (n'a jamais eu de sous-catégories, reste une liste plate).

Vérifié par `npx tsc --noEmit` (propre).

### 68. Logo Payload remplacé sur l'écran de connexion

"Je ne veux plus le logo Payload, mais mon espace administrateur" — `admin.components.graphics.Logo` (`payload.config.ts`) pointé vers un nouveau composant `admin/LoginLogo`.

- Server Component (comme `admin/Nav`) : va chercher le `titre` du global `Identite` (décision 61) au lieu d'un texte en dur — cohérent avec le reste de l'admin, une seule source pour le nom du site. Repli sur "Espace administrateur" si le global n'est pas encore renseigné.
- Pastille de marque avec les initiales dérivées du titre (ex. "Saint-Hilaire-Bonneval" → "SH", split sur espaces et tirets) + libellé "Espace administrateur" en eyebrow au-dessus du nom — même esprit que la pastille de marque de la sidebar (`admin/Nav`), pas le même code (contextes différents : sidebar toujours authentifiée, logo affiché avant connexion).

Vérifié par `npx tsc --noEmit` (propre) ; l'importMap s'est régénéré tout seul correctement cette fois (le vrai `next dev`/`gen-importmap.ts` fonctionne depuis la décision 58, Node 22).

### 69. Tableau de bord sur-mesure — "Bonjour {prénom}"

"Le tableau de bord ne doit pas être des collections, je veux une page qui me dit Bonjour avec le nom de l'utilisateur."

- **`collections/Users.ts`** : `prenom`/`nom` ajoutés (texte, obligatoires) — n'existaient pas avant, seul l'email identifiait un utilisateur.
- **`admin/Dashboard`** (nouveau) : remplace entièrement l'accueil par défaut de Payload (`admin.components.views.dashboard.Component`, `payload.config.ts`) — Server Component qui affiche "Bonjour {prénom}" à partir de l'utilisateur connecté (`user` reçu via les ServerProps).
- **Utilisateur existant sans prénom/nom** (`admin@style-edito.local`, le compte de test créé en décision 26) : pas de valeur inventée — champ vide géré proprement (message discret invitant à renseigner son prénom dans son profil) plutôt qu'un texte fabriqué à sa place.

**Discussion ouverte, pas encore tranchée** : ce qu'on pourrait ajouter sur ce tableau de bord ensuite. Recommandation donnée au client : prioriser des raccourcis vers les actions vraiment fréquentes (+ nouvelle actualité, + nouvel évènement agenda — déjà identifiées comme le geste le plus courant d'une secrétaire de mairie, voir la discussion sur un futur écran dédié Agenda/Actualités) et un état "reste à compléter" (contenu encore vide repéré lors des décisions 62-65 : démarches sans contenu, images pas encore uploadées...) plutôt que des statistiques décoratives qui ne font rien faire à l'utilisateur.

Vérifié par `npx tsc --noEmit` (propre). Pas testé en vrai (pas de prénom encore renseigné sur le compte existant pour voir le rendu avec un vrai nom).

### 70. Tableau de bord — raccourcis + "reste à compléter" dynamique, date du jour

Suite directe de la décision 69 : "go, partons là-dessus" sur la recommandation (raccourcis vers les actions fréquentes + état "reste à compléter" plutôt que des statistiques décoratives), plus une date du jour ("toujours utile").

- **Date du jour** : formatée en français complet (`Intl.DateTimeFormat('fr-FR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})`), sous le "Bonjour".
- **Raccourcis** : 2 cartes pleines terracotta, vers les pages Actualités (`mairie/actualites`) et Agenda (`agenda`) — les deux gestes les plus fréquents identifiés. Pas un "+ ajouter directement une ligne" (ça demanderait le chantier d'écrans sur-mesure Agenda/Actualités déjà explicitement différé) — juste un accès direct à la bonne page d'édition, sans avoir à la chercher dans "Mes pages".
- **"Reste à compléter"** : liste dynamique construite en interrogeant la base à chaque chargement (Server Component), pas une liste figée — se vide au fur et à mesure. Vérifie : sections vides sur Histoire/La commune (gabarit éditorial, `editorial.sections`), aucune coordonnée sur Contact, aucun horaire renseigné sur aucun jour de la page Horaires, logo absent sur Identité du site, téléphone et email absents du Pied de page. Chaque ligne est un lien direct vers l'écran d'édition concerné.
- **Vérifié contre la vraie base** (pas juste un statut "sans erreur") : script de vérification ponctuel (supprimé après usage) confirmant que chaque condition s'évalue correctement sur les données réelles actuelles — a confirmé au passage que le logo est déjà uploadé depuis la décision 68 (`identite.logo` non vide), donc n'apparaît plus dans la liste, comme attendu.

Vérifié par `npx tsc --noEmit` (propre) et par une vérification directe de la logique contre la base réelle (pas seulement compilée, testée avec les vraies données actuelles).

### 71. Cartes raccourcis redessinées — "un peu sexy, avec l'envie de cliquer dessus"

Les 2 pilules plates terracotta jugées moches. Refaites en vraies cartes : dégradé plein (coral pour Actualités, leaf pour Agenda — teintes déjà établies côté site public, une par raccourci pour les distinguer d'un coup d'œil), halo lumineux en coin (radial-gradient blanc translucide), icône dans un badge, titre + sous-titre descriptif ("Publier une actu sur le site" / "Ajouter une date à l'agenda"), ombre portée teintée (pas un gris générique) et flèche qui glisse vers la droite au survol, carte qui se soulève légèrement.

Vérifié par `npx tsc --noEmit` (propre).

### 72. Retour au thème de couleur + 3e carte "Nouvelle publication"

"Reste dans le thème de couleur" — les cartes pleine couleur (dégradés coral/leaf) de la décision 71 sortaient de la palette établie de l'admin (fond blanc partout ailleurs, terracotta/corail en accent seulement). Revenu à un fond blanc/carte standard (même surface que les lignes "Reste à compléter"), avec le corail réservé à l'icône (halo clair, `$coral-15`) et à la flèche — élévation douce + bordure corail au survol pour garder l'envie de cliquer sans sortir du thème.

- 2 raccourcis supplémentaires ajoutés dans la foulée : **"Nouvelle publication"** → page "Documents & publications" (`mairie/publications`), icône `FileStack` (même langage visuel que l'entrée "Documents" de Paramètres) ; **"Nouveau numéro utile"** → page "Numéros utiles" (`numeros-utiles`), icône `Phone`.
- Les 4 cartes utilisent `flex: 1 1 260px` — s'organisent automatiquement en 2, 3 ou 4 colonnes selon la largeur disponible.

Vérifié par `npx tsc --noEmit` (propre).

### 73. Chevron repliable mal positionné — "empiète sur le titre"

Le libellé (`<span>{label}</span>`) n'avait aucune contrainte de largeur — avec `justify-content: space-between` sur le bouton, un libellé long (notamment "En-tête & pied de page", le plus long de la sidebar) pouvait pousser le chevron sans espace garanti, voire le faire chevaucher. Corrigé : le libellé reçoit sa propre classe (`admin-nav__group-label`/`admin-nav__subgroup-label`) avec `flex:1; min-width:0` + troncature propre (`text-overflow: ellipsis`, une seule ligne, jamais de retour à la ligne qui décale le chevron) ; le chevron passe à `flex-shrink:0` avec une marge gauche fixe (10px) — toujours collé au bord droit, jamais compressé.

Vérifié par `npx tsc --noEmit` (propre).

### 74. Fil d'ariane personnalisé, avatar utilisateur, sidebar sticky

Quatre demandes groupées dans le même message.

- **Fil d'ariane** : icône Payload du premier maillon (`.step-nav__home`, lien vers `/admin`) remplacée par le texte "Mon tableau de bord" (`admin/BreadcrumbHome`, câblé via `admin.components.graphics.Icon` — même point d'extension que le logo de connexion, décision 68, mais un usage différent : ce composant contrôle le fil d'ariane, pas l'écran de connexion). Trouvé en lisant le code source de `StepNav`/`Default template` (`@payloadcms/ui`/`@payloadcms/next`) avant d'écrire quoi que ce soit — même discipline que la décision 51 : `.step-nav__home` est dimensionné pour une icône 18×18 par Payload, élargi en conséquence pour laisser la place au texte, sinon coupé.
- **Couleur + gras** : tout le fil d'ariane en corail, dernier maillon (page courante, `.step-nav__last`, déjà fourni tel quel par Payload) en gras plus prononcé.
- **Avatar utilisateur** : `Users.photo` (upload → `media`) ajouté. Pied de la sidebar (`admin/Nav`) affiche la photo si renseignée (peuplée par défaut par `useAuth`, profondeur REST par défaut), repli sur l'initiale de l'email sinon — comportement inchangé pour un utilisateur sans photo.
- **Sidebar sticky — tenté puis annulé** : `.admin-nav` passé en `position: sticky; top: 0; height: 100vh` avec défilement interne propre. A cassé toute la mise en page de l'admin en vrai ("tout le CSS est pété", tableau de bord invisible) — probablement `height: 100vh` en conflit avec la structure flex/hauteur du `Wrapper` de Payload autour du Nav (jamais vue en détail, pas de fichier `.scss` trouvé pour ce conteneur). Retiré immédiatement sur demande, retour à `height: 100%` (état d'avant, qui fonctionnait) plutôt qu'une nouvelle tentative à l'aveugle. Sticky sidebar reste à refaire un jour, en comprenant d'abord la structure DOM réelle autour de `.admin-nav` (inspection navigateur nécessaire, pas juste le code source).

Vérifié par `npx tsc --noEmit` (propre).

### 75. Bouton hamburger mobile masqué

"On n'a pas besoin du burger" — le bouton de repli mobile de Payload (`.template-default__nav-toggler-wrapper`, bascule sa nav par défaut) n'a pas d'équivalent utile avec une sidebar sur-mesure toujours visible (`admin/Nav`) : masqué (`display: none !important`, `global-overrides.scss`).

Vérifié par `npx tsc --noEmit` (propre).

### 76. Explication à droite de l'intitulé sur (quasiment) tous les champs du site

"Une indication d'aide derrière chaque intitulé de champ, en grisé, comme on a déjà fait à certains endroits — j'ai fait tester à des gens, c'est beaucoup plus clair." Étend le pattern de la décision 54 (`admin/LabelWithInfo`, "Titre – explication", déjà en place sur Titre/Slug/Menu/boutons d'en-tête) à la quasi-totalité des champs du site, plutôt qu'à une poignée.

- **`withInfo(field, info)`** (nouveau helper, `collections/Pages.ts`, exporté et réutilisé dans toutes les collections/globals) — fusionne `admin.components.Label` sur un champ sans écraser un `admin.condition`/`admin.description` déjà présent dessus. Évite de répéter le bloc `{admin:{components:{Label:{path,clientProps}}}}` des dizaines de fois.
- **`collections/Pages.ts` réécrit intégralement** (fichier le plus dense du projet, ~90 champs) : quasiment chaque champ des 9 gabarits a maintenant son explication — sauf 3 exceptions délibérées, pas des oublis :
  - `gabarit`/`liste.layoutType` : explication multi-options déjà longue, gardée **en dessous** du champ (`admin.description`), pas à droite — trop long pour une ligne, tranché ainsi en décision 46.
  - Champs `icone` (`iconField()`) : pas d'ajout — le sélecteur `admin/IconPickerField` a sa propre interface déjà explicite (liste + glyphes), et rend son `label` en interne sans passer par `admin/LabelWithInfo` (un ajout n'aurait aucun effet visible).
  - `contactFields` (adresse/téléphone/email/site web) : expliqué une seule fois à la source, propagé automatiquement partout où ce tableau est réutilisé (Annuaire, Contact, Accueil, Horaires, Pied de page).
- **Étendu aussi aux autres collections/globals** : `Categories`, `Users` (dont les nouveaux champs prénom/nom/photo), `Media`, `Pois` (notamment `latitude`/`longitude`, peu clairs sans aide), `Sentiers`, `Identite`, `Footer`. Laissés tels quels : `Icones`/`Documents`/`BoutonEntete` (déjà entièrement couverts par `admin.description` ou `withInfo` via un helper partagé, décision 52/55).

Vérifié par `npx tsc --noEmit` (propre) sur l'ensemble du projet après une réécriture complète de `collections/Pages.ts` — le fichier le plus à risque de casse silencieuse vu sa taille.

### 77. Alignement gauche de la sidebar — 2e passe

Après la décision 73 (padding en-tête/sous-en-tête aligné à 8px), le client signale que l'alignement n'est toujours pas bon. Deuxième écart trouvé : `.admin-nav__link` (les liens eux-mêmes — "Nouvelle page", "Catégories"...) avait `padding: 9px 12px`, soit 4px de plus que les en-têtes (8px) — corrigé à `9px 8px`.

Non vérifié par rendu réel (pas de nouvelle capture après ce correctif) — à confirmer par le client. Si le décalage persiste après ça, il faudra une capture d'écran précise pour repérer l'écart exact plutôt que de continuer à deviner valeur par valeur.

### 78. Alignement gauche de la sidebar — vraie cause trouvée par le client

Les décisions 73 et 77 corrigeaient des écarts de padding (10px→8px, 12px→8px) : plausibles, sans effet réel sur le problème signalé, puisque le client a de nouveau constaté "toujours pas bon". Le client a inspecté lui-même l'élément dans le navigateur et donné la cause exacte : `.admin-nav__group-header` et `.admin-nav__subgroup-header` sont des `<button>`, qui centrent leur texte par défaut dans ce contexte — pas un souci de padding. `text-align: left` ajouté sur les deux en-têtes, et par précaution sur `.admin-nav__group-label`/`.admin-nav__subgroup-label` (les `<span>` de libellé à l'intérieur, même risque). Leçon : deux passes de correctifs plausibles mais non vérifiés (padding) n'ont rien résolu — la bonne piste est venue de l'inspecteur du navigateur, pas d'une hypothèse de plus.

### 79. Listes répétables (array) : bouton "Ajouter" remonté, intitulé sans numéro, tri chronologique automatique

Trois retours groupés sur l'ergonomie des listes (Actualités, Agenda, Documents, Budget/Projet, Annuaire, etc.) :

- **Bouton "+ Ajouter" en bas de liste** : Payload le rend après toutes les lignes, donc en bas de page sur une longue liste (Actualités notamment) — il fallait tout scroller pour l'atteindre. `.array-field` étant déjà en `display: flex; flex-direction: column` côté Payload, un simple `order` (dans `admin/Nav/global-overrides.scss`, chargé globalement) suffit à le remonter juste sous le titre du champ, sans toucher au DOM ni à la logique d'ajout — la nouvelle ligne est toujours ajoutée en fin de liste, l'écran défile ensuite automatiquement jusqu'à elle (comportement Payload existant, `scrollToID`). S'applique à tous les champs `array` de l'admin, pas seulement Actualités.
- **Intitulé de ligne avec numéro ("Fiche Boulangerie Martin 01")** : le numéro d'ordre est retiré dans `admin/RowLabel/index.tsx` — n'affiche plus que le nom/titre de la ligne (`prefix` ne sert plus que de repli pour une ligne vide, juste ajoutée).
- **Ordre d'affichage pas lié à la date** : `itemsActualites`, `itemsAgenda`, `itemsDocument`, `itemsBudgetProjet` gardaient l'ordre de saisie/glisser-déposer. Vérifié dans `lib/payload.ts` : le site public affiche ces listes telles quelles, sans re-trier — donc l'ordre stocké dans Payload est aussi l'ordre public. Un hook `beforeChange` sur `collections/Pages.ts` trie désormais ces 4 listes par date décroissante à chaque enregistrement (les autres arrays, sans champ `date` — Annuaire, Démarches, Membres... — ne sont pas concernés).

### 80. Bouton "Ajouter" : à droite, plus visible, icône "+" blanche à trait 2px

Trois retours rapides sur le bouton remonté en décision 79 : aligné à droite (`align-self: flex-end`, plutôt que collé à gauche sous le titre où il se fondait dans le flux de lecture) ; fond terracotta + ombre portée renforcés (le client le trouvait trop pâle/peu visible) ; marge `12px 0` ajoutée pour l'aérer du titre au-dessus et des lignes en dessous. Bug trouvé au passage : l'icône "+" restait grise malgré `--btn-color: #fff` posé sur `.array-field__add-row.btn` — cette variable n'avait pas de `!important`, et pour une déclaration *normale* (pas `!important`), c'est la couche CSS déclarée en dernier qui gagne (`payload-default`, après notre `overrides-mairie`) — l'inverse de la règle pour les `!important` documentée en décision 46. `!important` ajouté sur `--btn-color`, plus `stroke-width: 2px` (icône) et `border-width: 2px` (cercle autour) sur demande.

### 81. Un second bouton "Ajouter" en haut de liste, en plus de celui du bas

La décision 79 déplaçait l'unique bouton natif de Payload en haut via `order` flex — mais le client voulait les deux : un en haut ET un en bas, pour ne jamais avoir à chercher selon l'endroit où on scrolle. Un `order` CSS ne peut pas dupliquer un élément interactif, donc retour en arrière sur ce point précis de la décision 79 (bloc `order` retiré de `global-overrides.scss`) au profit d'un vrai second bouton : `admin/ArrayAddRowBefore` (nouveau composant), posé en `admin.components.beforeInput` — le seul emplacement où Payload rend un composant personnalisé juste après le titre du champ `array`, avant les lignes (vérifié dans `@payloadcms/ui`, `fields/Array/index.js`). Réutilise `Button` et `useForm().addFieldRow` de `@payloadcms/ui` — les mêmes briques que le bouton natif — donc même rendu, mêmes classes CSS (`.array-field__add-row.btn`), donc même style automatiquement, sans dupliquer le moindre CSS. Appliqué via un nouveau helper `withAddRowTop` (dans `collections/Pages.ts`, à côté de `withInfo`) aux 8 listes qui avaient déjà un `RowLabel` sur-mesure (Annuaire, Démarches, Actualités, Documents, Budget/Projet, Agenda, Membres, Salles) — les listes les plus longues/les plus utilisées au quotidien ; les autres arrays (tarifs, notes, numéros utiles...) gardent le bouton natif seul. `importMap.js` régénéré (nouveau composant, piège déjà rencontré en décision 74).

### 82. Histoire et La commune — dernière exception non éditable, comblée

"Finis-moi absolument tous les imports de contribution manquants, fonce, je m'occupe des images." Audit : sur toutes les pages du site, seules Histoire et La commune n'appelaient encore aucune fonction `lib/payload.ts` — restées 100% en dur (Lorem ipsum pour Histoire, contenu réel non éditable pour La commune) depuis la décision 41, faute d'un schéma assez riche pour leur mise en page (bloc texte + triptyque d'images, section pleine largeur, 2 colonnes + chiffres clés) — le gabarit "editorial" n'avait alors que des blocs `texte`/`image` génériques.

Schéma `editorial` étendu (`collections/Pages.ts`) : `eyebrowText`/`sousTitre` (identité de page) + 2 blocs ajoutés à `sections` à côté de texte/image — `colonnes` (2 richText côte à côte) et `statistiques` (array de chiffres clés, avec `RowLabel`). Choix : rester sur le principe modulaire déjà en place (blocs réutilisables par toute future page Éditorial) plutôt qu'un schéma figé propre à ces 2 pages.

Rendu factorisé dans `shared/components/EditorialLayout/Sections.tsx` (nouveau) — un seul mappage bloc → JSX, réutilisé par la route générique (`[...slug]/page.tsx`, remplace le mappage inline qui y vivait) et par les 2 routes statiques. `features/histoire` et `features/commune` réécrits sur le même modèle que le reste du site (Server Component async, `getEditorialData(slug)` avec repli sur un `data.ts` — même contenu que l'ancien composant en dur, converti en richText Lexical via un petit constructeur partagé, `shared/lib/richText.ts`, formes vérifiées dans les `.d.ts` de `lexical`). Ancien SCSS sur-mesure (`features/histoire/style.scss`, `features/commune/style.scss`) supprimé, remplacé par des styles génériques ajoutés à `EditorialLayout/style.scss`.

Contenu réellement migré dans Payload (script temporaire, supprimé après usage, même logique que la décision 62) — **sauf les images** : les 3 photos de chaque page n'existaient qu'en fichiers statiques dans `/public`, pas en documents `Media` Payload (`relationTo: 'media'` refuse une URL brute, testé — `ValidationError` à la première tentative). Laissées de côté sciemment, à ajouter par le client via l'admin (bloc "Image" du champ `sections`) — comme convenu. Le repli statique (`data.ts`), lui, référence encore ces 3 fichiers directement (affichage correct même sans Payload) ; seule la version poussée en base les omet.

Vérifié par un serveur de dev éphémère (`curl` sur `/histoire`, `/vivre/la-commune` + quelques autres routes en non-régression) : 200 partout, contenu réel présent dans le HTML rendu — pas un rendu réel en navigateur, mais une confirmation que rien n'est cassé côté serveur avant de rendre la main.

Conséquence assumée : perte du gabarit sur-mesure de ces 2 pages (carte "overlap" mobile, triptyque d'images en grille, typographie "eyebrow" à deux niveaux) au profit du rendu générique déjà en place pour toute nouvelle page Éditorial — cohérent avec l'objectif du chantier (tout doit être éditable) plutôt qu'avec la fidélité visuelle à l'ancien design figé.

### 83. Audit complet + remplissage Contact, Horaires, Pied de page

"Y a-t-il quelque chose à remplir encore ?" — audit direct en base (script temporaire) plutôt qu'en se fiant à la mémoire des sessions précédentes : 26 points vérifiés (les 9 listes, l'accueil, la carte, Histoire/La commune, identité, bouton d'en-tête...). Tout était rempli sauf 3 vrais trous — Contact (aucune coordonnée), Horaires (aucun jour renseigné), Pied de page (ni téléphone ni email) — plus un point sans impact visuel (19 catégories de démarches/actualités/documents/budget/agenda sans icône, jamais affichée pour ces types de cartes — vérifié dans leurs Layout respectifs, `couleur` seule est utilisée).

"Toutes les données existent déjà" — exact : les 3 replis statiques (`features/contact/index.tsx`, `features/horaires/index.tsx`) contiennent le vrai contenu (téléphone, email, adresse, horaires, fermetures, 4 contacts pratiques) depuis le début, jamais poussé en base. Script temporaire (supprimé après usage) qui reprend ce contenu tel quel : `payload.update` sur les pages "contact"/"mairie/horaires", `payload.updateGlobal` sur "footer" (même téléphone/email que Contact, cohérent — `FOOTER_FALLBACK` dans `lib/payload.ts` n'a jamais eu de repli pour téléphone/email, contrairement à description/adresse/horaires qui s'affichaient déjà).

Bug annexe trouvé en résolvant les icônes des contacts pratiques par nom lucide (`icone: 'Flame'` pour Pompiers) : l'icône était bien liée mais portait le nom français "Mémoire" au lieu de "Flamme" — erreur de mapping de la décision 57 (renommage en français des 37 icônes). Corrigée au passage (`Icones` collection).

Vérifié par serveur de dev éphémère : `/contact`, `/mairie/horaires` et le pied de page (page d'accueil) affichent bien le nouveau contenu.

### 84. Blocs Éditorial refaits fidèles au design d'origine (rejet de la décision 82)

"Ça fait partie du template, il me faut le triptyque et la mise en page spéciale." La décision 82 (blocs génériques texte/image/colonnes/statistiques) est rejetée : la mise en page sur-mesure d'Histoire/La commune n'est pas un détail sacrifiable pour les rendre éditables, elle fait partie du produit vendu.

Reconstruite comme 3 blocs au choix dans la liste déroulante "Ajouter un bloc" (`collections/Pages.ts`), fidèles pixel-pour-pixel au design d'origine — récupéré via `git show HEAD:features/histoire/style.scss` avant que la décision 82 ne le supprime (heureusement encore dans le dernier commit, jamais poussé) :
- **Intro (triptyque + texte)** : carte de texte + 3 images (1 grande au-dessus, 2 carrées en dessous) ; `positionImages` (droite/gauche) rend les images inversables — demandé explicitement. Aide de champ précise sur le format attendu de chaque image (portrait ~4:5 pour la grande, carré pour les 2 petites) — le client avait demandé qu'on informe l'utilisateur du format photo à fournir.
- **Texte centré (évolution)** : section pleine largeur, fond teinté, texte centré max 800px.
- **Titre + 2 colonnes + tuiles** : en-tête + 2 colonnes de texte + jusqu'à 4 tuiles (`maxRows: 4`) en bas.

`shared/components/EditorialLayout/Sections.tsx` et `style.scss` réécrits pour ces 3 blocs (classes génériques `.editorial__*`, réutilisables par toute future page Éditorial, pas seulement ces 2). Contenu re-migré (script temporaire) dans les mêmes conditions qu'en décision 82 : images toujours exclues (fichiers `/public`, pas des documents `Media`), à ajouter par le client. Vérifié par serveur de dev éphémère : les classes et le contenu attendus sont bien dans le HTML rendu des 2 pages.

### 85. Champ "Nombre de filtres" retiré — jamais branché, jamais censé être un choix

Le client signale que ce champ (gabarit Liste) ne devrait pas exister comme choix éditeur : le nombre de filtres est fixe, déterminé par `layoutType` (chaque `XxxLayout` est déjà un composant spécifique). Vérifié avant de toucher au schéma : `nombreFiltres` n'était référencé nulle part en dehors de `collections/Pages.ts` — un champ mort, jamais lu par `lib/payload.ts` ni par aucun `XxxLayout`. Le nombre réel de filtres est déjà fixe et correct par composant : 1 filtre (catégorie) pour Annuaire/Démarches/Actualités/Agenda ; 2 pour Document (type + année, l'année étant calculée automatiquement à partir des dates, jamais un choix) ; Budget/Projet a son propre filtre fixe (Budget/Projet/Tous), sans catégorie du tout (décision 24). Champ supprimé — rien à migrer, il ne pilotait aucun rendu.

### 86-87. Éditorial : tuiles précisées optionnelles + 2 blocs supplémentaires (image pleine largeur, grille de 3 images)

Proposition initiale d'un 4ᵉ bloc "texte 2 colonnes sans encart" abandonnée : le bloc "Titre + 2 colonnes + tuiles" avait déjà les tuiles optionnelles (rien ne s'affiche si le tableau reste vide) — juste pas assez clair dans l'aide de champ. Corrigé (`collections/Pages.ts`) : "Optionnel — [...] laissez vide pour un texte à 2 colonnes simple."

2 nouveaux blocs ajoutés à la liste déroulante du gabarit Éditorial :
- **Image pleine largeur** : 2 champs image (`imageDesktop`, `imageMobile`), pas un simple recadrage CSS d'une seule photo comme partout ailleurs sur le site — vraie art direction, une image différente par écran (l'une masquée par CSS selon le breakpoint, `next/image` ne permettant pas de vrai `<picture>` propre avec des sources différentes).
- **Grille de 3 images** : 3 images portrait, espacées en flex sur desktop, empilées sur mobile.

`shared/components/EditorialLayout/Sections.tsx`/`style.scss` étendus en conséquence. Vérifié par serveur de dev éphémère (admin + `/histoire`, 200 des deux côtés) — pas de contenu réel à migrer, ce sont de nouveaux choix de blocs, pas des données existantes à convertir.

### 88. Bascule PostgreSQL (étape 1 du plan multi-tenant) — nouveau protocole de lancement des scripts

`mongooseAdapter` → `postgresAdapter` (`payload.config.ts`), `docker-compose.yml` ajouté (Postgres local + MinIO S3, décision 89). Vérifié en conditions réelles via `next dev` sur un port dédié : démarre, "Pulling schema from database..." (push Drizzle), `/admin` répond 200, toutes les tables attendues créées (`pages`, `pages_blocks_intro`, etc. — un array/block Payload = une table lié par clé étrangère, confirmé en base).

**Le protocole de script de la décision 58 (`nvm use 22 && node --env-file=.env node_modules/.bin/tsx <script>`) ne fonctionne plus** une fois `@payloadcms/db-postgres` installé — même sans l'utiliser dans un script donné, le simple fait d'importer `payload.config.ts` suffit à planter, `@payloadcms/db-postgres` importe (au niveau module, donc systématiquement) `createBlocksToJsonMigrator` depuis `@payloadcms/drizzle`, qui importe `payload/node`, qui réexporte `loadEnv` — dont le module lève une erreur (`Cannot destructure property 'loadEnvConfig' of 'import_env.default'`) parce que `@next/env` (CommonJS, sans export `default`) est mal interopéré une fois passé par la transformation CJS de `tsx`. Confirmé que ce n'est pas un problème de l'appli elle-même : `next dev`/`next build` s'en sortent très bien (Next gère `@next/env` nativement). Seuls les scripts Local API autonomes (seed, migration, importmap...) sont touchés — et `payload generate:importmap` (le vrai CLI) a son propre bug préexistant sur ce point (décision 74 : top-level await dans `@payloadcms/richtext-lexical` requis en CJS).

**Nouveau protocole, qui contourne les deux bugs à la fois** : Node 22 exécute du TypeScript nativement (`--experimental-strip-types`, actif par défaut) — en ESM pur, sans passer par la transformation CJS de `tsx`, les deux interops cassées ci-dessus fonctionnent correctement (vérifié). Seul manque réel : la résolution d'extension (Node ESM natif exige `./fichier.ts`, pas `./fichier`) — comblé par un petit loader dédié, `scripts/_resolve-ts.mjs` (résout `.ts`/`.tsx`/`.js`/`.jsx`/`.mjs`/`index.*` pour tout import relatif qui échoue en résolution native, sans toucher au reste du style d'import du projet).

```
nvm use 22
node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs <script>.ts
```

`scripts/gen-importmap.ts` re-testé avec ce protocole : régénère bien l'importMap (nouveau `S3ClientUploadHandler` de la décision 89 y apparaît). Ancien protocole (`node_modules/.bin/tsx`) obsolète à partir de maintenant pour ce projet — à utiliser uniquement si un script échoue avec le nouveau (peu probable, mais pas testé sur tous les cas d'usage existants).

### 89. Stockage S3 (étape 2 du plan multi-tenant)

`collections/Media.ts`/`Documents.ts` n'avaient aucun adaptateur de stockage — fichiers sur disque local, éphémère sur Scalingo (perdu à chaque déploiement), incompatible avec la contrainte "jamais sur disque" de la fiche de cadrage. `@payloadcms/storage-s3` installé et branché (`payload.config.ts`, collections `media`+`documents`), MinIO ajouté à `docker-compose.yml` pour développer/tester sans compte réel — mêmes variables d'environnement basculeront vers un vrai fournisseur (Scaleway, Cellar...) en prod, aucun changement de code.

Préfixe par commune (`slug-commune/media/...`) volontairement pas encore branché : dépend du champ `tenant`, qui n'existe pas avant l'étape 3 du plan. Pour l'instant, un seul bucket sans séparation — à corriger avant qu'une 2ᵉ commune existe (le plan le prévoit explicitement, pas un oubli).

### 90. Migration multi-tenant, étapes 3 à 9 — collection `tenants`, plugin, globals convertis, isolation, rôles

Suite de la décision 88/89. Plan complet dans `/Users/c.fournier/.claude/plans/cuddly-imagining-haven.md`. Chaque étape vérifiée en base réelle (`next dev` sur un port dédié) avant de passer à la suivante, pas seulement au typecheck.

- **Étape 3** — `collections/Tenants.ts` (nouveau) : collection pivot, une ligne par commune. `nom`/`domaine`/`insee`/`theme`/`palette`/`typographie`/`statutContrat` verrouillés super-admin ; `coordonnees`/`blason` ouverts à admin/éditeur de leur propre commune (tranché avec le client). Jamais de lecture publique — contrairement à `Pages`/`Media`, exposer `domaine`/`statutContrat` sans authentification serait une vraie fuite entre clients.
- **Étape 4** — `@payloadcms/plugin-multi-tenant` installé et branché. Champ `tenant` ajouté à `pages`/`categories`/`media`/`documents`/`pois`/`sentiers` (`icones` exclue, bibliothèque partagée). `Users.tenants` généré automatiquement (`tenantsArrayField.includeDefaultField: true` — pas besoin de la variante manuelle, les champs de `Users.ts` étaient déjà à plat). Vérifié en base : `pages.tenant_id` (FK vers `tenants`), table `users_tenants` créées comme attendu.
- **Étape 5** — `Identite`/`BoutonEntete`/`Footer` : `GlobalConfig` → `CollectionConfig` + `isGlobal: true` côté plugin (un `Global` Payload ne peut pas être multi-instance, il fallait cette conversion). Les 3 fonctions de `lib/payload.ts` et les 2 composants admin (`Dashboard`, `LoginLogo`) mis à jour. Bug réel corrigé au passage : `DEFAULT_NAV_LINKS`/`FOOTER_FALLBACK` étaient spécifiques à Saint-Hilaire-Bonneval — une commune B fraîchement onboardée, dont les documents identité/footer sont encore vides, aurait sinon montré l'adresse/le nom d'une autre commune à ses visiteurs. Repli neutralisé. `admin/LoginLogo` simplifié : plus de lecture d'`identite` du tout — l'écran de connexion (domaine admin partagé, décidé avec le client) n'a structurellement aucun tenant à deviner avant authentification.
- **Étape 6** — hook singleton (`Pages.beforeValidate`, gabarits Accueil/Horaires/Carte interactive) : ajoutait un filtre `tenant` à la requête `req.payload.find` — sans ça, dès que la commune A créait son Accueil, la commune B n'aurait plus jamais pu créer le sien (toute la collection interrogée, tenants confondus).
- **Étape 7** — `Pages.slug` : `unique: true` retiré du champ (créait un index unique sur toute la collection, pas par tenant — bug confirmé, issue `payloadcms/payload#14801`), remplacé par `indexes: [{ fields: ['tenant', 'slug'], unique: true }]` au niveau collection.
- **Étape 8** — la plus grosse : `shared/lib/tenant.ts` (nouveau), résolution du tenant par `host` (pas de `middleware.ts`/`rewrites()` — chaque commune a déjà son propre domaine, pas de segment d'URL partagé nécessaire), enveloppé dans `cache()` React pour dédupliquer sur une même requête. Les 19 fonctions pertinentes de `lib/payload.ts` (sur 22) résolvent le tenant courant et l'ajoutent à leur `where` — via un petit helper `requireTenant()` qui lève une erreur si non résolu, réutilisant le `try/catch` déjà existant partout (aucun nouveau chemin d'erreur, juste jamais de requête non scopée en repli). **Aucune modification des 17 fichiers de route statiques ni des `features/*`** — tout le diff tient dans `lib/payload.ts`. Vérifié en conditions réelles : tenant de test créé (`domaine: 'localhost'`), une page "contact" à lui ; `/contact` affiche bien son contenu ; la même URL avec un `Host` différent (domaine non mappé) ne montre rien de ce tenant — isolation confirmée de bout en bout, pas juste en théorie.
- **Étape 9** — `collections/Users.ts` : les 2 fonctions d'accès faites main (`create`/`update`) gagnent un filtre de tenant (un admin ne peut créer/modifier que des comptes de sa propre commune, plus seulement "que des éditeurs"). `read`/`delete` deviennent des fonctions qui renvoient un `Where` scopé (`getTenantAccess`, utilitaire du plugin) au lieu de simples booléens — sans ça, un admin de la commune A aurait encore pu *lister* les utilisateurs de la commune B, juste pas les modifier. `access.ts` : commentaire d'en-tête corrigé (affirmait l'hypothèse inverse, "chaque déploiement a ses propres comptes").

Restent : étape 10 (suite de tests d'isolation) et étape 11 (bascule des données réelles Mongo → Postgres).

### 91. Migration multi-tenant, étapes 10 et 11 — suite de tests d'isolation, bascule des données réelles

Suite et fin de la décision 90. Plan complet dans `/Users/c.fournier/.claude/plans/cuddly-imagining-haven.md`, les 11 étapes sont maintenant faites.

**Étape 10 — suite de tests d'isolation.** Aucun framework de test n'existait dans ce repo — Vitest introduit (`vitest.config.ts`, `fileParallelism: false` : deux fichiers de test appelant chacun `getPayload({config})` en parallèle se marchaient dessus sur le `push` de schéma Drizzle, conflit DDL transitoire, sans lien avec la logique testée). Contrairement aux scripts habituels, Vitest n'a pas besoin du protocole de la décision 88 (`--experimental-loader`) : son propre pipeline de transformation n'a pas le bug d'interop `@next/env`. `tests/tenant-isolation/` : `_seed.ts` (2 tenants de test, un document distinctif par collection, 2 utilisateurs `editeur`), `access.test.ts` (couche d'accès Payload réelle — liste/lecture/écriture croisées entre tenants, sur `pages` et `users`), `lib-payload.test.ts` (le point le plus important : `Pages`/`Media`/etc. ont un accès public `read: () => true`, donc la garantie d'isolation du site public ne repose sur AUCUN filtrage automatique du plugin, entièrement sur le fait que chaque fonction de `lib/payload.ts` ajoute son filtre `tenant` — testé en appelant les vraies fonctions, `getCurrentTenant` mocké via `vi.mock`). 9 tests, tous verts. Script `npm run test:isolation`.

**Étape 11 — bascule des données réelles.** `scripts/migrate-mongo-to-postgres.ts` (temporaire, à garder tant qu'utile puis supprimer) : lecture seule côté Mongo (driver `mongodb` brut — évite tout conflit avec le nouveau schéma Payload), écriture via l'API locale Payload côté Postgres. Un remappeur générique de relations (`remapFields`/`remapFieldValue`), piloté par la config réelle des champs Payload (`payload.collections.pages.config.fields`) plutôt que par une liste de chemins écrite à la main — gère n'importe quelle profondeur (group/array/blocks) sans connaître chaque champ de relation un par un (il y en a des dizaines, éparpillées dans les 9 gabarits).

Dépendance découverte en le construisant : `Categories.page` est un champ requis pointant vers `Pages`, et `Pages.liste.itemsAnnuaire[].categorie` (requis aussi) pointe vers `Categories` — pas une vraie circularité si on migre dans le bon ordre (pages en squelette d'abord, puis catégories avec leur `page` déjà résolu, puis le contenu complet des pages une fois les catégories prêtes), mais ça n'a marché qu'après avoir compris précisément dans quel sens la dépendance obligatoire allait. Une fonction `skeletonizeFields` dédiée (vide les `array`/`blocks`, laisse les champs simples pour que les champs requis conditionnels comme `liste.layoutType` passent la validation) sert cette création initiale.

Deux bugs réels trouvés et corrigés en le faisant tourner pour de vrai (pas en le relisant) :
- Un `ObjectId` du driver `mongodb` a une propriété interne `id` (les octets bruts) — le remappeur cherchait `'id' in valeur` avant `String(valeur)`, matchait dessus, et produisait un ID illisible au lieu du hex correct. Toutes les relations ressortaient `null`. Corrigé en testant `instanceof ObjectId` en premier.
- Le rapprochement "déjà migré ?" des médias comparait par nom de fichier — mais Payload/le plugin S3 renomment le fichier ("-1", "-2"...) en cas de collision avec un objet déjà dans le bucket, donc le nom stocké en base ne correspond plus jamais au nom d'origine après la première collision. 7 copies des mêmes 5 fichiers créées en autant de relances pendant la mise au point. Corrigé (comparaison par `alt`, stable), doublons nettoyés (30 lignes + objets MinIO orphelins supprimés, aucun n'était référencé nulle part — vérifié avant suppression).

Vérifié en conditions réelles, pas seulement par le typecheck : le contenu vivant de Saint-Hilaire-Bonneval s'affiche sur le domaine `saint-hilaire-bonneval.fr` (18 pages, 40 catégories, 37 icônes, 5 médias réellement uploadés vers MinIO/S3 — pas juste leurs métadonnées), un domaine différent ne voit rien de ce contenu, et le script rejoué une seconde fois ne crée plus aucun doublon (idempotence confirmée, pas supposée). Les 2 comptes utilisateurs sont migrés avec un mot de passe temporaire (`ChangeMoiApresMigration!2026`) — le hash/sel de l'ancienne base n'a pas été recopié, seulement 2 comptes internes à l'équipe, pas des identifiants de clients réels.

## Catalogue des gabarits (état actuel)

| Gabarit | Type | Pages actuelles | Notes |
|---|---|---|---|
| **Liste** | Multi-instances | Commerces, Vie associative, Enfance & jeunesse, Sports & loisirs, Mes démarches, Actualités, Documents & publications, Budget & projets, Agenda | Hero + filtre(s) + collection + CTA optionnel ; varie par `carte` (voir ci-dessus) |
| **Éditorial** | Multi-instances | Histoire, La commune | Hero + suite de sections modulaires (texte, image, 2 colonnes, chiffres clés) |
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
11. ~~Brancher les composants React existants sur Payload~~ — fait, décision 33 (Header + 4 pages Annuaire) puis étendu à tout le reste en décisions 37 à 40 (les 12 gabarits/cartes). Éditorial (Histoire/La commune) : branché dans la route générique dès décision 41, mais les 2 pages statiques existantes restaient en dur (Lorem ipsum pour Histoire) — dernière exception, comblée en décision 82 (`getEditorialData`, schéma enrichi, contenu migré)
12. ~~Menu dynamique~~ — fait (décision 33). ~~Relations résolues au rendu~~ (`resolvePageHref`, décision 14) — fait, consommée par la plupart des fonctions `lib/payload.ts` (liens de documents, boutons Hero, cartes Découvrir, etc.)

**Phase 5 — Routage dynamique** (identifiée en discutant)
13. ~~Extraire les 12 gabarits/cartes restants en composants réutilisables~~ — fait (décisions 37, 38, 39, 40)
14. ~~Route générique `app/[...slug]/page.tsx`~~ — fait, décision 41 (sert les pages sans route statique dédiée ; les 17 routes existantes restent inchangées, Next.js les priorise automatiquement)
15. ~~Corriger le `slug: '/'` de l'Accueil dans `scripts/seed.ts`~~ — fait en début de cette session (slug devenu `'accueil'`, `menu` manquant ajouté au passage)

Phase 1 conditionne tout le reste — c'est par elle qu'on continue.

## Idées non actées

- **Slideshow à la place du bloc "Mot du maire"** : plusieurs slides (image + texte + valeur/chiffre en encart), pouvant porter le mot du maire mais aussi d'autres contenus mis en avant (événement, projet...). Navigation manuelle uniquement (pas d'auto-rotation, pour rester conforme RGAA 13.3). Réserve posée : si un slide sert à mettre en avant un événement, ça recouperait la bande agenda déjà intégrée à QuickAccess (décision 17) — à trancher si l'idée est reprise. Pas décidé, proposé comme option possible pour le client.
