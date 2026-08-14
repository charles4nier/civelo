export type Category =
	| 'École'
	| 'Petite enfance'
	| 'Centre de loisirs'
	| 'Assistantes maternelles';

export type ServiceCard = {
	name: string;
	category: Category;
	desc?: string;
	address?: string;
	hours?: string;
	phone?: string;
	email?: string;
};

export const services: ServiceCard[] = [
	{
		name: 'École primaire de Saint-Hilaire-Bonneval',
		category: 'École',
		desc: 'Directrice : Mme Catherine MORANGE. Équipe : CP-CE2 Mme MORANGE, CE1 Mme SUKHDEO, CE2 Mme GORSE.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		hours: 'Lun / Mar / Jeu / Ven : 8h45 – 12h00 et 13h30 – 16h15',
		phone: '05 55 00 69 74',
		email: 'ce.0870362w@ac-limoges.fr',
	},
	{
		name: 'Garderie scolaire',
		category: 'École',
		desc: 'Commune : 2 € / jour (1,75 € 2ème enfant, gratuit 3ème+). Extérieurs : 3,70 € / jour.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		hours: 'Lun / Mar / Jeu / Ven : 7h15 – 8h35 et 16h15 – 18h30',
	},
	{
		name: 'Cantine scolaire',
		category: 'École',
		desc: 'Responsable : Mme Sandra ROUX. Tarifs : 2,80 € / repas (enfants RPI), 4,80 € (extérieurs).',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
	},
	{
		name: 'Micro-crèche',
		category: 'Petite enfance',
		desc: '10 places. Accueil des enfants de 10 semaines à 5 ans révolus.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		hours: 'Lun – Ven : 7h30 – 18h30 (hors jours fériés et fermetures)',
		phone: '05 55 30 27 69',
		email: 'mc.sainthilaire87@gmail.com',
	},
	{
		name: 'Centre de loisirs (CLSH)',
		category: 'Centre de loisirs',
		desc: 'Géré par la Communauté de Communes Briance Sud Haute-Vienne. Contact : Mme Oriane COURNUT.',
		address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval',
		hours: 'Lun – Ven : 7h30 – 18h30 (hors jours fériés et fermetures)',
		phone: '05 55 00 02 97',
		email: 'acm.sthilaireb@gmail.com',
	},
	{
		name: 'Mme Corinne ACHARD',
		category: 'Assistantes maternelles',
		address: '11 route de Pierre Buffière',
		phone: '05 55 00 77 63 · 06 70 37 12 19',
	},
	{
		name: 'Mme Cécile ANFREVILLE',
		category: 'Assistantes maternelles',
		address: '6 chemin des Chênes',
		phone: '05 55 44 93 98',
	},
	{
		name: 'Mme Brigitte BARDAUD',
		category: 'Assistantes maternelles',
		address: '2 route de Chnatalouette',
		phone: '05 55 00 42 41',
	},
	{
		name: 'Mme Natacha GUICHARD',
		category: 'Assistantes maternelles',
		address: '7 route de Roirette',
		phone: '05 55 30 42 89',
	},
	{
		name: 'Mme Berta GUILHAS COELHO',
		category: 'Assistantes maternelles',
		address: '7 impasse des Hauts de Plaisance',
		phone: '07 87 44 48 74',
	},
	{
		name: 'Mme Julie JACQUET',
		category: 'Assistantes maternelles',
		address: '21 allée de Plaisance',
		phone: '06 09 40 56 25',
	},
	{
		name: 'Mme Aurélie PICHON',
		category: 'Assistantes maternelles',
		address: '15 impasse des Hauts de Plaisance',
		phone: '06 61 43 12 73',
	},
	{
		name: 'Mme Julie THOURAUD',
		category: 'Assistantes maternelles',
		address: '6 chez Fringant',
		phone: '06 23 95 48 06',
	},
	{
		name: 'Relais Assistantes Maternelles',
		category: 'Assistantes maternelles',
		desc: 'Animé par Christine FOUCHÉ. Animations chaque lundi dans la salle du CLSH de 10h00 à 11h30 (sauf vacances scolaires).',
		phone: '05 55 09 62 44 · 06 79 14 59 35',
	},
];
