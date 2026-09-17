import AnnuaireLayout, { type AnnuaireCardData } from '@themes/atelier/components/AnnuaireLayout';
import type { IconVariant } from '@themes/atelier/components/ContactCard';
import { getAnnuaireItems } from '@lib/payload';
import { associations, type Category } from './data';

const categoryMeta: Record<Category, { icon: string; iconVariant: IconVariant }> = {
	'Éducation & famille':   { icon: 'GraduationCap', iconVariant: 'primary' },
	'Sports':                { icon: 'Trophy',        iconVariant: 'coral' },
	'Culture & patrimoine':  { icon: 'Leaf',          iconVariant: 'leaf' },
	'Mémoire & solidarités': { icon: 'Flame',         iconVariant: 'muted' },
	'Engagement civique':    { icon: 'Scale',         iconVariant: 'sunshine' },
	'Nature':                { icon: 'TreePine',      iconVariant: 'leaf' },
};

const fallbackCards: AnnuaireCardData[] = associations.map((a) => ({
	key: a.name,
	icon: categoryMeta[a.category].icon,
	iconVariant: categoryMeta[a.category].iconVariant,
	category: a.category,
	name: a.name,
	badge: a.shortName,
	description: a.desc,
	contacts: a.email ? [{ type: 'email' as const, value: a.email }] : [],
}));

const filters = [
	'Tous',
	'Éducation & famille',
	'Sports',
	'Culture & patrimoine',
	'Mémoire & solidarités',
	'Engagement civique',
	'Nature'
];

export default async function VieAssociativePage() {
	const cards = (await getAnnuaireItems('vivre/vie-associative')) ?? fallbackCards;

	return (
		<AnnuaireLayout
			heroGradient="linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))"
			breadcrumbLabel="Vie associative"
			eyebrowIcon="Users"
			eyebrowText="Vivre à Saint-Hilaire-Bonneval"
			title="Vie associative"
			subtitle={<>Sport, culture, éducation et engagement local :<br />{cards.length} associations animent la commune.</>}
			sectionEyebrow="Annuaire associatif"
			countSingular="association"
			countPlural="associations"
			filters={filters}
			cards={cards}
			cta={{
				eyebrow: "Vous représentez une association ?",
				title: "Faites référencer votre association sur le site de la mairie",
				desc: "La mairie tient à jour cet annuaire pour valoriser la vie associative locale. Contactez le secrétariat pour ajouter ou mettre à jour votre fiche.",
				email: "mairie@saint-hilaire-bonneval.fr",
			}}
		/>
	);
}
