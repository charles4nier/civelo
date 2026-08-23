import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import HomePage from '@themes/style-edito/features/home';

export const metadata: Metadata = generatePageMetadata({
	title: 'Accueil',
	description:
		'Site officiel de la commune de Saint-Hilaire-Bonneval (87) : démarches, actualités, tourisme, vie locale et patrimoine au cœur du Limousin.',
	path: '/'
});

export default function Page() {
	return <HomePage />;
}
