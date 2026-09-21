import type { Payload } from 'payload';
import { paragraphsToRichText } from '../shared/lib/richText';

// "Je veux que chaque nouveau domaine, donc nouveau tenant, ait de base
// toutes les pages que nous retrouvons sur edito, app et accueillant. Ce
// sont les mêmes schéma de données, juste le templating qui change." Les 3
// thèmes partagent le même schéma `pages` (Payload) — seuls Le Préau et
// Le Belvédère ne le consomment pas encore au rendu (pages 100% statiques,
// décision 96) ; ce seed reste donc utile pour les 3, en préparation de leur
// branchement à venir.
//
// Contenu volontairement générique/à personnaliser — pas le contenu réel
// d'une commune (voir `scripts/seed.ts`, qui reprend lui le contenu réel de
// Saint-Hilaire-Bonneval). Les 18 pages listées ici sont le catalogue complet
// des gabarits du produit (voir PAYLOAD-CMS.md, "Catalogue des gabarits").
//
// Ordre de création : les 17 pages simples d'abord, "Accueil" en dernier —
// ses tuiles d'accès rapide (`quickAccessItems[].lien`) sont des relations
// obligatoires vers d'autres pages, qui doivent donc déjà exister.
export async function seedDefaultPagesForTenant(
	payload: Payload,
	tenantId: string | number,
	req?: Parameters<Payload['create']>[0]['req']
) {
	// `req` doit être propagé à chaque `create` : le tenant vient d'être créé
	// DANS LA MÊME transaction (celle de la requête `afterChange` qui appelle
	// cette fonction) et n'est pas encore commité. Sans `req`, chaque `create`
	// ouvre sa propre transaction, qui ne voit pas encore la ligne `tenant`
	// non commitée — confirmé en le testant réellement (violation de la
	// contrainte de clé étrangère `pages_tenant_id_tenants_id_fk`).
	const create = (data: Record<string, unknown>) =>
		payload.create({ collection: 'pages', data: { ...data, tenant: tenantId }, overrideAccess: true, req });

	const texteAPersonnaliser = paragraphsToRichText(['Texte à personnaliser dans l’administration.']);

	const contact = await create({ title: 'Contact', slug: 'contact', menu: 'essentiel', gabarit: 'contact' });
	const demarches = await create({
		title: 'Mes démarches',
		slug: 'demarches',
		menu: 'essentiel',
		gabarit: 'liste',
		liste: { layoutType: 'demarches' }
	});
	const numerosUtiles = await create({
		title: 'Numéros utiles',
		slug: 'numeros-utiles',
		menu: 'essentiel',
		gabarit: 'numeros-utiles'
	});
	const laCommune = await create({
		title: 'La commune',
		slug: 'vivre/la-commune',
		menu: 'commune',
		gabarit: 'editorial',
		editorial: {
			sections: [{ blockType: 'texteCentre', titre: 'La commune aujourd’hui', corps: texteAPersonnaliser }]
		}
	});
	await create({
		title: 'Histoire',
		slug: 'histoire',
		menu: 'tourisme',
		gabarit: 'editorial',
		editorial: {
			sections: [{ blockType: 'texteCentre', titre: 'Histoire de la commune', corps: texteAPersonnaliser }]
		}
	});
	await create({
		title: 'Commerces, artisans & santé',
		slug: 'commerces',
		menu: 'commune',
		gabarit: 'liste',
		liste: { layoutType: 'annuaire' }
	});
	await create({
		title: 'Vie associative',
		slug: 'vivre/vie-associative',
		menu: 'commune',
		gabarit: 'liste',
		liste: { layoutType: 'annuaire' }
	});
	await create({
		title: 'Enfance & jeunesse',
		slug: 'vivre/enfance-jeunesse',
		menu: 'commune',
		gabarit: 'liste',
		liste: { layoutType: 'annuaire' }
	});
	await create({
		title: 'Sports & loisirs',
		slug: 'vivre/sports-loisirs',
		menu: 'commune',
		gabarit: 'liste',
		liste: { layoutType: 'annuaire' }
	});
	await create({ title: 'Agenda', slug: 'agenda', menu: 'essentiel', gabarit: 'liste', liste: { layoutType: 'agenda' } });
	await create({
		title: 'Actualités',
		slug: 'mairie/actualites',
		menu: 'mairie',
		gabarit: 'liste',
		liste: { layoutType: 'actualites' }
	});
	await create({
		title: 'Documents & publications',
		slug: 'mairie/publications',
		menu: 'mairie',
		gabarit: 'liste',
		liste: { layoutType: 'document' }
	});
	await create({
		title: 'Budget & projets',
		slug: 'mairie/budget-projets',
		menu: 'mairie',
		gabarit: 'liste',
		liste: { layoutType: 'budget-projet' }
	});
	await create({ title: 'Le maire & les élus', slug: 'mairie/maire-elus', menu: 'mairie', gabarit: 'trombinoscope' });
	await create({ title: 'Location de salles', slug: 'location-salle', menu: 'commune', gabarit: 'catalogue-lieux' });
	await create({ title: 'Horaires & informations', slug: 'mairie/horaires', menu: 'mairie', gabarit: 'horaires' });
	await create({
		title: 'Carte interactive',
		slug: 'tourisme/carte-interactive',
		menu: 'tourisme',
		gabarit: 'carte-interactive'
	});

	await create({
		title: 'Accueil',
		slug: 'accueil',
		menu: 'essentiel',
		gabarit: 'accueil',
		accueil: {
			hero: {
				titre: 'Bienvenue sur le site de votre commune.',
				description:
					'Texte de présentation à personnaliser — retrouvez ici les démarches, l’actualité et les informations utiles de la commune.',
				boutonPrincipalLabel: 'Effectuer une démarche',
				boutonPrincipalLien: demarches.id,
				boutonSecondaireLabel: 'Découvrir la commune',
				boutonSecondaireLien: laCommune.id
			},
			quickAccessItems: [
				{ titre: 'Démarches administratives', description: 'Texte à personnaliser.', lien: demarches.id },
				{ titre: 'Contact', description: 'Texte à personnaliser.', lien: contact.id },
				{ titre: 'Numéros utiles', description: 'Texte à personnaliser.', lien: numerosUtiles.id }
			],
			mayorWord: {
				citation: 'Le mot du maire à personnaliser.',
				nomSignataire: 'Le Maire'
			},
			discoverCards: [
				{ titre: 'Titre à personnaliser', description: 'Description à personnaliser.' },
				{ titre: 'Titre à personnaliser', description: 'Description à personnaliser.' },
				{ titre: 'Titre à personnaliser', description: 'Description à personnaliser.' }
			],
			cta: {
				titre: 'Nous contacter',
				description: 'Texte à personnaliser.',
				boutonLabel: 'Nous contacter'
			}
		}
	});
}
