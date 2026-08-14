import sharp from 'sharp';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { buildConfig } from 'payload';
import { en } from '@payloadcms/translations/languages/en';
import { fr } from '@payloadcms/translations/languages/fr';
import { Users } from './collections/Users';
import { Pages } from './collections/Pages';
import { Categories } from './collections/Categories';
import { Telephones } from './collections/Telephones';
import { Emails } from './collections/Emails';
import { Media } from './collections/Media';
import { DocumentsCollection } from './collections/Documents';
import { Pois } from './collections/Pois';
import { Sentiers } from './collections/Sentiers';
import { Actualites } from './collections/Actualites';

export default buildConfig({
	admin: {
		user: Users.slug
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
		Telephones,
		Emails,
		Media,
		DocumentsCollection,
		Pois,
		Sentiers,
		Actualites
	],
	secret: process.env.PAYLOAD_SECRET || '',
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || ''
	}),
	sharp,
	typescript: {
		outputFile: 'types/payload-types.ts'
	}
});
