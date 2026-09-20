import { getPayload } from 'payload';
import config from '../payload.config';

// Meme traitement que tmp-fictionalize-atelier.ts (deja execute), etendu a
// Belvedere/Preau Exemple (memes 25 commerces + 14 fiches ecole/petite
// enfance + 15 elus, copies du meme jeu de donnees source) et a Clocher
// Exemple (accueil seul concerne : commerces/ecole/elus y sont vides).

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

const COMMERCE_TEMPLATES: Record<number, (i: number) => { nom: string; description: string }> = {
	127: (i) => ({ nom: `Cabinet médical — Dr ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Professionnel de santé au cabinet médical de la commune.' }),
	126: () => ({ nom: `Le Bourg — Bar restaurant`, description: 'Restaurant, bar et service traiteur au bourg.' }),
	125: () => ({ nom: `Boulangerie du Bourg`, description: 'Boulangerie pâtisserie au cœur du bourg.' }),
	124: (i) => ({ nom: `${fakeName(i)} — Coiffeur·se`, description: 'Salon de coiffure.' }),
	123: (i) => ({ nom: `Garage ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Mécanique automobile, entretien et réparation.' }),
	122: (i) => ({ nom: `${FAKE_NOMS[i % FAKE_NOMS.length]} Bâtiment`, description: 'Artisan du bâtiment (maçonnerie, couverture, plomberie, menuiserie selon activité).' }),
	121: (i) => ({ nom: `${fakeName(i)}`, description: 'Activité locale (artisanat, agriculture, service).' }),
	// Mêmes id de catégories décalés sur Belvédère/Préau — mappés par position
	// plutôt que par id exact (constaté : mêmes libellés, ids différents).
	87: (i) => ({ nom: `Cabinet médical — Dr ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Professionnel de santé au cabinet médical de la commune.' }),
	86: () => ({ nom: `Le Bourg — Bar restaurant`, description: 'Restaurant, bar et service traiteur au bourg.' }),
	85: () => ({ nom: `Boulangerie du Bourg`, description: 'Boulangerie pâtisserie au cœur du bourg.' }),
	84: (i) => ({ nom: `${fakeName(i)} — Coiffeur·se`, description: 'Salon de coiffure.' }),
	83: (i) => ({ nom: `Garage ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Mécanique automobile, entretien et réparation.' }),
	82: (i) => ({ nom: `${FAKE_NOMS[i % FAKE_NOMS.length]} Bâtiment`, description: 'Artisan du bâtiment (maçonnerie, couverture, plomberie, menuiserie selon activité).' }),
	81: (i) => ({ nom: `${fakeName(i)}`, description: 'Activité locale (artisanat, agriculture, service).' }),
	47: (i) => ({ nom: `Cabinet médical — Dr ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Professionnel de santé au cabinet médical de la commune.' }),
	46: () => ({ nom: `Le Bourg — Bar restaurant`, description: 'Restaurant, bar et service traiteur au bourg.' }),
	45: () => ({ nom: `Boulangerie du Bourg`, description: 'Boulangerie pâtisserie au cœur du bourg.' }),
	44: (i) => ({ nom: `${fakeName(i)} — Coiffeur·se`, description: 'Salon de coiffure.' }),
	43: (i) => ({ nom: `Garage ${FAKE_NOMS[i % FAKE_NOMS.length]}`, description: 'Mécanique automobile, entretien et réparation.' }),
	42: (i) => ({ nom: `${FAKE_NOMS[i % FAKE_NOMS.length]} Bâtiment`, description: 'Artisan du bâtiment (maçonnerie, couverture, plomberie, menuiserie selon activité).' }),
	41: (i) => ({ nom: `${fakeName(i)}`, description: 'Activité locale (artisanat, agriculture, service).' })
};
const ECOLE_TEMPLATES: Record<number, (i: number) => { nom: string; description: string }> = {
	137: () => ({ nom: 'École primaire de Saint-Martin', description: 'Direction et équipe pédagogique de l’école communale.' }),
	136: () => ({ nom: 'Micro-crèche de Saint-Martin', description: 'Accueil des jeunes enfants.' }),
	135: () => ({ nom: 'Centre de loisirs (CLSH)', description: 'Accueil de loisirs pour les enfants de la commune.' }),
	134: (i) => ({ nom: `Assistante maternelle agréée ${i + 1}`, description: '' }),
	97: () => ({ nom: 'École primaire de Saint-Martin', description: 'Direction et équipe pédagogique de l’école communale.' }),
	96: () => ({ nom: 'Micro-crèche de Saint-Martin', description: 'Accueil des jeunes enfants.' }),
	95: () => ({ nom: 'Centre de loisirs (CLSH)', description: 'Accueil de loisirs pour les enfants de la commune.' }),
	94: (i) => ({ nom: `Assistante maternelle agréée ${i + 1}`, description: '' }),
	57: () => ({ nom: 'École primaire de Saint-Martin', description: 'Direction et équipe pédagogique de l’école communale.' }),
	56: () => ({ nom: 'Micro-crèche de Saint-Martin', description: 'Accueil des jeunes enfants.' }),
	55: () => ({ nom: 'Centre de loisirs (CLSH)', description: 'Accueil de loisirs pour les enfants de la commune.' }),
	54: (i) => ({ nom: `Assistante maternelle agréée ${i + 1}`, description: '' })
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

async function fictionalizeListPage(payload: any, tenantId: number, slug: string, templates: any) {
	const { docs: pages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenantId }, slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: true });
	const page = pages[0] as any;
	if (!page || !page.liste?.itemsAnnuaire?.length) {
		console.log(`  - ${slug} : rien à faire (vide ou introuvable).`);
		return;
	}
	const liste = { ...page.liste, itemsAnnuaire: fictionalizeItems(page.liste.itemsAnnuaire, templates) };
	await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { liste } });
	console.log(`  ✓ ${slug} : ${liste.itemsAnnuaire.length} fiches fictionalisées.`);
}

async function fictionalizeElus(payload: any, tenantId: number) {
	const { docs: pages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenantId }, slug: { equals: 'mairie/maire-elus' } }, depth: 0, limit: 1, overrideAccess: true });
	const page = pages[0] as any;
	if (!page || !page.trombinoscope?.membres?.length) {
		console.log('  - mairie/maire-elus : rien à faire (vide ou introuvable).');
		return;
	}
	const membres = page.trombinoscope.membres.map((m: any, i: number) => ({ ...m, nom: fakeName(i), note: m.role === 'maire' ? m.note : null, email: null }));
	await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { trombinoscope: { ...page.trombinoscope, membres } } });
	console.log(`  ✓ mairie/maire-elus : ${membres.length} élus fictionalisés.`);
}

async function fictionalizeClocherAccueil(payload: any, tenantId: number) {
	const { docs: pages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenantId }, slug: { equals: 'accueil' } }, depth: 0, limit: 1, overrideAccess: true });
	const page = pages[0] as any;
	if (!page) {
		console.log('  - accueil : introuvable.');
		return;
	}
	const accueil = {
		...page.accueil,
		hero: { ...page.accueil.hero, description: 'Saint-Martin, village du Limousin : toutes les informations, démarches et actualités pour simplifier votre quotidien.' },
		mayorWord: {
			...page.accueil.mayorWord,
			citation:
				"Saint-Martin, c'est l'histoire d'un village qui avance sans renier ses racines. Nous construisons une commune vivante, accueillante et solidaire, où chacun trouve sa place autour de nos services, de nos associations et de nos paysages."
		},
		cta: { ...page.accueil.cta, adresse: 'Le Bourg 87000 Saint-Martin', telephone: '05 XX XX XX XX', email: 'contact@saint-martin.fr' }
	};
	await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { accueil } });
	console.log('  ✓ accueil (hero/mot du maire/cta) fictionalisé.');
}

async function main() {
	const payload = await getPayload({ config });

	for (const domaine of ['belvedere.civelo.fr', 'preau.civelo.fr']) {
		const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: domaine } }, depth: 0, overrideAccess: true });
		const tenant = tenants[0] as any;
		if (!tenant) { console.log(`${domaine} introuvable.`); continue; }
		console.log(`=== ${domaine} (id ${tenant.id}) ===`);
		await fictionalizeListPage(payload, tenant.id, 'commerces', COMMERCE_TEMPLATES);
		await fictionalizeListPage(payload, tenant.id, 'vivre/enfance-jeunesse', ECOLE_TEMPLATES);
		await fictionalizeElus(payload, tenant.id);
	}

	{
		const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'clocher.civelo.fr' } }, depth: 0, overrideAccess: true });
		const tenant = tenants[0] as any;
		if (tenant) {
			console.log(`=== clocher.civelo.fr (id ${tenant.id}) ===`);
			await fictionalizeClocherAccueil(payload, tenant.id);
		}
	}

	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
