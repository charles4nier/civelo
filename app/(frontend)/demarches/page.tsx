import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import DemarchesPage from '@themes/style-edito/features/demarches';

export const metadata: Metadata = generatePageMetadata({
	title: 'Mes démarches',
	description:
		'Toutes les démarches administratives de Saint-Hilaire-Bonneval : état civil, scolarité, urbanisme, environnement, titres et documents.',
	path: '/demarches',
});

export default function Page() {
	return <DemarchesPage />;
}
