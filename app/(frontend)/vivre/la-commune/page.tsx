import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierCommunePage from '@themes/atelier/features/commune';
import PreauCommunePage from '@themes/preau/features/commune';
import BelvedereCommunePage from '@themes/belvedere/features/commune';
import ClocherCommunePage from '@themes/clocher/features/commune';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'La commune',
	description:
		"Portrait de Saint-Hilaire-Bonneval : habitants, superficie, services, commerces et atouts d'une commune rurale dynamique au cœur de la Haute-Vienne.",
	path: '/vivre/la-commune'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierCommunePage, preau: PreauCommunePage, belvedere: BelvedereCommunePage, clocher: ClocherCommunePage });
	return <Component />;
}
