import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierHomePage from '@themes/atelier/features/home';
import PreauHomePage from '@themes/preau/features/home';
import BelvedereHomePage from '@themes/belvedere/features/home';
import ClocherHomePage from '@themes/clocher/features/home';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Accueil',
	description:
		'Site officiel de la commune de Saint-Hilaire-Bonneval (87) : démarches, actualités, tourisme, vie locale et patrimoine au cœur du Limousin.',
	path: '/'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierHomePage, preau: PreauHomePage, belvedere: BelvedereHomePage, clocher: ClocherHomePage });
	return <Component />;
}
