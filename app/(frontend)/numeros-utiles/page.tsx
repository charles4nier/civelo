import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierNumerosUtilesPage from '@themes/atelier/features/numeros-utiles';
import PreauNumerosUtilesPage from '@themes/preau/features/numeros-utiles';
import BelvedereNumerosUtilesPage from '@themes/belvedere/features/numeros-utiles';
import ClocherNumerosUtilesPage from '@themes/clocher/features/numeros-utiles';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Numéros utiles',
	description: "Numéros d'urgence (SAMU, pompiers, police) et contacts locaux de Saint-Martin : mairie, gendarmerie, hôpital.",
	path: '/numeros-utiles'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { atelier: AtelierNumerosUtilesPage, preau: PreauNumerosUtilesPage, belvedere: BelvedereNumerosUtilesPage, clocher: ClocherNumerosUtilesPage });
	return <Component />;
}
