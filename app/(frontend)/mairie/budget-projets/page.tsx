import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import StyleEditoBudgetProjetsPage from '@themes/edito/features/budget-projets';
import AppBudgetProjetsPage from '@themes/app/features/budget-projets';
import AccueillantBudgetProjetsPage from '@themes/accueillant/features/budget-projets';
import { pickTheme, getCurrentTheme } from '@shared/lib/theme';
import { getPayloadClient } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Budget & projets',
	description: 'Budgets votés, comptes administratifs et grands projets municipaux à Saint-Hilaire-Bonneval.',
	path: '/mairie/budget-projets'
});

export default async function Page() {
	const payload = await getPayloadClient();
	const theme = await getCurrentTheme(payload);
	const Component = pickTheme(theme, { edito: StyleEditoBudgetProjetsPage, app: AppBudgetProjetsPage, accueillant: AccueillantBudgetProjetsPage });
	return <Component />;
}
