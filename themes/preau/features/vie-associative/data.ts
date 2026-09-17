export type Category =
	| 'Éducation & famille'
	| 'Sports'
	| 'Culture & patrimoine'
	| 'Citoyenneté';

export type Association = {
	name: string;
	shortName?: string;
	category: Category;
	desc?: string;
	email?: string;
};

export const associations: Association[] = [
	{
		name: "Association des parents d'élèves",
		shortName: 'API',
		category: 'Éducation & famille',
		desc: "Fait le lien entre le corps enseignant du RPI et les familles. Organise des manifestations (fête de l'école, zumba partys, chocolats, loto…). Les bénéfices sont reversés aux deux écoles du RPI.",
	},
	{
		name: 'Association Familles Rurales Briance-Roselle',
		shortName: 'AFR',
		category: 'Éducation & famille',
		desc: "Créée en 1998, gère l'accueil de loisirs et la micro-crèche. Propose des activités jeunesse (accompagnement scolaire, théâtre, séjours pré-ados) et des animations annuelles (marché festif, balade nocturne, marché de l'Avent…).",
	},
	{
		name: 'FCPE du collège F. Lagrange de Pierre-Buffière',
		shortName: 'FCPE',
		category: 'Éducation & famille',
		desc: "1ère fédération nationale des parents d'élèves, avec des instances départementales et locales.",
	},
	{
		name: 'Gym Club Saint-Hilaire-Bonneval',
		category: 'Sports',
		desc: 'Gymnastique volontaire et marche nordique.',
	},
	{
		name: 'Tennis Club de Buffière Bonneval',
		category: 'Sports',
		desc: 'Cours et tournois, en loisir ou en compétition.',
	},
	{
		name: 'Foot Sud 87',
		category: 'Sports',
		desc: 'Club de football des communes de Pierre-Buffière, Saint-Bonnet-Briance, Saint-Genest-Roselle, Saint-Paul et Saint-Hilaire-Bonneval.',
	},
	{
		name: 'Amicale de Pétanque de Saint-Hilaire-Bonneval',
		shortName: 'APSHB',
		category: 'Sports',
		desc: "Entraînements tous les mardis à partir de 18h sous le hangar communal. Cotisation : 20 € / an (30 € couple, gratuit -14 ans).",
		email: 'apshb87@gmail.com',
	},
	{
		name: 'Au four et au jardin',
		category: 'Culture & patrimoine',
		desc: 'Confection du pain dans le four communal.',
	},
	{
		name: 'Comité de jumelage Saint-Hilaire-Bonneval – Auenheim',
		category: 'Culture & patrimoine',
		desc: "Échanges culturels et humains avec la commune d'Auenheim (Alsace).",
	},
	{
		name: 'Anciens combattants ACPG – CATM',
		category: 'Citoyenneté',
		desc: "Participe aux cérémonies du Souvenir et ravive la flamme de l'histoire.",
	},
	{
		name: 'Association communale de chasse agréée',
		shortName: 'ACCA',
		category: 'Citoyenneté',
		desc: 'Association des chasseurs de la commune.',
	},
	{
		name: 'FNATH 87',
		category: 'Citoyenneté',
		desc: "Association des accidentés de la vie. Assure la défense juridique individuelle de ses adhérents.",
	},
];
