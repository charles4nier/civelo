import { getPayload } from 'payload';
import config from '../payload.config';

// Aligne le titre CMS (qui pilote le libellé du menu) de la page
// slug=commerces sur le nouveau libelle harmonise avec l'en-tete/SEO,
// desormais fixes en dur dans le code : "Commerces, artisans & sante".

const NEW_TITLE = 'Commerces, artisans & santé';

async function main() {
	const payload = await getPayload({ config });
	const { docs: pages } = await payload.find({
		collection: 'pages',
		where: { slug: { equals: 'commerces' } },
		depth: 0,
		limit: 0,
		pagination: false,
		overrideAccess: true
	});

	for (const page of pages as any[]) {
		if (page.title === NEW_TITLE) {
			console.log(`- tenant ${page.tenant} : deja a jour.`);
			continue;
		}
		await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { title: NEW_TITLE } });
		console.log(`✓ tenant ${page.tenant} : "${page.title}" -> "${NEW_TITLE}"`);
	}

	console.log('Terminé.');
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
