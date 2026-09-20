export const urgences = [
	{ number: '15', label: 'SAMU', desc: 'Urgences médicales', color: 'red' },
	{ number: '17', label: 'Police / Gendarmerie', desc: 'Urgences sécurité', color: 'blue' },
	{ number: '18', label: 'Pompiers', desc: 'Incendie & secours', color: 'red' },
	{ number: '112', label: 'Numéro européen', desc: 'Toutes urgences depuis un mobile', color: 'blue' },
	{ number: '114', label: 'Urgences sourds & malentendants', desc: 'SMS, fax ou visiophonie', color: 'muted' },
	{ number: '115', label: 'SAMU Social', desc: 'Personnes sans abri', color: 'muted' },
	{ number: '119', label: "Protection de l'enfance", desc: 'Enfants en danger', color: 'muted' },
	{ number: '3114', label: 'Prévention suicide', desc: 'Numéro national, 24h/24', color: 'muted' },
	{ number: '3919', label: 'Violences conjugales', desc: 'Femmes victimes de violences, 24h/24', color: 'muted' }
] as const;

export const locaux = [
	{
		label: 'Mairie de Saint-Martin',
		number: '05 XX XX 60 15',
		detail: 'Lundi – vendredi : 9h – 12h / 14h – 17h',
		href: 'tel:+33555006015'
	},
	{
		label: 'Gendarmerie de Saint-Martin',
		number: '05 XX XX 60 17',
		detail: null,
		href: 'tel:+33555006017'
	},
	{
		label: 'Centre hospitalier universitaire de Limoges',
		number: '05 55 05 55 55',
		detail: null,
		href: 'tel:+33555055555'
	}
];
