import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoHorairesPage from '@themes/style-edito/features/horaires';
import AppHorairesPage from '@themes/app/features/horaires';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Horaires & informations',
	description: "Horaires d'ouverture et numéros pratiques de la mairie de Saint-Hilaire-Bonneval.",
	path: '/mairie/horaires'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'style-edito': StyleEditoHorairesPage, app: AppHorairesPage });
	return <Component />;
}
