import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierHistoirePage from '@themes/atelier/features/histoire';
import PreauHistoirePage from '@themes/preau/features/histoire';
import BelvedereHistoirePage from '@themes/belvedere/features/histoire';
import ClocherHistoirePage from '@themes/clocher/features/histoire';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Histoire de Saint-Martin',
	description:
		"Découvrez l'histoire de Saint-Martin : origines gallo-romaines, paroisse, développement du bourg et patrimoine.",
	path: '/histoire'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierHistoirePage, preau: PreauHistoirePage, belvedere: BelvedereHistoirePage, clocher: ClocherHistoirePage });
	return <Component />;
}
