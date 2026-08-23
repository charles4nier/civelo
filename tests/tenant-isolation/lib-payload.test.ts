import { describe, it, expect, beforeAll, vi } from 'vitest';
import { seedTenants, type Seeded } from './_seed';

// Étape 10 du plan multi-tenant — le point le plus important de toute la
// suite (voir décision 90/le plan) : `Pages`/`Media`/`Documents`/`Pois`/
// `Sentiers` ont un accès `read: () => true` (site public, non
// authentifié). Le contrôle d'accès de Payload — testé dans `access.test.ts`
// — ne protège donc PAS le site public : toute la garantie d'isolation
// pour un visiteur anonyme repose sur le fait que chaque fonction de
// `lib/payload.ts` ajoute bien son filtre `tenant`. C'est ÇA qu'on teste
// ici, en appelant les vraies fonctions, pas la couche d'accès Payload.
//
// `getCurrentTenant` lit `headers()` (next/headers), indisponible hors
// d'une vraie requête Next.js — mocké pour fixer le tenant résolu à A,
// sans quoi ces fonctions ne pourraient jamais être testées hors serveur.
let s: Seeded;
let tenantAId: unknown;

vi.mock('@shared/lib/tenant', () => ({
	getCurrentTenant: vi.fn(async () => ({ id: tenantAId, domaine: 'tenant-a.test' }))
}));

beforeAll(async () => {
	s = await seedTenants();
	tenantAId = s.tenantA.id;
});

describe('isolation — lib/payload.ts (tenant A résolu)', () => {
	it("getPageBySlug ne renvoie jamais la page de B, même en cas de collision de slug", async () => {
		const { getPageBySlug } = await import('../../lib/payload');
		const page = await getPageBySlug('contact');
		expect(page).not.toBeNull();
		expect(String((page as { id: unknown }).id)).toBe(String(s.pageA.id));
		expect(String((page as { id: unknown }).id)).not.toBe(String(s.pageB.id));
	});

	it('getContactData renvoie bien les coordonnées de A, pas celles de B', async () => {
		const { getContactData } = await import('../../lib/payload');
		const data = await getContactData('contact');
		expect(data).not.toBeNull();
		const phoneCard = data?.cards.find((c) => c.key === 'phone');
		expect(phoneCard?.name).toBe('05 00 00 00 0A');
		expect(phoneCard?.name).not.toBe('05 00 00 00 0B');
	});

	it("getNavLinks n'inclut jamais une page de B dans le menu", async () => {
		const { getNavLinks } = await import('../../lib/payload');
		const links = await getNavLinks();
		const allHrefs = links.flatMap((l) => l.children.map((c) => c.href));
		// La page de B a le même slug ("contact") — si le filtre tenant
		// manquait, elle apparaîtrait en double ou remplacerait celle de A.
		const contactLinks = allHrefs.filter((h) => h === '/contact');
		expect(contactLinks.length).toBeLessThanOrEqual(1);
	});
});
