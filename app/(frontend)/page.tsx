import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoHomePage from '@themes/edito/features/home';
import AppHomePage from '@themes/app/features/home';
import AccueillantHomePage from '@themes/accueillant/features/home';
import ClassiqueHomePage from '@themes/classique/features/home';
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
	const Component = pickTheme(theme, { edito: StyleEditoHomePage, app: AppHomePage, accueillant: AccueillantHomePage, classique: ClassiqueHomePage });
	return <Component />;
}
