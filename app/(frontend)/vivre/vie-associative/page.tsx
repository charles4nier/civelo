import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoVieAssociativePage from '@themes/edito/features/vie-associative';
import ModerneVieAssociativePage from '@themes/moderne/features/vie-associative';
import AccueillantVieAssociativePage from '@themes/accueillant/features/vie-associative';
import ClassiqueVieAssociativePage from '@themes/classique/features/vie-associative';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Vie associative',
	description: 'Les associations de Saint-Hilaire-Bonneval : sport, culture, éducation et citoyenneté.',
	path: '/vivre/vie-associative'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoVieAssociativePage, moderne: ModerneVieAssociativePage, accueillant: AccueillantVieAssociativePage, classique: ClassiqueVieAssociativePage });
	return <Component />;
}
