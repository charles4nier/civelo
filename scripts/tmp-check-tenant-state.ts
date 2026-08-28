import { getPayload } from 'payload';
import config from '../payload.config';

const domain = process.argv[2];
const payload = await getPayload({ config });

const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: domain } }, overrideAccess: true });
const tenant = tenants[0];
if (!tenant) { console.log('TENANT_NOT_FOUND'); process.exit(1); }

const { docs: cats } = await payload.find({ collection: 'categories', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false, overrideAccess: true });
const { docs: pois } = await payload.find({ collection: 'pois', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false, overrideAccess: true });
const { docs: sentiers } = await payload.find({ collection: 'sentiers', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false, overrideAccess: true });
console.log(`COUNTS categories=${cats.length} pois=${pois.length} sentiers=${sentiers.length}`);

const { docs: pages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenant.id } }, depth: 0, limit: 100, overrideAccess: true });
for (const p of pages as any[]) {
	if (p.slug === 'accueil') continue;
	let n = 0;
	if (p.gabarit === 'liste') {
		n = (p.liste?.itemsAnnuaire?.length ?? 0) + (p.liste?.itemsDemarches?.length ?? 0) + (p.liste?.itemsActualites?.length ?? 0) + (p.liste?.itemsDocument?.length ?? 0) + (p.liste?.itemsBudgetProjet?.length ?? 0) + (p.liste?.itemsAgenda?.length ?? 0);
	} else if (p.gabarit === 'trombinoscope') {
		n = p.trombinoscope?.membres?.length ?? 0;
	} else if (p.gabarit === 'catalogue-lieux') {
		n = p.catalogueLieux?.salles?.length ?? 0;
	} else if (p.gabarit === 'editorial') {
		n = p.editorial?.sections?.length ?? 0;
	} else if (p.gabarit === 'contact') {
		n = p.contact?.adresse ? 1 : 0;
	} else if (p.gabarit === 'numeros-utiles') {
		n = (p.numerosUtiles?.urgences?.length ?? 0) + (p.numerosUtiles?.contactsLocaux?.length ?? 0);
	} else if (p.gabarit === 'horaires') {
		n = p.horaires?.contactsPratiques?.length ?? 0;
	} else if (p.gabarit === 'carte-interactive') {
		n = pois.length + sentiers.length;
	}
	console.log(`PAGE slug=${p.slug} gabarit=${p.gabarit} itemCount=${n}`);
}
process.exit(0);
