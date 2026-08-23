import BudgetProjetLayout, { type BudgetProjetItemData } from '@themes/style-edito/components/BudgetProjetLayout';
import { getBudgetProjetItems } from '@lib/payload';
import { entries } from './data';

const fallbackItems: BudgetProjetItemData[] = entries.map((e, i) =>
	e.kind === 'budget'
		? { key: String(i), kind: 'budget', title: e.title, date: e.date, href: e.href === '#' ? undefined : e.href }
		: { key: String(i), kind: 'projet', title: e.title, date: e.date, status: e.status, desc: e.desc }
);

export default async function BudgetProjetsPage() {
	const items = (await getBudgetProjetItems('mairie/budget-projets')) ?? fallbackItems;

	return <BudgetProjetLayout items={items} />;
}
