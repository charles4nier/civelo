import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoCommercesPage from '@themes/edito/features/commerces';
import AppCommercesPage from '@themes/app/features/commerces';
import AccueillantCommercesPage from '@themes/accueillant/features/commerces';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Services & vie pratique',
	description:
		'Découvrez les commerces, artisans et entreprises de Saint-Hilaire-Bonneval : alimentation, restauration, santé, beauté, garages et savoir-faire locaux.',
	path: '/commerces'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoCommercesPage, app: AppCommercesPage, accueillant: AccueillantCommercesPage });
	return <Component />;
}
