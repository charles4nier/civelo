export type Category =
	| 'Équipements sportifs'
	| 'Sports collectifs'
	| 'Sports individuels'
	| 'Loisirs & plein air';

export type ActivityCard = {
	name: string;
	category: Category;
	desc?: string;
	address?: string;
	hours?: string;
	phone?: string;
	email?: string;
};

export const activities: ActivityCard[] = [
	{
		name: 'Stade municipal',
		category: 'Équipements sportifs',
		desc: 'Terrain de football engazonné, vestiaires et tribune couverte de 120 places.',
		address: 'Route de Pierre-Buffière, 87260 Saint-Hilaire-Bonneval',
		hours: 'Accès libre en journée hors compétitions',
	},
	{
		name: 'Salle omnisports',
		category: 'Équipements sportifs',
		desc: 'Gymnase pour basket, volley, badminton et activités scolaires. Réservation auprès du secrétariat.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		phone: '05 55 00 60 15',
	},
	{
		name: 'City-stade',
		category: 'Équipements sportifs',
		desc: 'Terrain multisports en accès libre : football, basket, handball.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		hours: 'Accès libre, 8h – 22h',
	},
	{
		name: 'Square de jeux du Bourg',
		category: 'Équipements sportifs',
		desc: 'Aire de jeux pour les 2-10 ans : toboggan, balançoires, structure à grimper.',
		address: 'Place de la Mairie, 87260 Saint-Hilaire-Bonneval',
	},
	{
		name: 'Boulodrome',
		category: 'Équipements sportifs',
		desc: 'Terrain de pétanque éclairé, ouvert aux concours associatifs en soirée.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
	},
	{
		name: 'Football Club de Saint-Hilaire',
		category: 'Sports collectifs',
		desc: "Entraînements mercredi et vendredi, matchs le dimanche. Toutes catégories, de U7 à Séniors.",
		email: 'fc.sainthilaire@gmail.com',
	},
	{
		name: 'Basket Club',
		category: 'Sports collectifs',
		desc: 'École de basket dès 6 ans et équipe loisir adulte. Entraînements le mercredi soir à la salle omnisports.',
		email: 'basket.sainthilaire@gmail.com',
	},
	{
		name: 'Tennis Club',
		category: 'Sports individuels',
		desc: 'Deux courts extérieurs. Cours particuliers et créneaux libres sur réservation.',
		phone: '06 12 45 78 90',
	},
	{
		name: 'Judo Club',
		category: 'Sports individuels',
		desc: 'Cours enfants et adultes, tous niveaux. Entraînements le mardi et le jeudi à la salle omnisports.',
		email: 'judo.sainthilaire@gmail.com',
	},
	{
		name: 'Gymnastique volontaire',
		category: 'Sports individuels',
		desc: 'Cours de gymnastique douce et renforcement musculaire, tous les mardis à 18h30.',
		phone: '05 55 30 22 41',
	},
	{
		name: 'Sentier de randonnée de Forgeneuve',
		category: 'Loisirs & plein air',
		desc: 'Boucle balisée de 6 km autour de l\'étang de Forgeneuve, accès libre toute l\'année.',
		address: 'Étang de Forgeneuve, 87260 Saint-Hilaire-Bonneval',
	},
	{
		name: 'Pêche à l\'étang de Forgeneuve',
		category: 'Loisirs & plein air',
		desc: 'Pêche à la carte journalière, carnassiers et carpes. Cartes disponibles auprès de l\'AAPPMA locale.',
		address: 'Étang de Forgeneuve, 87260 Saint-Hilaire-Bonneval',
	},
];
