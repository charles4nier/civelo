import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import CommercesPage from '@themes/style-edito/features/commerces';

export const metadata: Metadata = generatePageMetadata({
	title: 'Services & vie pratique',
	description:
		'Découvrez les commerces, artisans et entreprises de Saint-Hilaire-Bonneval : alimentation, restauration, santé, beauté, garages et savoir-faire locaux.',
	path: '/commerces'
});

export default function Page() {
	return <CommercesPage />;
}
