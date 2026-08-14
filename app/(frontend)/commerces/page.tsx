import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import CommercesPage from '@features/commerces';

export const metadata: Metadata = generatePageMetadata({
	title: 'Services & vie pratique',
	description:
		'Découvrez les commerces, artisans et entreprises de Saint-Hilaire-Bonneval : alimentation, restauration, santé, beauté, garages et savoir-faire locaux.',
	path: '/commerces'
});

export default function Page() {
	return <CommercesPage />;
}
