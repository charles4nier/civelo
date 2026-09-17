import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierContactPage from '@themes/atelier/features/contact';
import PreauContactPage from '@themes/preau/features/contact';
import BelvedereContactPage from '@themes/belvedere/features/contact';
import ClocherContactPage from '@themes/clocher/features/contact';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Contact',
	description: 'Contactez la mairie de Saint-Hilaire-Bonneval par téléphone, email ou via le formulaire en ligne.',
	path: '/contact'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierContactPage, preau: PreauContactPage, belvedere: BelvedereContactPage, clocher: ClocherContactPage });
	return <Component />;
}
