import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import ContactPage from '@features/contact';

export const metadata: Metadata = generatePageMetadata({
	title: 'Contact',
	description: 'Contactez la mairie de Saint-Hilaire-Bonneval par téléphone, email ou via le formulaire en ligne.',
	path: '/contact'
});

export default function Page() {
	return <ContactPage />;
}
