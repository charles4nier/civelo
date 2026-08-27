import DocumentsLayout, { type DocumentItemData } from '@themes/app/components/DocumentsLayout';
import { getDocumentItems } from '@lib/payload';

type DocumentType = 'Comptes-rendus' | 'Bulletins municipaux' | 'Budget' | 'Arrêtés' | 'Urbanisme';
type Doc = { title: string; type: DocumentType; date: string; href: string };

const docs: Doc[] = [
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-11-14', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-09-19', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-06-06', href: '#' },
	{ title: 'Bulletin municipal — Été 2024', type: 'Bulletins municipaux', date: '2024-07-01', href: '#' },
	{ title: 'Budget primitif 2024', type: 'Budget', date: '2024-03-28', href: '#' },
	{ title: "Arrêté — Restriction d'eau en période de sécheresse", type: 'Arrêtés', date: '2024-08-05', href: '#' },
	{ title: "Plan Local d'Urbanisme (PLU) — Document complet", type: 'Urbanisme', date: '2022-01-15', href: '#' },
];

const fallbackItems: DocumentItemData[] = docs.map((d, i) => ({
	key: String(i),
	title: d.title,
	type: d.type,
	date: d.date,
	href: d.href
}));

const types = ['Tous', 'Comptes-rendus', 'Bulletins municipaux', 'Budget', 'Arrêtés', 'Urbanisme'];

export default async function DocumentsPage() {
	const items = (await getDocumentItems('mairie/publications')) ?? fallbackItems;

	return <DocumentsLayout types={types} items={items} />;
}
