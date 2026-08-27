export const commune = {
	nom:         'Nom de la Commune',
	departement: 'Département',
	codePostal:  '00000',
	codeInsee:   '00000',
	region:      'Région',
	population:  0,

	adresse:     'Le Bourg, 00000 Nom de la Commune',
	telephone:   '00 00 00 00 00',
	email:       'contact@commune.fr',
	horaires:    'Lun – Ven · 9h – 12h / 14h – 17h',

	maire:       'Monsieur le Maire',
	slogan:      'Bienvenue dans notre commune.',

	facebook:    '',
	siteUrl:     process.env.NEXT_PUBLIC_SITE_URL || 'https://www.commune.fr',
} as const;
