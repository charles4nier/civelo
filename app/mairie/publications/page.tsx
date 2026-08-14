import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import DocumentsPage from '@features/documents';

export const metadata: Metadata = generatePageMetadata({
	title: 'Documents & publications',
	description: 'Comptes-rendus, bulletins municipaux, budget, arrêtés et documents d\'urbanisme de Saint-Hilaire-Bonneval.',
	path: '/mairie/publications'
});

export default function Page() {
	return <DocumentsPage />;
}
