import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/atelier/config/seo';
import AtelierBudgetProjetsPage from '@themes/atelier/features/budget-projets';
import PreauBudgetProjetsPage from '@themes/preau/features/budget-projets';
import BelvedereBudgetProjetsPage from '@themes/belvedere/features/budget-projets';
import ClocherBudgetProjetsPage from '@themes/clocher/features/budget-projets';
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
	const Component = pickTheme(theme, { atelier: AtelierBudgetProjetsPage, preau: PreauBudgetProjetsPage, belvedere: BelvedereBudgetProjetsPage, clocher: ClocherBudgetProjetsPage });
	return <Component />;
}
