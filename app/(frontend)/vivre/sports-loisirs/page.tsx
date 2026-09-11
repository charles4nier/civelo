import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoSportsLoisirsPage from '@themes/edito/features/sports-loisirs';
import AppSportsLoisirsPage from '@themes/app/features/sports-loisirs';
import AccueillantSportsLoisirsPage from '@themes/accueillant/features/sports-loisirs';
import ClassiqueSportsLoisirsPage from '@themes/classique/features/sports-loisirs';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Sports & loisirs',
	description: 'Équipements sportifs, clubs et sentiers de randonnée à Saint-Hilaire-Bonneval.',
	path: '/vivre/sports-loisirs'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoSportsLoisirsPage, app: AppSportsLoisirsPage, accueillant: AccueillantSportsLoisirsPage, classique: ClassiqueSportsLoisirsPage });
	return <Component />;
}
