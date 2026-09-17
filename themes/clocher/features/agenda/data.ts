export type EventCategory = 'Conseil municipal' | 'Manifestation' | 'Vie associative' | 'Cérémonie';

export type EventEntry = {
	title: string;
	category: EventCategory;
	date: string; // ISO
	time?: string;
	location: string;
	desc: string;
};

export const events: EventEntry[] = [
	{
		title: 'Séance du conseil municipal',
		category: 'Conseil municipal',
		date: '2026-09-15',
		time: '19h00',
		location: 'Salle du conseil, Mairie',
		desc: 'Séance publique. Ordre du jour affiché en mairie une semaine avant la séance.',
	},
	{
		title: 'Marché de producteurs',
		category: 'Manifestation',
		date: '2026-08-30',
		time: '9h00 – 13h00',
		location: 'Place de la Mairie',
		desc: 'Fruits, légumes, fromages et miel de producteurs locaux. Un dimanche par mois.',
	},
	{
		title: 'Assemblée générale du Football Club',
		category: 'Vie associative',
		date: '2026-09-05',
		time: '18h30',
		location: 'Salle omnisports',
		desc: 'Bilan de la saison, élection du bureau et inscriptions pour la saison 2026-2027.',
	},
	{
		title: 'Vide-grenier annuel',
		category: 'Manifestation',
		date: '2026-09-20',
		time: '8h00 – 18h00',
		location: 'Stade municipal',
		desc: "Organisé par le comité des fêtes. Inscription des exposants en mairie.",
	},
	{
		title: 'Cérémonie du 11 novembre',
		category: 'Cérémonie',
		date: '2026-11-11',
		time: '11h00',
		location: 'Monument aux morts',
		desc: 'Commémoration de l\'Armistice, suivie d\'un vin d\'honneur en mairie.',
	},
	{
		title: 'Loto de l\'école',
		category: 'Vie associative',
		date: '2026-11-21',
		time: '20h00',
		location: 'Salle polyvalente',
		desc: 'Organisé par l\'association des parents d\'élèves, au profit des sorties scolaires.',
	},
	{
		title: 'Séance du conseil municipal',
		category: 'Conseil municipal',
		date: '2026-11-10',
		time: '19h00',
		location: 'Salle du conseil, Mairie',
		desc: 'Séance publique. Ordre du jour affiché en mairie une semaine avant la séance.',
	},
	{
		title: 'Marché de Noël',
		category: 'Manifestation',
		date: '2026-12-13',
		time: '10h00 – 19h00',
		location: 'Place de la Mairie',
		desc: 'Artisanat local, animations pour les enfants et chocolat chaud offert par le comité des fêtes.',
	},
	{
		title: 'Fête de la musique',
		category: 'Manifestation',
		date: '2026-06-21',
		time: 'À partir de 18h00',
		location: 'Le Bourg',
		desc: 'Concerts en plein air avec les associations musicales de la commune.',
	},
	{
		title: 'Cérémonie du 8 mai',
		category: 'Cérémonie',
		date: '2026-05-08',
		time: '11h00',
		location: 'Monument aux morts',
		desc: 'Commémoration de la victoire de 1945, suivie d\'un vin d\'honneur en mairie.',
	},
];
