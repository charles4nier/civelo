import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierEnfanceJeunessePage from '@themes/atelier/features/enfance-jeunesse';
import PreauEnfanceJeunessePage from '@themes/preau/features/enfance-jeunesse';
import BelvedereEnfanceJeunessePage from '@themes/belvedere/features/enfance-jeunesse';
import ClocherEnfanceJeunessePage from '@themes/clocher/features/enfance-jeunesse';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Enfance & jeunesse',
	description: 'Centre de loisirs, cantine, garderie et assistantes maternelles à Saint-Hilaire-Bonneval.',
	path: '/vivre/enfance-jeunesse'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierEnfanceJeunessePage, preau: PreauEnfanceJeunessePage, belvedere: BelvedereEnfanceJeunessePage, clocher: ClocherEnfanceJeunessePage });
	return <Component />;
}
