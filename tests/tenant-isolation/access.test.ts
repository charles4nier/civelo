import { describe, it, expect, beforeAll } from 'vitest';
import { seedTenants, type Seeded } from './_seed';

// Étape 10 du plan multi-tenant — vérifie le contrôle d'accès RÉEL de
// Payload (pas `lib/payload.ts`) : un utilisateur de la commune A ne doit
// jamais pouvoir lister, lire par ID, ni modifier un document de la
// commune B, sur les collections scopées par le plugin multi-tenant.
let s: Seeded;

beforeAll(async () => {
	s = await seedTenants();
});

describe('isolation — collection pages (scopée par le plugin multi-tenant)', () => {
	it("la liste de l'éditeur A ne contient jamais de page de B", async () => {
		const { docs } = await s.payload.find({
			collection: 'pages',
			user: s.userA,
			overrideAccess: false,
			limit: 0,
			pagination: false
		});
		expect(docs.some((d) => String((d as { id: unknown }).id) === String(s.pageB.id))).toBe(false);
	});

	it("l'éditeur A ne peut pas lire la page de B par ID", async () => {
		await expect(
			s.payload.findByID({
				collection: 'pages',
				id: s.pageB.id,
				user: s.userA,
				overrideAccess: false
			})
		).rejects.toThrow();
	});

	it("l'éditeur A ne peut pas modifier la page de B", async () => {
		await expect(
			s.payload.update({
				collection: 'pages',
				id: s.pageB.id,
				data: { title: 'Modifié par A — ne devrait jamais passer' },
				user: s.userA,
				overrideAccess: false
			})
		).rejects.toThrow();
	});

	it('l\'éditeur A peut bien lire SA propre page', async () => {
		const doc = await s.payload.findByID({
			collection: 'pages',
			id: s.pageA.id,
			user: s.userA,
			overrideAccess: false
		});
		expect(String((doc as { id: unknown }).id)).toBe(String(s.pageA.id));
	});
});

describe('isolation — collection users (Where scopé fait main, pas le plugin)', () => {
	it("l'admin/éditeur A ne voit jamais l'utilisateur de B dans une liste", async () => {
		const { docs } = await s.payload.find({
			collection: 'users',
			user: s.userA,
			overrideAccess: false,
			limit: 0,
			pagination: false
		});
		expect(docs.some((d) => String((d as { id: unknown }).id) === String(s.userB.id))).toBe(false);
	});

	it("l'éditeur A ne peut pas modifier le compte de l'éditeur B", async () => {
		await expect(
			s.payload.update({
				collection: 'users',
				id: s.userB.id,
				data: { nom: 'Modifié par A — ne devrait jamais passer' },
				user: s.userA,
				overrideAccess: false
			})
		).rejects.toThrow();
	});
});
