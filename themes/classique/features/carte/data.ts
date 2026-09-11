export type POICategory = 'hebergement' | 'site-visite';

export type POI = {
	id: string;
	name: string;
	description: string;
	category: POICategory;
	lat: number;
	lng: number;
	image: string;
};

export type Sentier = {
	id: string;
	name: string;
	description: string;
	distance: string;
	duration: string;
	coordinates: [number, number][];
	image: string;
};

export const pois: POI[] = [
	{
		id: 'gite-chenes',
		name: 'Gîte Les Chênes',
		description: 'Gîte rural 4 personnes au cœur des bois, terrasse et jardin privatifs.',
		category: 'hebergement',
		lat: 45.7215,
		lng: 1.371,
		image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
	},
	{
		id: 'gite-forge',
		name: "Chambre d'hôtes La Forge",
		description: "Ancienne forge restaurée, table d'hôtes sur réservation.",
		category: 'hebergement',
		lat: 45.717,
		lng: 1.3795,
		image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
	},
	{
		id: 'gite-moulin',
		name: 'Gîte du Moulin de Bonneval',
		description: 'Ancien moulin restauré en bord de rivière, capacité 6 personnes.',
		category: 'hebergement',
		lat: 45.7242,
		lng: 1.3812,
		image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
	},
	{
		id: 'eglise',
		name: 'Église Saint-Hilaire',
		description: 'Église romane du XIIe siècle, classée Monument Historique.',
		category: 'site-visite',
		lat: 45.7193,
		lng: 1.3757,
		image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&q=80',
	},
	{
		id: 'chateau',
		name: 'Château de Bonneval',
		description: 'Château médiéval du XVe siècle, visible depuis le chemin de ronde.',
		category: 'site-visite',
		lat: 45.715,
		lng: 1.3698,
		image: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?w=600&q=80',
	},
	{
		id: 'lavoir',
		name: 'Lavoir du Bourg',
		description: 'Lavoir communal restauré du XIXe siècle, patrimoine local.',
		category: 'site-visite',
		lat: 45.7202,
		lng: 1.377,
		image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
	},
	{
		id: 'croix',
		name: 'Croix de granit',
		description: 'Croix de chemin en granite local, XVIIe siècle.',
		category: 'site-visite',
		lat: 45.7225,
		lng: 1.3742,
		image: 'https://images.unsplash.com/photo-1519677584237-752f8853252e?w=600&q=80',
	},
	{
		id: 'etang-bonneval',
		name: 'Étang de Bonneval',
		description: "Plan d'eau naturel idéal pour la pêche et les balades en bordure d'eau.",
		category: 'site-visite',
		lat: 45.718,
		lng: 1.385,
		image: '/saint-hilaire-bonneval-lake.jpg',
	},
];

export const sentiers: Sentier[] = [
	{
		id: 'sentier-cretes',
		name: 'Sentier des Crêtes',
		description: 'Grande boucle panoramique avec vues sur la vallée de la Briance.',
		distance: '7,5 km',
		duration: '2h30',
		image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
		coordinates: [
			[45.7193, 1.3757],
			[45.7230, 1.372],
			[45.727, 1.3700],
			[45.729, 1.374],
			[45.728, 1.3802],
			[45.7248, 1.3842],
			[45.7198, 1.3862],
			[45.7148, 1.3842],
			[45.712, 1.3792],
			[45.714, 1.373],
			[45.717, 1.3700],
			[45.7193, 1.3757],
		],
	},
	{
		id: 'sentier-moulin',
		name: 'Sentier du Moulin',
		description: "Balade douce le long du ruisseau jusqu'au moulin de Bonneval.",
		distance: '3,2 km',
		duration: '1h',
		image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
		coordinates: [
			[45.7193, 1.3757],
			[45.7210, 1.374],
			[45.723, 1.375],
			[45.724, 1.377],
			[45.7235, 1.3795],
			[45.7242, 1.3812],
		],
	},
];
