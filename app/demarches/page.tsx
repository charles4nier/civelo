import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import DemarchesPage from '@features/demarches';

export const metadata: Metadata = generatePageMetadata({
	title: 'Mes démarches',
	description:
		'Toutes les démarches administratives de Saint-Hilaire-Bonneval : état civil, scolarité, urbanisme, environnement, titres et documents.',
	path: '/demarches',
});

export default function Page() {
	return <DemarchesPage />;
}
