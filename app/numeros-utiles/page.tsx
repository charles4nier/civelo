import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import NumerosUtilesPage from '@features/numeros-utiles';

export const metadata: Metadata = generatePageMetadata({
	title: 'Numéros utiles',
	description:
		'Numéros d\'urgence (SAMU, pompiers, police) et contacts locaux de Saint-Hilaire-Bonneval : mairie, gendarmerie, hôpital.',
	path: '/numeros-utiles',
});

export default function Page() {
	return <NumerosUtilesPage />;
}
