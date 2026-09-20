import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierAgendaPage from '@themes/atelier/features/agenda';
import PreauAgendaPage from '@themes/preau/features/agenda';
import BelvedereAgendaPage from '@themes/belvedere/features/agenda';
import ClocherAgendaPage from '@themes/clocher/features/agenda';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Agenda',
	description: 'Conseils municipaux, marchés, fêtes et cérémonies à Saint-Martin.',
	path: '/agenda'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierAgendaPage, preau: PreauAgendaPage, belvedere: BelvedereAgendaPage, clocher: ClocherAgendaPage });
	return <Component />;
}
