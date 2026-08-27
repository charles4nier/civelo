export type Category =
	| 'Alimentation'
	| 'Restauration'
	| 'Cafés - Bars'
	| 'Beauté'
	| 'Santé'
	| 'Garages - mécanique'
	| 'Artisans & entreprises'
	| 'Autres';

export type Commerce = {
	name: string;
	category: Category;
	desc?: string;
	address?: string;
	hours?: string;
	phone?: string;
	email?: string;
};

export const commerces: Commerce[] = [
	{ name: 'Médecins — Dr Sylvie Dubray, Dr Evelyne Laurençon', category: 'Santé', desc: 'Médecine générale au cabinet médical de la commune.', phone: '05 55 31 20' },
	{ name: 'Infirmières — V. Fabre, N. Lesca, A. Boireau, A. Bourges', category: 'Santé', desc: 'Soins infirmiers au cabinet et à domicile.', phone: '05 55 08 64 75 · 06 62 21 65 68' },
	{ name: 'Kinésithérapeutes ostéopathes', category: 'Santé', desc: 'Audrey Bouchet-Laduron, Clément Legouffe Lagros, Quentin Bardaud.', phone: '09 87 10 79 46' },
	{ name: 'Dentistes — Dr Isabelle Lalo, Dr Aurélie Boirleaud', category: 'Santé', desc: 'Soins dentaires au cabinet médical.', phone: '05 19 56 89 66' },
	{ name: 'Orthophoniste — Mme Durand', category: 'Santé', desc: 'Maison Communale, 1 rue du Lavoir.', address: '1 rue du Lavoir, 87260 Saint-Hilaire-Bonneval' },
	{ name: 'Psychologue — Mme Méaume', category: 'Santé', desc: 'Maison Communale, 1 rue du Lavoir.', address: '1 rue du Lavoir, 87260 Saint-Hilaire-Bonneval', phone: '06 74 05 25 65' },
	{ name: "L'Adéquate — Bar restaurant traiteur", category: 'Restauration', desc: 'Aurélien Demars. Restaurant, bar et service traiteur au bourg.', address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval', phone: '05 55 00 61 67', email: 'www.ladequate.fr' },
	{ name: 'Boulangerie Saint Hilaire', category: 'Alimentation', desc: 'Boulangerie pâtisserie au cœur du bourg.', address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval', phone: '05 55 30 55 48' },
	{ name: 'Mme Carmen Coteur — Coiffeuse', category: 'Beauté', address: 'Le Vert Vallon, 87260 Saint-Hilaire-Bonneval', phone: '06 18 88 17 72' },
	{ name: 'Mme Evelyne Cheminade — Coiffeuse', category: 'Beauté', address: 'Leysserie, 87260 Saint-Hilaire-Bonneval', phone: '05 55 09 60 79 · 06 76 69 56 18' },
	{ name: 'Garage SARL Lachenaud', category: 'Garages - mécanique', desc: 'Mécanique automobile, entretien et réparation.', address: 'La Gare, 87260 Saint-Hilaire-Bonneval', phone: '05 55 00 92 92' },
	{ name: 'Philippe Tardieux — Réparation engins TP & agricoles', category: 'Garages - mécanique', address: 'Le Masgardaud, 87260 Saint-Hilaire-Bonneval', phone: '06 78 29 16 39' },
	{ name: 'Renov Math — Plomberie & revêtement', category: 'Artisans & entreprises', desc: 'Matthieu Tullet — plomberie et revêtements.', address: '17 chemin du Petit Bellevue, 87260 Saint-Hilaire-Bonneval', phone: '06 83 63 41 35', email: 'contact@renovmath.fr' },
	{ name: 'EURL Manus Christophe — Couverture, charpente, zinguerie', category: 'Artisans & entreprises', desc: 'Couverture, charpente, zinguerie, isolation.', address: 'La Plaine, 87260 Saint-Hilaire-Bonneval', phone: '06 09 37 15 39' },
	{ name: 'Luc Riffaud — Couverture, charpente, zinguerie', category: 'Artisans & entreprises', address: "L'Age, 87260 Saint-Hilaire-Bonneval", phone: '06 40 64 75 30' },
	{ name: 'Boris Nadaud — Travaux publics', category: 'Artisans & entreprises', address: 'Route de la Gare, 87260 Saint-Hilaire-Bonneval', phone: '05 55 00 86 37' },
	{ name: 'SARL Nadaud — Maçonnerie', category: 'Artisans & entreprises', address: 'La Gare, 87260 Saint-Hilaire-Bonneval', phone: '05 55 00 60 42' },
	{ name: 'Edibat Construction — Maçonnerie', category: 'Artisans & entreprises', address: 'La Croix, 87260 Saint-Hilaire-Bonneval', phone: '05 55 30 44 08' },
	{ name: 'LCD Menuiserie', category: 'Artisans & entreprises', desc: 'Menuiserie, agencement.', address: 'Le Bourg, 87260 Saint-Hilaire-Bonneval', phone: '05 55 09 55 01' },
	{ name: 'SAS Financière — Écurie (M. Montel)', category: 'Autres', desc: 'Écurie, activités équestres.', address: 'Le Treuil, 87260 Saint-Hilaire-Bonneval', phone: '06 80 73 33 01' },
	{ name: 'Les Chevaux de Moncontour', category: 'Autres', desc: 'Compétitions de chevaux.', phone: '06 77 04 00 58', email: 'leschevauxdemoncontour.com' },
	{ name: 'Les Sabots de Laine', category: 'Autres', desc: "Ferme pédagogique, production biologique, vente directe, gîte d'enfants, accueil à la ferme, séjours et animations. Cécile et Jean-Louis Brunet.", address: 'Le Pouyol, 87260 Saint-Hilaire-Bonneval', phone: '05 55 09 61 13 · 06 83 07 79 66' },
	{ name: 'Éditions Passtime', category: 'Autres', desc: "Maison d'édition. Mme Céline Courtaud.", address: 'Résidence les Tandaridiers, 87260 Saint-Hilaire-Bonneval', phone: '06 87 56 31 24' },
	{ name: 'Pôle de Lanaud — JM Alcover, M. Gambarotto', category: 'Autres', address: 'Lanaud, 87260 Saint-Hilaire-Bonneval', phone: '05 55 06 46 00' },
	{ name: 'Henriette Faye — Traductrice', category: 'Autres', address: 'Le Puybaraud, 87260 Saint-Hilaire-Bonneval', phone: '05 55 00 96 25' },
];
