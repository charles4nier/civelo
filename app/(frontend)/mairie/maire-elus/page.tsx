import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoElusPage from '@themes/edito/features/elus';
import ModerneElusPage from '@themes/moderne/features/elus';
import AccueillantElusPage from '@themes/accueillant/features/elus';
import ClassiqueElusPage from '@themes/classique/features/elus';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Le maire & les élus',
	description: 'Le conseil municipal de Saint-Hilaire-Bonneval : Maire, adjoints, conseillers délégués et conseillers municipaux.',
	path: '/mairie/maire-elus'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoElusPage, moderne: ModerneElusPage, accueillant: AccueillantElusPage, classique: ClassiqueElusPage });
	return <Component />;
}
