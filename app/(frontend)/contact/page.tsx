import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoContactPage from '@themes/edito/features/contact';
import ModerneContactPage from '@themes/moderne/features/contact';
import AccueillantContactPage from '@themes/accueillant/features/contact';
import ClassiqueContactPage from '@themes/classique/features/contact';
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
	const Component = pickTheme(theme, { edito: StyleEditoContactPage, moderne: ModerneContactPage, accueillant: AccueillantContactPage, classique: ClassiqueContactPage });
	return <Component />;
}
