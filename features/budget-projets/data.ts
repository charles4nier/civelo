export type BudgetEntry = {
	kind: 'budget';
	title: string;
	date: string;
	href: string;
};

export type ProjetStatus = 'À venir' | 'En cours' | 'Terminé';

export type ProjetEntry = {
	kind: 'projet';
	title: string;
	date: string;
	status: ProjetStatus;
	desc: string;
};

export type Entry = BudgetEntry | ProjetEntry;

export const entries: Entry[] = [
	// Budget
	{ kind: 'budget', title: 'Budget primitif 2025', date: '2025-03-20', href: '#' },
	{ kind: 'budget', title: 'Budget primitif 2024', date: '2024-03-28', href: '#' },
	{ kind: 'budget', title: 'Compte administratif 2023', date: '2024-03-28', href: '#' },
	{ kind: 'budget', title: 'Budget primitif 2023', date: '2023-03-16', href: '#' },
	{ kind: 'budget', title: 'Compte administratif 2022', date: '2023-03-16', href: '#' },
	{ kind: 'budget', title: 'Budget primitif 2022', date: '2022-03-10', href: '#' },

	// Projets
	{
		kind: 'projet',
		title: 'Réhabilitation de la salle polyvalente',
		date: '2025-06-01',
		status: 'À venir',
		desc: "Isolation thermique, mise aux normes accessibilité et rénovation de la toiture. Démarrage des travaux prévu à l'été 2025.",
	},
	{
		kind: 'projet',
		title: 'Déploiement de la fibre optique',
		date: '2024-09-01',
		status: 'En cours',
		desc: "Raccordement progressif des foyers de la commune en lien avec le syndicat mixte Dorsal, achèvement prévu fin 2025.",
	},
	{
		kind: 'projet',
		title: 'Réfection de la voirie communale',
		date: '2024-04-15',
		status: 'En cours',
		desc: 'Reprise de la chaussée et des trottoirs sur 3 km, rue du Bourg et route de Pierre-Buffière.',
	},
	{
		kind: 'projet',
		title: 'Aménagement du city-stade',
		date: '2024-05-10',
		status: 'Terminé',
		desc: 'Création d\'un terrain multisports en accès libre à proximité du stade municipal.',
	},
	{
		kind: 'projet',
		title: 'Rénovation énergétique de la mairie',
		date: '2023-10-02',
		status: 'Terminé',
		desc: "Remplacement des menuiseries et passage à un chauffage par pompe à chaleur, avec le soutien de la Région.",
	},
	{
		kind: 'projet',
		title: 'Extension de l\'école primaire',
		date: '2023-01-15',
		status: 'Terminé',
		desc: "Ajout d'une salle de classe et d'un préau pour accompagner la hausse des effectifs scolaires.",
	},
	{
		kind: 'projet',
		title: 'Création du sentier de randonnée de Forgeneuve',
		date: '2022-06-20',
		status: 'Terminé',
		desc: "Balisage d'une boucle de 6 km autour de l'étang, en partenariat avec la Communauté de communes.",
	},
];
