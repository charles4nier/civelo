import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierDocumentsPage from '@themes/atelier/features/documents';
import PreauDocumentsPage from '@themes/preau/features/documents';
import BelvedereDocumentsPage from '@themes/belvedere/features/documents';
import ClocherDocumentsPage from '@themes/clocher/features/documents';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Documents & publications',
	description: "Comptes-rendus, bulletins municipaux, budget, arrêtés et documents d'urbanisme de Saint-Hilaire-Bonneval.",
	path: '/mairie/publications'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierDocumentsPage, preau: PreauDocumentsPage, belvedere: BelvedereDocumentsPage, clocher: ClocherDocumentsPage });
	return <Component />;
}
