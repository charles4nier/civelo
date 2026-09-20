import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierHorairesPage from '@themes/atelier/features/horaires';
import PreauHorairesPage from '@themes/preau/features/horaires';
import BelvedereHorairesPage from '@themes/belvedere/features/horaires';
import ClocherHorairesPage from '@themes/clocher/features/horaires';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Horaires & informations',
	description: "Horaires d'ouverture et numéros pratiques de la mairie de Saint-Martin.",
	path: '/mairie/horaires'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierHorairesPage, preau: PreauHorairesPage, belvedere: BelvedereHorairesPage, clocher: ClocherHorairesPage });
	return <Component />;
}
