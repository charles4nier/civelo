import path from 'path';
import { fileURLToPath } from 'url';
import { withPayload } from '@payloadcms/next/withPayload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Désactivé — l'admin Payload déclenche une erreur DOM ("insertBefore")
	// en dev à cause du double-rendu de StrictMode, absente en prod. Effet
	// de bord d'un composant tiers, pas du code du projet — voir PAYLOAD-CMS.md.
	reactStrictMode: false,
	// Next.js détectait la racine du projet comme le dossier home
	// (`/Users/c.fournier/package-lock.json`, un lockfile parasite hors de ce
	// projet — warning "Found multiple lockfiles" présent depuis le début de
	// la session) plutôt que `style-edito`. Fixé explicitement pour écarter
	// tout mélange de cache/fichiers entre projets.
	outputFileTracingRoot: __dirname,
	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
	},
	// Injection auto d'un seul jeu de variables SCSS, valable tant qu'un
	// seul thème (style-edito) existe. À revoir dès l'arrivée d'un 2e thème :
	// des variables.scss différents par thème avec les mêmes noms mais des
	// valeurs différentes rendront ce mécanisme global ambigu — il faudra
	// alors passer à des imports relatifs explicites par thème.
	sassOptions: {
		includePaths: [path.join(__dirname, 'themes/style-edito/styles')],
		prependData: `@import "variables.scss";`
	},
	compress: true,
	eslint: {
		ignoreDuringBuilds: true
	},
	typescript: {
		ignoreBuildErrors: true
	},
	poweredByHeader: false,
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@shared': path.join(__dirname, 'shared'),
			'@themes': path.join(__dirname, 'themes'),
			'@lib': path.join(__dirname, 'lib'),
			'@types': path.join(__dirname, 'types')
		};
		return config;
	}
};

export default withPayload(nextConfig);
