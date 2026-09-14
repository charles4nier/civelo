import BudgetProjetLayout, { type BudgetProjetItemData } from '@themes/moderne/components/BudgetProjetLayout';
import { getBudgetProjetItems } from '@lib/payload';

const fallbackItems: BudgetProjetItemData[] = [
	{ key: '1', kind: 'budget', title: 'Budget primitif 2026', date: '2026-03-28' },
	{ key: '2', kind: 'projet', title: 'Rénovation de la salle des fêtes', date: '2026-05-01', status: 'En cours', desc: "Travaux débutés en juin pour une livraison prévue à l'automne." },
	{ key: '3', kind: 'projet', title: 'Aménagement du plan d\'eau', date: '2026-02-10', status: 'À venir', desc: 'Étude en cours avec le syndicat de gestion des eaux.' }
];

export default async function BudgetProjetsPage() {
	const items = (await getBudgetProjetItems('mairie/budget-projets')) ?? fallbackItems;

	return <BudgetProjetLayout items={items} />;
}
