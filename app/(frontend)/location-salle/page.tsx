import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoLocationSallePage from '@themes/edito/features/location-salle';
import ModerneLocationSallePage from '@themes/moderne/features/location-salle';
import AccueillantLocationSallePage from '@themes/accueillant/features/location-salle';
import ClassiqueLocationSallePage from '@themes/classique/features/location-salle';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Location de salles',
	description:
		'Tarifs et conditions de location de la salle polyvalente et de la salle du restaurant scolaire à Saint-Hilaire-Bonneval.',
	path: '/location-salle'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoLocationSallePage, moderne: ModerneLocationSallePage, accueillant: AccueillantLocationSallePage, classique: ClassiqueLocationSallePage });
	return <Component />;
}
