import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import StyleEditoAgendaPage from '@themes/style-edito/features/agenda';
import AppAgendaPage from '@themes/app/features/agenda';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Agenda',
	description: 'Conseils municipaux, marchés, fêtes et cérémonies à Saint-Hilaire-Bonneval.',
	path: '/agenda'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { 'style-edito': StyleEditoAgendaPage, app: AppAgendaPage });
	return <Component />;
}
