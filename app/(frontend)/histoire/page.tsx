import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoHistoirePage from '@themes/edito/features/histoire';
import AppHistoirePage from '@themes/app/features/histoire';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Histoire de Saint-Hilaire-Bonneval',
	description:
		"Découvrez l'histoire de Saint-Hilaire-Bonneval : origines gallo-romaines, paroisse, développement du bourg et patrimoine.",
	path: '/histoire'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'edito': StyleEditoHistoirePage, app: AppHistoirePage });
	return <Component />;
}
