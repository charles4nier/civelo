export const siteConfig = {
	name: 'Mairie de Saint-Hilaire-Bonneval',
	description:
		'Site officiel de la commune de Saint-Hilaire-Bonneval (87) : démarches, actualités, tourisme, vie locale et patrimoine au cœur du Limousin.',
	url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saint-hilaire-bonneval.fr',
	ogImage: '/og-image.jpg',
	keywords: [
		'Saint-Hilaire-Bonneval',
		'commune Haute-Vienne',
		'mairie Saint-Hilaire-Bonneval',
		'Limousin',
		'87260',
		'démarches administratives',
		'tourisme Haute-Vienne',
		'patrimoine Limousin',
		'vie locale',
		'conseil municipal'
	]
};

export const defaultMetadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.name,
		template: `${siteConfig.name} | %s`
	},
	description: siteConfig.description,
	keywords: siteConfig.keywords,
	authors: [{ name: siteConfig.name }],
	creator: siteConfig.name,
	publisher: siteConfig.name,
	formatDetection: {
		email: false,
		address: false,
		telephone: false
	},
	alternates: {
		canonical: '/'
	},
	openGraph: {
		type: 'website',
		locale: 'fr_FR',
		url: siteConfig.url,
		title: siteConfig.name,
		description: siteConfig.description,
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name
			}
		]
	},
	robots: {
		index: true,
		follow: true
	}
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
	const fullTitle = `${siteConfig.name} | ${title}`;
	const url = `${siteConfig.url}${path}`;

	return {
		title: { absolute: fullTitle },
		description,
		alternates: { canonical: url },
		openGraph: {
			title: fullTitle,
			description,
			url,
			images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: title }]
		}
	};
}
