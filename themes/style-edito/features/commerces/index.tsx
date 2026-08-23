import AnnuaireLayout, { type AnnuaireCardData } from '@themes/style-edito/components/AnnuaireLayout';
import type { IconVariant } from '@themes/style-edito/components/ContactCard';
import { getAnnuaireItems } from '@lib/payload';
import { commerces, type Category } from './data';

// Repli statique si Payload est injoignable ou si la page n'existe pas
// encore côté base (item 11) — noms d'icône lucide-react en texte, pas des
// références de composant (voir shared/lib/icons.ts).
const categoryMeta: Record<Category, { icon: string; iconVariant: IconVariant }> = {
	Alimentation:             { icon: 'ShoppingBasket', iconVariant: 'leaf' },
	Restauration:             { icon: 'UtensilsCrossed', iconVariant: 'coral' },
	'Cafés - Bars':           { icon: 'Coffee',         iconVariant: 'sunshine' },
	Beauté:                   { icon: 'Sparkles',        iconVariant: 'coral' },
	Santé:                    { icon: 'Stethoscope',     iconVariant: 'primary' },
	'Garages - mécanique':    { icon: 'Wrench',          iconVariant: 'muted' },
	'Artisans & entreprises': { icon: 'Hammer',          iconVariant: 'leaf' },
	Autres:                   { icon: 'Store',           iconVariant: 'primary' },
};

const fallbackCards: AnnuaireCardData[] = commerces.map((c) => ({
	key: c.name,
	icon: categoryMeta[c.category].icon,
	iconVariant: categoryMeta[c.category].iconVariant,
	category: c.category,
	name: c.name,
	description: c.desc,
	contacts: [
		...(c.address ? [{ type: 'address' as const, value: c.address }] : []),
		...(c.hours   ? [{ type: 'hours'   as const, value: c.hours }]   : []),
		...(c.phone   ? [{ type: 'phone'   as const, value: c.phone }]   : []),
		...(c.email   ? [{ type: 'email'   as const, value: c.email }]   : []),
	],
}));

const filters = ['Tous', 'Alimentation', 'Restauration', 'Cafés - Bars', 'Beauté', 'Santé', 'Garages - mécanique', 'Artisans & entreprises', 'Autres'];

export default async function CommercesPage() {
	const cards = (await getAnnuaireItems('commerces')) ?? fallbackCards;

	return (
		<AnnuaireLayout
			heroGradient="linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))"
			breadcrumbLabel="Services & vie pratique"
			eyebrowIcon="Store"
			eyebrowText="Vivre à Saint-Hilaire-Bonneval"
			title="Services & vie pratique"
			subtitle={<>Producteurs, restaurateurs, professionnels de santé et artisans :<br />celles et ceux qui animent la commune au quotidien.</>}
			sectionEyebrow="Annuaire local"
			countSingular="professionnel à découvrir"
			countPlural="professionnels à découvrir"
			filters={filters}
			cards={cards}
			cta={{
				eyebrow: "Vous êtes un professionnel ?",
				title: "Référencez votre commerce ou activité dans l'annuaire communal",
				desc: "La mairie tient à jour cet annuaire pour valoriser le tissu économique local. Contactez le secrétariat pour ajouter ou mettre à jour votre fiche.",
				email: "mairie@saint-hilaire-bonneval.fr",
			}}
		/>
	);
}
