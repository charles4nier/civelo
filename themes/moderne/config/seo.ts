import { commune } from './commune';

export const defaultMetadata = {
	metadataBase: new URL(commune.siteUrl),
	title: {
		default: commune.nom,
		template: `%s | ${commune.nom}`
	},
	description: `Site officiel de la commune de ${commune.nom} (${commune.codePostal}) : démarches, actualités, tourisme, vie locale et patrimoine au cœur du ${commune.region}.`,
	keywords: [
		commune.nom,
		`commune ${commune.departement}`,
		`mairie ${commune.nom}`,
		commune.region,
		commune.codePostal,
		'démarches administratives',
		'tourisme',
		'vie locale',
		'conseil municipal',
	],
	authors: [{ name: commune.nom }],
	formatDetection: { email: false, address: false, telephone: false },
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		locale: 'fr_FR',
		url: commune.siteUrl,
		title: commune.nom,
		siteName: commune.nom,
		images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: commune.nom }]
	},
	robots: { index: true, follow: true }
};

export function generatePageMetadata({
	title,
	description,
	path = ''
}: {
	title: string;
	description: string;
	path?: string;
}) {
	const fullTitle = `${title} | ${commune.nom}`;
	const url = `${commune.siteUrl}${path}`;
	return {
		title: { absolute: fullTitle },
		description,
		alternates: { canonical: url },
		openGraph: {
			title: fullTitle,
			description,
			url,
			images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }]
		}
	};
}
