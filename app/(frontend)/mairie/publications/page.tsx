import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoDocumentsPage from '@themes/style-edito/features/documents';
import AppDocumentsPage from '@themes/app/features/documents';
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
	const Component = pickTheme(theme, { 'style-edito': StyleEditoDocumentsPage, app: AppDocumentsPage });
	return <Component />;
}
