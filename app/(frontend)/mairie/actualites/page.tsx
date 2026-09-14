import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoActualitesPage from '@themes/edito/features/actualites';
import ModerneActualitesPage from '@themes/moderne/features/actualites';
import AccueillantActualitesPage from '@themes/accueillant/features/actualites';
import ClassiqueActualitesPage from '@themes/classique/features/actualites';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Actualités',
	description:
		'Toutes les actualités de Saint-Hilaire-Bonneval : comptes-rendus du conseil municipal, vie locale, travaux et événements.',
	path: '/mairie/actualites'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoActualitesPage, moderne: ModerneActualitesPage, accueillant: AccueillantActualitesPage, classique: ClassiqueActualitesPage });
	return <Component />;
}
