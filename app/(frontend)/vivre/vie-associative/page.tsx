import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierVieAssociativePage from '@themes/atelier/features/vie-associative';
import PreauVieAssociativePage from '@themes/preau/features/vie-associative';
import BelvedereVieAssociativePage from '@themes/belvedere/features/vie-associative';
import ClocherVieAssociativePage from '@themes/clocher/features/vie-associative';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Vie associative',
	description: 'Les associations de Saint-Martin : sport, culture, éducation et citoyenneté.',
	path: '/vivre/vie-associative'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierVieAssociativePage, preau: PreauVieAssociativePage, belvedere: BelvedereVieAssociativePage, clocher: ClocherVieAssociativePage });
	return <Component />;
}
