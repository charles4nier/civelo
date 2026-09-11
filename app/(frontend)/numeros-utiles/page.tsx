import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoNumerosUtilesPage from '@themes/edito/features/numeros-utiles';
import AppNumerosUtilesPage from '@themes/app/features/numeros-utiles';
import AccueillantNumerosUtilesPage from '@themes/accueillant/features/numeros-utiles';
import ClassiqueNumerosUtilesPage from '@themes/classique/features/numeros-utiles';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Numéros utiles',
	description: "Numéros d'urgence (SAMU, pompiers, police) et contacts locaux de Saint-Hilaire-Bonneval : mairie, gendarmerie, hôpital.",
	path: '/numeros-utiles'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoNumerosUtilesPage, app: AppNumerosUtilesPage, accueillant: AccueillantNumerosUtilesPage, classique: ClassiqueNumerosUtilesPage });
	return <Component />;
}
