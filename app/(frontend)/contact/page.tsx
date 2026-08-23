import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import ContactPage from '@themes/style-edito/features/contact';

export const metadata: Metadata = generatePageMetadata({
	title: 'Contact',
	description: 'Contactez la mairie de Saint-Hilaire-Bonneval par téléphone, email ou via le formulaire en ligne.',
	path: '/contact'
});

export default function Page() {
	return <ContactPage />;
}
