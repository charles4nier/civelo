import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoDemarchesPage from '@themes/style-edito/features/demarches';
import AppDemarchesPage from '@themes/app/features/demarches';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Mes démarches',
	description:
		'Toutes les démarches administratives de Saint-Hilaire-Bonneval : état civil, scolarité, urbanisme, environnement, titres et documents.',
	path: '/demarches'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'style-edito': StyleEditoDemarchesPage, app: AppDemarchesPage });
	return <Component />;
}
