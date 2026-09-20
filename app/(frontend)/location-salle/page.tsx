import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierLocationSallePage from '@themes/atelier/features/location-salle';
import PreauLocationSallePage from '@themes/preau/features/location-salle';
import BelvedereLocationSallePage from '@themes/belvedere/features/location-salle';
import ClocherLocationSallePage from '@themes/clocher/features/location-salle';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Location de salles',
	description:
		'Tarifs et conditions de location de la salle polyvalente et de la salle du restaurant scolaire à Saint-Martin.',
	path: '/location-salle'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierLocationSallePage, preau: PreauLocationSallePage, belvedere: BelvedereLocationSallePage, clocher: ClocherLocationSallePage });
	return <Component />;
}
