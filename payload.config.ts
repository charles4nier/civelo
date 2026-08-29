import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/storage-s3';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { buildConfig } from 'payload';
import { en } from '@payloadcms/translations/languages/en';
import { fr } from '@payloadcms/translations/languages/fr';
import { Users } from './collections/Users';
import { Pages } from './collections/Pages';
import { Categories } from './collections/Categories';
import { Icones } from './collections/Icones';
import { Media } from './collections/Media';
import { DocumentsCollection } from './collections/Documents';
import { Pois } from './collections/Pois';
import { Sentiers } from './collections/Sentiers';
import { Tenants } from './collections/Tenants';
import { Identite } from './globals/Identite';
import { BoutonEntete } from './globals/BoutonEntete';
import { Footer } from './globals/Footer';

// Mode mono-tenant — activé par `SINGLE_TENANT_SLUG`, pour générer une
// archive autonome d'une seule commune (voir `scripts/export-tenant.ts`).
// Le plugin reste chargé À L'IDENTIQUE dans les deux modes (mêmes
// collections, même champ `tenant`, même collection `tenants`) — SEUL le
// comportement change (plus de sélecteur, plus de filtrage, accès non
// contraint). Schéma de base garanti identique par construction : rien
// n'est structurellement retiré/ajouté selon ce mode, seuls des booléens de
// comportement (`useBaseFilter`/`useTenantAccess`) et le champ `admin` du
// champ tenant (masqué, pas supprimé) changent.
const singleTenantSlug = process.env.SINGLE_TENANT_SLUG;
const isMonoTenant = Boolean(singleTenantSlug);

const tenantScopedCollection = (extra: Record<string, unknown> = {}) => ({
	...extra,
	useBaseFilter: !isMonoTenant,
	useTenantAccess: !isMonoTenant
});

export default buildConfig({
	admin: {
		user: Users.slug,
		// Décision 43 — sidebar sur-mesure, remplace le nav par défaut de Payload.
		components: {
			Nav: '/admin/Nav',
			// Décision 68 — logo Payload par défaut remplacé sur l'écran de
			// connexion par l'identité du site. Décision 74 — même logique pour
			// l'icône du fil d'ariane (premier maillon, lien vers le tableau de
			// bord) : "Mon tableau de bord" en texte plutôt que le logo Payload.
			graphics: {
				Logo: '/admin/LoginLogo',
				Icon: '/admin/BreadcrumbHome'
			},
			// Décision 69 — tableau de bord par défaut (grille de collections)
			// remplacé par une page d'accueil qui salue l'utilisateur connecté.
			//
			// 2026-08-28 — pas de route dédiée pour "Mes sites" : ce même
			// composant `Dashboard` bascule vers la grille de communes quand
			// l'utilisateur est un super-admin sur la console dédiée (voir
			// `admin/Dashboard/index.tsx`), sinon le "Bonjour" habituel.
			views: {
				dashboard: {
					Component: '/admin/Dashboard'
				}
			}
		}
	},
	i18n: {
		supportedLanguages: { en, fr },
		fallbackLanguage: 'fr'
	},
	editor: lexicalEditor(),
	collections: [
		Users,
		Pages,
		Categories,
		Icones,
		Media,
		DocumentsCollection,
		Pois,
		Sentiers,
		Tenants,
		// Étape 5 du plan multi-tenant — Identite/BoutonEntete/Footer
		// n'étaient pas des vrais "globals" au sens Payload compatibles avec
		// le multi-tenant (une seule ligne possible pour toute l'appli).
		// Convertis en collections classiques, `isGlobal: true` côté plugin
		// leur redonne le comportement "un seul document" — mais un par
		// tenant.
		Identite,
		BoutonEntete,
		Footer
	],
	secret: process.env.PAYLOAD_SECRET || '',
	// Étape 1 du plan multi-tenant — MongoDB → PostgreSQL (Postgres géré
	// requis par le client pour l'architecture multi-tenant cible ; pas de
	// nécessité d'administration système, cf. fiche de cadrage).
	db: postgresAdapter({
		pool: {
			// `DATABASE_URI` en local (voir .env) ; Scalingo injecte automatiquement
			// `DATABASE_URL` pour son addon PostgreSQL — accepter les deux évite de
			// dupliquer la valeur à la main (qui deviendrait obsolète si Scalingo
			// la fait tourner, ex. après un changement de plan).
			connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || ''
		}
	}),
	// Étape 2 du plan multi-tenant — les fichiers uploadés (Media,
	// Documents) n'avaient aucun adaptateur de stockage jusqu'ici : ils
	// atterrissaient sur le disque local du conteneur, éphémère sur
	// Scalingo (perdu à chaque déploiement). En local, pointe vers le
	// MinIO du docker-compose ; en prod, mêmes variables d'env vers un
	// vrai fournisseur S3-compatible (Scaleway, Cellar...), aucun
	// changement de code.
	//
	// Préfixe par commune (`slug-commune/media/...`) pas encore branché
	// ici : dépend du champ `tenant`, ajouté à l'étape suivante. Pour
	// l'instant, tous les fichiers vont dans un seul bucket sans
	// séparation par tenant — à corriger avant qu'une 2ᵉ commune existe.
	plugins: [
		// En mode mono-tenant (archive livrable), pas de S3 : le repreneur
		// n'a ni compte ni identifiants sur notre bucket. Sans ce plugin,
		// Media/Documents retombent sur le stockage disque local par défaut
		// de Payload — exactement le dossier `medias/` monté en volume dans
		// le `docker-compose.yml` de l'archive. N'affecte pas le schéma :
		// l'adaptateur de stockage ne change où vivent les octets, jamais les
		// colonnes (filename/mimeType/url... existent quel que soit
		// l'adaptateur) — reconfirmé par le test d'égalité de schéma.
		...(isMonoTenant ? [] : [s3Storage({
			collections: {
				media: true,
				documents: true
			},
			bucket: process.env.S3_BUCKET || '',
			config: {
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
				},
				region: process.env.S3_REGION || 'us-east-1',
				endpoint: process.env.S3_ENDPOINT,
				forcePathStyle: true
			}
		})]),
		// Étape 4 du plan multi-tenant — plugin officiel, ajoute le champ
		// `tenant` aux 6 collections listées ci-dessous et le tableau
		// `tenants` sur Users (`tenantsArrayField`, généré automatiquement via
		// `includeDefaultField: true` — les champs de `Users.ts` sont déjà à
		// plat, pas besoin de la variante manuelle pour le placement).
		//
		// `icones` volontairement exclue : bibliothèque de noms lucide-react
		// partagée à l'identique par toutes les communes, curatée une fois par
		// super-admin — la scoper par tenant dupliquerait ~40 lignes
		// identiques par commune sans bénéfice d'isolation, pour une donnée
		// qui n'a rien de sensible.
		multiTenantPlugin({
			collections: {
				pages: tenantScopedCollection(),
				categories: tenantScopedCollection(),
				media: tenantScopedCollection(),
				documents: tenantScopedCollection(),
				pois: tenantScopedCollection(),
				sentiers: tenantScopedCollection(),
				identite: tenantScopedCollection({ isGlobal: true }),
				'bouton-entete': tenantScopedCollection({ isGlobal: true }),
				footer: tenantScopedCollection({ isGlobal: true })
			},
			tenantsSlug: Tenants.slug,
			// super-admin = transversal (l'équipe) ; admin/éditeur restent
			// scopés à leur(s) tenant(s) via `Users.tenants`. En mode
			// mono-tenant, tout le monde a accès à l'unique tenant existant —
			// il n'y a rien d'autre à cloisonner.
			userHasAccessToAllTenants: isMonoTenant ? () => true : (user) => user?.role === 'super-admin',
			tenantsArrayField: {
				includeDefaultField: true
			},
			// Sélecteur/filtres de la collection `tenants` elle-même et de
			// `users` — sans objet à un seul tenant, juste du bruit dans
			// l'admin de l'archive exportée.
			useTenantsCollectionAccess: !isMonoTenant,
			useTenantsListFilter: !isMonoTenant,
			useUsersTenantFilter: !isMonoTenant,
			// Masque le champ (jamais choisi à la main dans l'archive), sans le
			// retirer du schéma — `hidden` reste un champ admin, pas structurel.
			tenantField: isMonoTenant ? { admin: { hidden: true } } : undefined
		})
	],
	sharp,
	typescript: {
		outputFile: 'types/payload-types.ts'
	}
});
