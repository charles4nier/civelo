import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/style-edito/config/seo';
import BudgetProjetsPage from '@themes/style-edito/features/budget-projets';

export const metadata: Metadata = generatePageMetadata({
	title: 'Budget & projets',
	description: 'Budgets votés, comptes administratifs et grands projets municipaux à Saint-Hilaire-Bonneval.',
	path: '/mairie/budget-projets'
});

export default function Page() {
	return <BudgetProjetsPage />;
}
