import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import HorairesPage from '@features/horaires';

export const metadata: Metadata = generatePageMetadata({
	title: 'Horaires & informations',
	description: "Horaires d'ouverture et numéros pratiques de la mairie de Saint-Hilaire-Bonneval.",
	path: '/mairie/horaires'
});

export default function Page() {
	return <HorairesPage />;
}
