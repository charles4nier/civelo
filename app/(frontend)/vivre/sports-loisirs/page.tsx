import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierSportsLoisirsPage from '@themes/atelier/features/sports-loisirs';
import PreauSportsLoisirsPage from '@themes/preau/features/sports-loisirs';
import BelvedereSportsLoisirsPage from '@themes/belvedere/features/sports-loisirs';
import ClocherSportsLoisirsPage from '@themes/clocher/features/sports-loisirs';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Sports & loisirs',
	description: 'Équipements sportifs, clubs et sentiers de randonnée à Saint-Martin.',
	path: '/vivre/sports-loisirs'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierSportsLoisirsPage, preau: PreauSportsLoisirsPage, belvedere: BelvedereSportsLoisirsPage, clocher: ClocherSportsLoisirsPage });
	return <Component />;
}
