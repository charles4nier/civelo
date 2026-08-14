import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import SportsLoisirsPage from '@features/sports-loisirs';

export const metadata: Metadata = generatePageMetadata({
	title: 'Sports & loisirs',
	description: 'Équipements sportifs, clubs et sentiers de randonnée à Saint-Hilaire-Bonneval.',
	path: '/vivre/sports-loisirs'
});

export default function Page() {
	return <SportsLoisirsPage />;
}
