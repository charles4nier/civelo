import AnnuaireLayout, {
	type AnnuaireCardData
} from '@themes/edito/components/AnnuaireLayout';
import type { IconVariant } from '@themes/edito/components/ContactCard';
import { getAnnuaireItems } from '@lib/payload';
import { activities, type Category } from './data';

const categoryMeta: Record<
	Category,
	{ icon: string; iconVariant: IconVariant }
> = {
	'Équipements sportifs': { icon: 'Dumbbell', iconVariant: 'primary' },
	'Sports collectifs': { icon: 'Trophy', iconVariant: 'coral' },
	'Sports individuels': { icon: 'Medal', iconVariant: 'leaf' },
	'Loisirs & plein air': { icon: 'TreePine', iconVariant: 'sunshine' }
};

function toContacts(a: (typeof activities)[number]) {
	return [
		...(a.address ? [{ type: 'address' as const, value: a.address }] : []),
		...(a.hours ? [{ type: 'hours' as const, value: a.hours }] : []),
		...(a.phone ? [{ type: 'phone' as const, value: a.phone }] : []),
		...(a.email ? [{ type: 'email' as const, value: a.email }] : [])
	];
}

const fallbackCards: AnnuaireCardData[] = activities.map((a) => ({
	key: a.name,
	icon: categoryMeta[a.category].icon,
	iconVariant: categoryMeta[a.category].iconVariant,
	category: a.category,
	name: a.name,
	description: a.desc,
	contacts: toContacts(a)
}));

const filters = [
	'Tous',
	'Équipements sportifs',
	'Sports collectifs',
	'Sports individuels',
	'Loisirs & plein air'
];

export default async function SportsLoisirsPage() {
	const cards = (await getAnnuaireItems('vivre/sports-loisirs')) ?? fallbackCards;

	return (
		<AnnuaireLayout
			heroGradient="linear-gradient(135deg, oklch(0.62 0.16 150), oklch(0.78 0.12 220))"
			breadcrumbLabel="Sports & loisirs"
			eyebrowIcon="Trophy"
			eyebrowText="Vivre à Saint-Hilaire-Bonneval"
			title="Sports & loisirs"
			subtitle={
				<>
					Équipements, clubs et sentiers :<br />
					tout pour bouger et se détendre à Saint-Hilaire-Bonneval.
				</>
			}
			sectionEyebrow="Activités & équipements"
			countSingular="activité"
			countPlural="activités"
			filters={filters}
			cards={cards}
			cta={{
				eyebrow: 'Vous animez un club ou une activité ?',
				title: 'Faites référencer votre activité sur le site de la mairie',
				desc: "La mairie tient à jour cet annuaire pour valoriser l'offre sportive et de loisirs locale. Contactez le secrétariat pour ajouter ou mettre à jour votre fiche.",
				email: 'mairie@saint-hilaire-bonneval.fr'
			}}
		/>
	);
}
