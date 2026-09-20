import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierElusPage from '@themes/atelier/features/elus';
import PreauElusPage from '@themes/preau/features/elus';
import BelvedereElusPage from '@themes/belvedere/features/elus';
import ClocherElusPage from '@themes/clocher/features/elus';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Le maire & les élus',
	description: 'Le conseil municipal de Saint-Martin : Maire, adjoints, conseillers délégués et conseillers municipaux.',
	path: '/mairie/maire-elus'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierElusPage, preau: PreauElusPage, belvedere: BelvedereElusPage, clocher: ClocherElusPage });
	return <Component />;
}
