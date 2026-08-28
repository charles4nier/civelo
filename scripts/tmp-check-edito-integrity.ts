import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
const { docs: tenants } = await payload.find({ collection: 'tenants', where: { domaine: { equals: 'edito.civelo.fr' } }, overrideAccess: true });
const tenant = tenants[0];
console.log(`TENANT id=${tenant.id} nom=${tenant.nom}`);

const { docs: media } = await payload.find({ collection: 'media', where: { tenant: { equals: tenant.id } }, limit: 0, pagination: false, depth: 0, overrideAccess: true });
console.log(`MEDIA_COUNT ${media.length}`);
for (const m of media as any[]) console.log(`  media id=${m.id} filename=${m.filename}`);

const { docs: accueil } = await payload.find({
	collection: 'pages',
	where: { and: [{ tenant: { equals: tenant.id } }, { gabarit: { equals: 'accueil' } }] },
	depth: 0,
	overrideAccess: true
});
const a = accueil[0] as any;
console.log(`ACCUEIL hero.image=${a?.accueil?.hero?.image} hero.titre=${JSON.stringify(a?.accueil?.hero?.titre)}`);
console.log(`ACCUEIL mayorWord.image=${a?.accueil?.mayorWord?.image}`);
console.log(`ACCUEIL discoverCards.images=${(a?.accueil?.discoverCards ?? []).map((c: any) => c.image).join(',')}`);

const { docs: allPages } = await payload.find({ collection: 'pages', where: { tenant: { equals: tenant.id } }, limit: 100, depth: 0, overrideAccess: true });
console.log(`PAGE_COUNT ${allPages.length}`);
process.exit(0);
