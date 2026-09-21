import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierCommercesPage from '@themes/atelier/features/commerces';
import PreauCommercesPage from '@themes/preau/features/commerces';
import BelvedereCommercesPage from '@themes/belvedere/features/commerces';
import ClocherCommercesPage from '@themes/clocher/features/commerces';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Commerces, artisans & santé',
	description:
		'Découvrez les commerces, artisans et entreprises de Saint-Martin : alimentation, restauration, santé, beauté, garages et savoir-faire locaux.',
	path: '/commerces'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierCommercesPage, preau: PreauCommercesPage, belvedere: BelvedereCommercesPage, clocher: ClocherCommercesPage });
	return <Component />;
}
