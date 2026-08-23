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
		data: { nom, domaine, theme: 'style-edito', palette: 'defaut', typographie: 'defaut', statutContrat: 'actif' },
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
	if (docs[0]) return docs[0];
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

export async function seedTenants() {
	const payload = await getPayload({ config });

	const tenantA = await upsertTenant(payload, 'tenant-a.test', 'Commune A (test)');
	const tenantB = await upsertTenant(payload, 'tenant-b.test', 'Commune B (test)');

	const pageA = await upsertPage(payload, tenantA.id, 'contact', '05 00 00 00 0A');
	const pageB = await upsertPage(payload, tenantB.id, 'contact', '05 00 00 00 0B');

	const userA = await upsertUser(payload, tenantA.id, 'editeur-a@tenant-isolation.test');
	const userB = await upsertUser(payload, tenantB.id, 'editeur-b@tenant-isolation.test');

	return { payload, tenantA, tenantB, pageA, pageB, userA, userB };
}
