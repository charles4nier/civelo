import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
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
import { Identite } from './globals/Identite';
import { BoutonEntete } from './globals/BoutonEntete';
import { Footer } from './globals/Footer';

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
		Sentiers
	],
	globals: [Identite, BoutonEntete, Footer],
	secret: process.env.PAYLOAD_SECRET || '',
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || ''
	}),
	sharp,
	typescript: {
		outputFile: 'types/payload-types.ts'
	}
});
