import type { Metadata } from 'next';
import { generatePageMetadata } from '@shared/config/seo';
import EnfanceJeunessePage from '@features/enfance-jeunesse';

export const metadata: Metadata = generatePageMetadata({
	title: 'Enfance & jeunesse',
	description: "Centre de loisirs, cantine, garderie et assistantes maternelles à Saint-Hilaire-Bonneval.",
	path: '/vivre/enfance-jeunesse'
});

export default function Page() {
	return <EnfanceJeunessePage />;
}
