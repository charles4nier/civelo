'use client';

import { Baby, School, Star, Users, type LucideIcon } from 'lucide-react';
import AnnuaireLayout, { type AnnuaireCardData } from '@themes/app/components/AnnuaireLayout';
import type { IconVariant } from '@themes/app/components/ContactCard';
import { services, type Category, type ServiceCard } from './data';

const categoryMeta: Record<Category, { icon: LucideIcon; iconVariant: IconVariant }> = {
	'École':                   { icon: School, iconVariant: 'coral' },
	'Petite enfance':          { icon: Star,   iconVariant: 'sunshine' },
	'Centre de loisirs':       { icon: Users,  iconVariant: 'primary' },
	'Assistantes maternelles': { icon: Baby,   iconVariant: 'leaf' },
};

function toContacts(s: ServiceCard) {
	return [
		...(s.address ? [{ type: 'address' as const, value: s.address }] : []),
		...(s.hours   ? [{ type: 'hours'   as const, value: s.hours }]   : []),
		...(s.phone   ? [{ type: 'phone'   as const, value: s.phone }]   : []),
		...(s.email   ? [{ type: 'email'   as const, value: s.email }]   : []),
	];
}

const cards: AnnuaireCardData[] = services.map((s) => ({
	key: s.name,
	icon: categoryMeta[s.category].icon,
	iconVariant: categoryMeta[s.category].iconVariant,
	category: s.category,
	name: s.name,
	description: s.desc,
	contacts: toContacts(s),
}));

const filters = ['Tous', 'École', 'Petite enfance', 'Centre de loisirs', 'Assistantes maternelles'];

export default async function EnfanceJeunessePage() {
	return (
		<AnnuaireLayout
			breadcrumbLabel="Enfance & jeunesse"
			eyebrowIcon={Baby}
			eyebrowText="Vivre à la commune"
			title="Enfance & jeunesse"
			subtitle={<>École, micro-crèche, centre de loisirs et assistantes maternelles :<br />tous les services dédiés aux familles de la commune.</>}
			sectionEyebrow="Services aux familles"
			countSingular="service"
			countPlural="services"
			filters={filters}
			cards={cards}
		/>
	);
}
