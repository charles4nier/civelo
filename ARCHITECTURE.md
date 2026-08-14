# Architecture — saint-hilaire-demo

## Stack technique

| Couche | Outil |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styles | SCSS + convention BEM stricte |
| Carte interactive | Leaflet + react-leaflet + react-leaflet-cluster |
| Icônes | lucide-react |
| Hébergement | Vercel (gratuit) |
| CMS | *(à intégrer — Sanity prévu)* |

**Polices** : Fraunces (display) · Inter (body) · Caveat (script) — via `next/font/google`

**Palette OKLCH** : primary (bleu) · coral · sunshine · leaf · terracotta · sky · berry

---

## Structure des fichiers

```
saint-hilaire-demo/
│
├── app/                          → Routes Next.js App Router
│   ├── layout.tsx                → Layout global (Header + Footer)
│   ├── page.tsx                  → Home
│   ├── histoire/page.tsx
│   ├── commerces/page.tsx
│   ├── demarches/page.tsx
│   ├── location-salle/page.tsx
│   ├── numeros-utiles/page.tsx
│   ├── mairie/
│   │   ├── actualites/page.tsx
│   │   ├── maire-elus/page.tsx
│   │   ├── conseil-municipal/page.tsx
│   │   ├── comptes-rendus/page.tsx
│   │   ├── services-municipaux/page.tsx
│   │   ├── urbanisme/page.tsx
│   │   ├── publications/page.tsx
│   │   ├── horaires/page.tsx
│   │   └── budget-projets/page.tsx
│   ├── vivre/
│   │   ├── la-commune/page.tsx
│   │   ├── enfance-jeunesse/page.tsx
│   │   ├── vie-associative/page.tsx
│   │   ├── cadre-de-vie/page.tsx
│   │   └── sports-loisirs/page.tsx
│   └── tourisme/
│       └── carte-interactive/page.tsx
│
├── features/                     → Logique et UI par page
│   ├── home/                     → Hero · CTA · Discover · QuickAccess · MayorWord · News
│   ├── histoire/
│   ├── commerces/
│   ├── actualites/
│   ├── elus/
│   ├── documents/
│   ├── demarches/
│   ├── location-salle/
│   ├── numeros-utiles/
│   ├── commune/
│   └── carte/                    → MapClient.tsx · data.ts
│
├── shared/
│   ├── components/
│   │   ├── Header/               → Nav desktop (dropdown CSS) + mobile (accordéon)
│   │   ├── Footer/
│   │   ├── ComingSoon/           → Composant réutilisable pages en construction
│   │   └── FloatingButtons/      → Boutons flottants (bot assistant coral)
│   ├── styles/
│   │   ├── variables.scss        → Toutes les variables SCSS
│   │   └── index.scss            → Reset + utilitaires globaux
│   └── config/
│       └── seo.ts                → generatePageMetadata()
│
├── public/                       → Images statiques
│   ├── saint-hilaire-bonneval-hero.jpg
│   ├── saint-hilaire-bonneval-forest.jpg
│   ├── saint-hilaire-bonneval-lake.jpg
│   ├── saint-hilaire-bonneval-village.jpg
│   └── saint-hilaire-bonneval-logo.png
│
└── types/
    └── scss.d.ts
```

---

## Pages

### Effectives (contenu réel)

| Route | Feature | Contenu |
|---|---|---|
| `/` | `features/home` | Hero, actualités, mot du maire, accès rapides |
| `/histoire` | `features/histoire` | Histoire de la commune |
| `/commerces` | `features/commerces` | Annuaire 21 entrées, filtres par catégorie |
| `/tourisme/carte-interactive` | `features/carte` | Leaflet + POI JSON, filtres par catégorie |

### Coming Soon (ComingSoon component)

`/demarches` · `/location-salle` · `/numeros-utiles` · `/mairie/*` · `/vivre/*`

---

## Navigation (Header)

| Item | Sous-pages |
|---|---|
| Votre mairie | Maire & élus · Conseil municipal · Comptes-rendus · Services · Urbanisme · Publications · Horaires · Budget |
| Vivre à [Commune] | Commerces · Enfance · Vie associative · Cadre de vie · Sports |
| Tourisme & découvertes | Histoire · Carte interactive |
| Mes démarches | ancre `/#demarches` |
| Contact | ancre `/#contact` |

- Logo → `/`
- CTA header → **Location de salle**
- Desktop : dropdown CSS pur (pas de JS)
- Mobile : accordéon

---

## Carte interactive

- **Lib** : Leaflet + react-leaflet (open-source, tuiles OpenStreetMap)
- **Données** : `features/carte/data.ts` — POI typés (nom, coords, catégorie, description)
- **Catégories** : `nature` · `randonnee` · `patrimoine`
- **Query params** : `?category=` pour le filtre · `?id=` pour ouvrir une popup
- Les cards Discover de la home pointent vers la carte avec le bon filtre

---

## Conventions

- Chaque feature : `index.tsx` + `style.scss` (BEM)
- Chaque page `app/X/page.tsx` importe uniquement depuis `features/X`
- Header et Footer dans `layout.tsx`, jamais dans les pages
- Variables SCSS centralisées dans `shared/styles/variables.scss`
