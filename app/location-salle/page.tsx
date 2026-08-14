import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import LocationSallePage from '@features/location-salle';

export const metadata: Metadata = generatePageMetadata({
	title: 'Location de salles',
	description:
		'Tarifs et conditions de location de la salle polyvalente et de la salle du restaurant scolaire à Saint-Hilaire-Bonneval.',
	path: '/location-salle',
});

export default function Page() {
	return <LocationSallePage />;
}
