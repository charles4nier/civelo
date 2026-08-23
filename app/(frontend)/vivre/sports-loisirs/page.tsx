import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import SportsLoisirsPage from '@themes/style-edito/features/sports-loisirs';

export const metadata: Metadata = generatePageMetadata({
	title: 'Sports & loisirs',
	description: 'Équipements sportifs, clubs et sentiers de randonnée à Saint-Hilaire-Bonneval.',
	path: '/vivre/sports-loisirs'
});

export default function Page() {
	return <SportsLoisirsPage />;
}
