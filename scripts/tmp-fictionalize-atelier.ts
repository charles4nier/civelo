import { getPayload } from 'payload';
import config from '../payload.config';

// Remplace les commerces/artisans, donnees ecole/petite enfance et elus
// municipaux de L'Atelier Exemple (copies fidelement depuis Saint-Hilaire-
// Bonneval lors de la migration) par du contenu generique/fictif coherent
// avec l'identite "Saint-Martin" deja creee dans le tenant. Les noms/
// adresses/telephones reels de praticiens, artisans, agents municipaux et
// assistantes maternelles ne doivent pas rester exposes sur un site de
// demo public.

const FAKE_NOMS = [
	'Dubois', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David',
	'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'Lefevre',
	'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Faure', 'Rousseau', 'Blanc',
	'Guerin', 'Muller', 'Henry', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Marchand'
];
const FAKE_PRENOMS = [
	'Marie', 'Pierre', 'Jean', 'Sophie', 'Nicolas', 'Isabelle', 'Laurent', 'Claire',
	'Thomas', 'Julie', 'Francois', 'Nathalie', 'Michel', 'Catherine', 'Olivier',
	'Sylvie', 'Patrick', 'Aurelie', 'Eric', 'Caroline', 'Vincent', 'Emilie',
	'Bernard', 'Sandrine', 'Alain', 'Christine', 'Philippe', 'Valerie', 'Daniel', 'Celine'
];
const FAKE_RUES = [
	'rue du Lavoir', 'rue des Ecoles', 'chemin des Vignes', 'place de la Mairie',
	'rue de la Fontaine', 'route de Limoges', 'impasse des Tilleuls', 'rue Haute',
	'chemin du Moulin', 'allee des Peupliers'
];

function fakeName(i: number) {
	return `${FAKE_PRENOMS[i % FAKE_PRENOMS.length]} ${FAKE_NOMS[(i * 7 + 3) % FAKE_NOMS.length].toUpperCase()}`;
}
function fakeAddress(i: number) {
	return `${(i % 30) + 1} ${FAKE_RUES[i % FAKE_RUES.length]}, 87000 Saint-Martin`;
}
function fakePhone(i: number) {
	const n = 10 + (i % 90);
	return `05 00 00 ${String(n).padStart(2, '0')} ${String((i * 3) % 90).padStart(2, '0')}`;
}

// Gabarits generiques par categorie (deduits du contenu observe) — le nom
// reel de la categorie n'est pas relu ici, seul l'id est disponible, donc on
// mappe par id constate lors de l'inspection plutot que par nom.
const COMMERCE_TEMPLATES: Record<number, (i: number) => { nom: string; description: string }> = {
	127: (i) => ({ nom: `Cabinet médical — Dr ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Professionnel de santé au cabinet médical de la commune.' }),
	126: (i) => ({ nom: `Le Bourg — Bar restaurant`, description: 'Restaurant, bar et service traiteur au bourg.' }),
	125: () => ({ nom: `Boulangerie du Bourg`, description: 'Boulangerie pâtisserie au cœur du bourg.' }),
	124: (i) => ({ nom: `${fakeName(i)} — Coiffeur·se`, description: 'Salon de coiffure.' }),
	123: (i) => ({ nom: `Garage ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Mécanique automobile, entretien et réparation.' }),
	122: (i) => ({ nom: `${FAKE_NOMS[i % FAKE_NOMS.length]} Bâtiment`, description: 'Artisan du bâtiment (maçonnerie, couverture, plomberie, menuiserie selon activité).' }),
	121: (i) => ({ nom: `${fakeName(i)}`, description: "Activité locale (artisanat, agriculture, service)." })
};
const ECOLE_TEMPLATES: Record<number, (i: number) => { nom: string; description: string }> = {
	137: () => ({ nom: `École primaire de Saint-Martin`, description: 'Direction et équipe pédagogique de l’école communale.' }),
	136: () => ({ nom: `Micro-crèche de Saint-Martin`, description: 'Accueil des jeunes enfants.' }),
	135: () => ({ nom: `Centre de loisirs (CLSH)`, description: 'Accueil de loisirs pour les enfants de la commune.' }),
	134: (i) => ({ nom: `Assistante maternelle agréée ${i + 1}`, description: '' })
};

function fictionalizeItems(items: any[], templates: Record<number, (i: number) => { nom: string; description: string }>) {
	return items.map((it: any, i: number) => {
		const tpl = templates[it.categorie];
		const { nom, description } = tpl ? tpl(i) : { nom: fakeName(i), description: '' };
		return {
			...it,
			nom,
			description: description || null,
			adresse: it.adresse ? fakeAddress(i) : it.adresse,
			telephone: it.telephone ? fakePhone(i) : it.telephone,
			email: null,
			siteWeb: null
		};
	});
}

async function main() {
	const payload = await getPayload({ config });
	const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'atelier.civelo.fr' } }, depth: 0, overrideAccess: true });
	const tenant = tenants[0] as any;

	for (const [slug, templates] of [
		['commerces', COMMERCE_TEMPLATES],
		['vivre/enfance-jeunesse', ECOLE_TEMPLATES]
	] as const) {
		const { docs: pages } = await payload.find({
			collection: 'pages',
			where: { tenant: { equals: tenant.id }, slug: { equals: slug } },
			depth: 0,
			limit: 1,
			overrideAccess: true
		});
		const page = pages[0] as any;
		if (!page) {
			console.log(`  ⚠ page "${slug}" introuvable, ignorée.`);
			continue;
		}
		const liste = { ...page.liste, itemsAnnuaire: fictionalizeItems(page.liste.itemsAnnuaire ?? [], templates) };
		await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { liste } });
		console.log(`  ✓ ${slug} : ${liste.itemsAnnuaire.length} fiches fictionalisées.`);
	}

	// Élus — remplace uniquement les noms (fonction/role/commissions restent,
	// ce sont des intitulés génériques, pas des données personnelles).
	const { docs: eluPages } = await payload.find({
		collection: 'pages',
		where: { tenant: { equals: tenant.id }, slug: { equals: 'mairie/maire-elus' } },
		depth: 0,
		limit: 1,
		overrideAccess: true
	});
	const eluPage = eluPages[0] as any;
	if (eluPage) {
		const membres = (eluPage.trombinoscope.membres ?? []).map((m: any, i: number) => ({
			...m,
			nom: fakeName(i),
			note: m.role === 'maire' ? m.note : null,
			email: null
		}));
		const trombinoscope = { ...eluPage.trombinoscope, membres };
		await payload.update({ collection: 'pages', id: eluPage.id, overrideAccess: true, data: { trombinoscope } });
		console.log(`  ✓ mairie/maire-elus : ${membres.length} élus fictionalisés.`);
	}

	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
