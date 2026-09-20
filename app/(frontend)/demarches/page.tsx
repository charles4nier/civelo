import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierDemarchesPage from '@themes/atelier/features/demarches';
import PreauDemarchesPage from '@themes/preau/features/demarches';
import BelvedereDemarchesPage from '@themes/belvedere/features/demarches';
import ClocherDemarchesPage from '@themes/clocher/features/demarches';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Mes démarches',
	description:
		'Toutes les démarches administratives de Saint-Martin : état civil, scolarité, urbanisme, environnement, titres et documents.',
	path: '/demarches'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierDemarchesPage, preau: PreauDemarchesPage, belvedere: BelvedereDemarchesPage, clocher: ClocherDemarchesPage });
	return <Component />;
}
