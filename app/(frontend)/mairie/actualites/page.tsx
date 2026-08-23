import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import ActualitesPage from '@themes/style-edito/features/actualites';

export const metadata: Metadata = generatePageMetadata({
	title: 'Actualités',
	description:
		'Toutes les actualités de Saint-Hilaire-Bonneval : comptes-rendus du conseil municipal, vie locale, travaux et événements.',
	path: '/mairie/actualites',
});

export default function Page() {
	return <ActualitesPage />;
}
