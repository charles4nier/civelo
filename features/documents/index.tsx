import DocumentLayout, { type DocumentItemData } from '@shared/components/DocumentLayout';
import type { IconVariant } from '@shared/components/ContactCard';
import { getDocumentItems } from '../../lib/payload';
import { docs, type DocumentType } from './data';

const typeVariant: Record<DocumentType, IconVariant> = {
	'Comptes-rendus': 'primary',
	'Bulletins municipaux': 'coral',
	Budget: 'leaf',
	Arrêtés: 'muted',
	Urbanisme: 'muted'
};

const fallbackItems: DocumentItemData[] = docs.map((d, i) => ({
	key: String(i),
	title: d.title,
	type: d.type,
	typeVariant: typeVariant[d.type],
	date: d.date,
	href: d.href === '#' ? undefined : d.href
}));

const filters = ['Tous', 'Comptes-rendus', 'Bulletins municipaux', 'Budget', 'Arrêtés', 'Urbanisme'];

export default async function DocumentsPage() {
	const items = (await getDocumentItems('mairie/publications')) ?? fallbackItems;

	return <DocumentLayout filters={filters} items={items} />;
}
