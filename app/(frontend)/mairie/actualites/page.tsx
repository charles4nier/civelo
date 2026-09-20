import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierActualitesPage from '@themes/atelier/features/actualites';
import PreauActualitesPage from '@themes/preau/features/actualites';
import BelvedereActualitesPage from '@themes/belvedere/features/actualites';
import ClocherActualitesPage from '@themes/clocher/features/actualites';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Actualités',
	description:
		'Toutes les actualités de Saint-Martin : comptes-rendus du conseil municipal, vie locale, travaux et événements.',
	path: '/mairie/actualites'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierActualitesPage, preau: PreauActualitesPage, belvedere: BelvedereActualitesPage, clocher: ClocherActualitesPage });
	return <Component />;
}
