import AnnuaireLayout, { type AnnuaireCardData } from '@themes/accueillant/components/AnnuaireLayout';
import type { IconVariant } from '@themes/accueillant/components/ContactCard';
import { getAnnuaireItems } from '@lib/payload';

type Category = 'Sports collectifs' | 'Sports individuels' | 'Bien-être & loisirs' | 'Équipements';

const categoryMeta: Record<Category, { icon: string; iconVariant: IconVariant }> = {
	'Sports collectifs':    { icon: 'Users',   iconVariant: 'primary' },
	'Sports individuels':   { icon: 'Trophy',  iconVariant: 'coral' },
	'Bien-être & loisirs':  { icon: 'Heart',   iconVariant: 'sunshine' },
	Équipements:            { icon: 'Dumbbell', iconVariant: 'leaf' }
};

const clubs: { name: string; category: Category; desc?: string; address?: string; email?: string }[] = [
	{ name: 'Football Club', category: 'Sports collectifs', desc: 'Entraînements et matchs pour toutes les catégories d\'âge.', email: 'contact@commune.fr' },
	{ name: 'Tennis Club', category: 'Sports individuels', desc: 'Courts extérieurs accessibles sur réservation.', email: 'contact@commune.fr' },
	{ name: 'Gymnastique volontaire', category: 'Bien-être & loisirs', desc: 'Cours hebdomadaires ouverts à tous les niveaux.', email: 'contact@commune.fr' },
	{ name: 'Salle omnisports', category: 'Équipements', desc: 'Réservable par les associations et écoles de la commune.', address: 'Le Bourg' }
];

const fallbackCards: AnnuaireCardData[] = clubs.map((c) => ({
	key: c.name,
	icon: categoryMeta[c.category].icon,
	iconVariant: categoryMeta[c.category].iconVariant,
	category: c.category,
	name: c.name,
	description: c.desc,
	contacts: [
		...(c.address ? [{ type: 'address' as const, value: c.address }] : []),
		...(c.email ? [{ type: 'email' as const, value: c.email }] : [])
	]
}));

const filters = ['Tous', 'Sports collectifs', 'Sports individuels', 'Bien-être & loisirs', 'Équipements'];

export default async function SportsLoisirsPage() {
	const cards = (await getAnnuaireItems('vivre/sports-loisirs')) ?? fallbackCards;

	return (
		<AnnuaireLayout
			breadcrumbLabel="Sports & loisirs"
			eyebrowIcon="Trophy"
			eyebrowText="Vivre à la commune"
			title="Sports & loisirs"
			subtitle={<>Clubs, associations sportives et équipements :<br />toutes les façons de bouger et se retrouver dans la commune.</>}
			sectionEyebrow="Annuaire sportif"
			countSingular="activité"
			countPlural="activités"
			filters={filters}
			cards={cards}
			cta={{
				eyebrow: "Vous animez un club ou une activité ?",
				title: "Faites référencer votre association sportive",
				desc: "La mairie tient à jour cet annuaire pour valoriser les clubs et activités de la commune. Contactez le secrétariat pour ajouter ou mettre à jour votre fiche.",
				email: "contact@commune.fr",
			}}
		/>
	);
}
