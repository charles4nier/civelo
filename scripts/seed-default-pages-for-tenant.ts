/**
 * Rattrapage pour un tenant existant créé AVANT le hook `afterChange` de
 * `collections/Tenants.ts` (ou créé directement en base, hors Local API,
 * donc sans déclencher ce hook) : applique le même seed de 18 pages
 * génériques que celui posé automatiquement à la création d'un nouveau
 * tenant (`lib/seedDefaultPages.ts`).
 *
 * N'écrase jamais un tenant qui a déjà au moins une page — usage :
 *   node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/seed-default-pages-for-tenant.ts <tenantId>
 */
import { getPayload } from 'payload';
import config from '../payload.config';
import { seedDefaultPagesForTenant } from '../lib/seedDefaultPages';

async function main() {
	const tenantId = process.argv[2];
	if (!tenantId) {
		console.error('Usage: seed-default-pages-for-tenant.ts <tenantId>');
		process.exit(1);
	}

	const payload = await getPayload({ config });

	const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true });
	if (!tenant) {
		console.error(`Aucun tenant avec l'id ${tenantId}.`);
		process.exit(1);
	}

	const existing = await payload.find({
		collection: 'pages',
		where: { tenant: { equals: tenantId } },
		limit: 1,
		overrideAccess: true
	});
	if (existing.totalDocs > 0) {
		console.error(`Le tenant "${tenant.nom}" (id ${tenantId}) a déjà des pages — abandon, pas de double seed.`);
		process.exit(1);
	}

	await seedDefaultPagesForTenant(payload, tenant.id);
	console.log(`Pages seedées pour "${tenant.nom}" (id ${tenantId}).`);
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
