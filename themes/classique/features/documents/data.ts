export type DocumentType =
	| 'Comptes-rendus'
	| 'Bulletins municipaux'
	| 'Budget'
	| 'Arrêtés'
	| 'Urbanisme';

export type Doc = {
	title: string;
	type: DocumentType;
	date: string;
	href: string;
};

export const docs: Doc[] = [
	// Comptes-rendus
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-11-14', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-09-19', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-06-06', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-03-28', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2024-01-18', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-11-09', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-09-14', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-06-22', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-03-16', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2023-01-12', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2022-11-17', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2022-09-08', href: '#' },
	{ title: 'Compte-rendu du conseil municipal', type: 'Comptes-rendus', date: '2022-06-23', href: '#' },

	// Bulletins
	{ title: 'Bulletin municipal — Été 2024', type: 'Bulletins municipaux', date: '2024-07-01', href: '#' },
	{ title: 'Bulletin municipal — Hiver 2023', type: 'Bulletins municipaux', date: '2023-12-01', href: '#' },
	{ title: 'Bulletin municipal — Été 2023', type: 'Bulletins municipaux', date: '2023-07-01', href: '#' },
	{ title: 'Bulletin municipal — Hiver 2022', type: 'Bulletins municipaux', date: '2022-12-01', href: '#' },
	{ title: 'Bulletin municipal — Été 2022', type: 'Bulletins municipaux', date: '2022-07-01', href: '#' },

	// Budget
	{ title: 'Budget primitif 2024', type: 'Budget', date: '2024-03-28', href: '#' },
	{ title: 'Compte administratif 2023', type: 'Budget', date: '2024-03-28', href: '#' },
	{ title: 'Budget primitif 2023', type: 'Budget', date: '2023-03-16', href: '#' },
	{ title: 'Compte administratif 2022', type: 'Budget', date: '2023-03-16', href: '#' },

	// Arrêtés
	{ title: "Arrêté — Restriction d'eau en période de sécheresse", type: 'Arrêtés', date: '2024-08-05', href: '#' },
	{ title: 'Arrêté — Fermeture temporaire de la voie communale n°4', type: 'Arrêtés', date: '2024-05-20', href: '#' },
	{ title: 'Arrêté — Organisation du marché annuel', type: 'Arrêtés', date: '2023-09-01', href: '#' },

	// Urbanisme
	{ title: "Plan Local d'Urbanisme (PLU) — Document complet", type: 'Urbanisme', date: '2022-01-15', href: '#' },
	{ title: 'Règlement du PLU', type: 'Urbanisme', date: '2022-01-15', href: '#' },
	{ title: 'Enquête publique — Modification du PLU', type: 'Urbanisme', date: '2023-10-02', href: '#' }
];
