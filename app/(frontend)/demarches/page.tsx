import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoDemarchesPage from '@themes/edito/features/demarches';
import ModerneDemarchesPage from '@themes/moderne/features/demarches';
import AccueillantDemarchesPage from '@themes/accueillant/features/demarches';
import ClassiqueDemarchesPage from '@themes/classique/features/demarches';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Mes démarches',
	description:
		'Toutes les démarches administratives de Saint-Hilaire-Bonneval : état civil, scolarité, urbanisme, environnement, titres et documents.',
	path: '/demarches'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoDemarchesPage, moderne: ModerneDemarchesPage, accueillant: AccueillantDemarchesPage, classique: ClassiqueDemarchesPage });
	return <Component />;
}
