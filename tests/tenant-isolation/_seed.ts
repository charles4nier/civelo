import { getPayload, type Payload } from 'payload';
import config from '../../payload.config';

// Étape 10 du plan multi-tenant — seed partagé par les tests d'isolation :
// 2 communes de test (A, B), un document distinctif par collection scopée
// par tenant, plus un utilisateur `editeur` par commune pour exercer le
// contrôle d'accès réel (pas de mock — la garantie qu'on teste, c'est que
// la vraie base filtre correctement).
export type Seeded = Awaited<ReturnType<typeof seedTenants>>;

async function upsertTenant(payload: Payload, domaine: string, nom: string) {
	const { docs } = await payload.find({
		collection: 'tenants',
		where: { domaine: { equals: domaine } },
		limit: 1,
		overrideAccess: true
	});
	if (docs[0]) return docs[0];
	return payload.create({
		collection: 'tenants',
		data: { nom, domaine, theme: 'atelier', palette: 'defaut', typographie: 'defaut', statutContrat: 'actif' },
		overrideAccess: true
	});
}

async function upsertPage(payload: Payload, tenantId: unknown, slug: string, telephone: string) {
	const { docs } = await payload.find({
		collection: 'pages',
		where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenantId } }] },
		limit: 1,
		overrideAccess: true
	});
	// La création du tenant sème déjà une page « contact » (sans téléphone,
	// `lib/seedDefaultPages.ts`) : on lui donne le numéro distinctif.
	if (docs[0]) {
		return payload.update({
			collection: 'pages',
			id: docs[0].id,
			data: { contact: { telephone } } as never,
			overrideAccess: true
		});
	}
	return payload.create({
		collection: 'pages',
		data: {
			title: 'Contact',
			slug,
			menu: 'essentiel',
			gabarit: 'contact',
			tenant: tenantId,
			contact: { telephone }
		} as never,
		overrideAccess: true
	});
}

async function upsertUser(payload: Payload, tenantId: unknown, email: string) {
	const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true });
	if (docs[0]) return docs[0];
	return payload.create({
		collection: 'users',
		data: {
			email,
			password: 'test-password-1234',
			prenom: 'Test',
			nom: 'Éditeur',
			role: 'editeur',
			tenants: [{ tenant: tenantId }]
		} as never,
		overrideAccess: true
	});
}

// Décision 98 — une fiche Actualités par commune, MÊME titre et MÊME date
// (donc même URL) : si un filtre `tenant` manquait, l'une passerait pour
// l'autre. Plus un brouillon dans A, qui ne doit jamais sortir hors aperçu.
async function upsertFiche(payload: Payload, tenantId: unknown, chapo: string, status: 'published' | 'draft', titre = 'Repas des aînés') {
	const { docs: pages } = await payload.find({
		collection: 'pages',
		where: { and: [{ slug: { equals: 'mairie/actualites' } }, { tenant: { equals: tenantId } }] },
		limit: 1,
		depth: 0,
		overrideAccess: true
	});
	const page = pages[0];
	if (!page) throw new Error('Page mairie/actualites absente du seed par défaut.');
	const { docs } = await payload.find({
		collection: 'fiches',
		where: { and: [{ titre: { equals: titre } }, { tenant: { equals: tenantId } }] },
		limit: 1,
		overrideAccess: true,
		draft: true
	});
	if (docs[0]) return docs[0];
	const { docs: cats } = await payload.find({
		collection: 'categories',
		where: { and: [{ page: { equals: page.id } }, { tenant: { equals: tenantId } }] },
		limit: 1,
		overrideAccess: true
	});
	const categorie =
		cats[0] ??
		(await payload.create({
			collection: 'categories',
			data: { nom: 'Vie locale', page: page.id, couleur: 'leaf', tenant: tenantId } as never,
			overrideAccess: true
		}));
	return payload.create({
		collection: 'fiches',
		data: { titre, chapo, page: page.id, categorie: categorie.id, date: '2026-10-11T10:00:00.000Z', _status: status } as never,
		overrideAccess: true
	});
}

export async function seedTenants() {
	const payload = await getPayload({ config });

	const tenantA = await upsertTenant(payload, 'tenant-a.test', 'Commune A (test)');
	const tenantB = await upsertTenant(payload, 'tenant-b.test', 'Commune B (test)');

	const pageA = await upsertPage(payload, tenantA.id, 'contact', '05 00 00 00 0A');
	const pageB = await upsertPage(payload, tenantB.id, 'contact', '05 00 00 00 0B');

	const userA = await upsertUser(payload, tenantA.id, 'editeur-a@tenant-isolation.test');
	const userB = await upsertUser(payload, tenantB.id, 'editeur-b@tenant-isolation.test');

	const ficheA = await upsertFiche(payload, tenantA.id, 'Actualité de A', 'published');
	const ficheB = await upsertFiche(payload, tenantB.id, 'Actualité de B', 'published');
	const brouillonA = await upsertFiche(payload, tenantA.id, 'Brouillon de A', 'draft', 'Brouillon secret');

	// Une redirection chez B seulement : elle ne doit jamais s'appliquer chez A.
	const { totalDocs: redirB } = await payload.count({
		collection: 'redirections',
		where: { and: [{ de: { equals: '/ancienne-adresse-b' } }, { tenant: { equals: tenantB.id } }] },
		overrideAccess: true
	});
	if (redirB === 0) {
		await payload.create({
			collection: 'redirections',
			data: { de: '/ancienne-adresse-b', cible: { relationTo: 'pages', value: pageB.id }, tenant: tenantB.id } as never,
			overrideAccess: true
		});
	}

	return { payload, tenantA, tenantB, pageA, pageB, userA, userB, ficheA, ficheB, brouillonA };
}
