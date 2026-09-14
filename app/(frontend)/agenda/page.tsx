import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoAgendaPage from '@themes/edito/features/agenda';
import ModerneAgendaPage from '@themes/moderne/features/agenda';
import AccueillantAgendaPage from '@themes/accueillant/features/agenda';
import ClassiqueAgendaPage from '@themes/classique/features/agenda';
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
	const Component = pickTheme(theme, { edito: StyleEditoAgendaPage, moderne: ModerneAgendaPage, accueillant: AccueillantAgendaPage, classique: ClassiqueAgendaPage });
	return <Component />;
}
