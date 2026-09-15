import type { Access, CollectionConfig } from 'payload';
import { getTenantAccess, getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities';
import { isSuperAdminField } from './access';
import { withInfo } from './Pages';

// Étape 9 du plan multi-tenant — les 2 fonctions d'accès faites main
// (`create`/`update`) n'avaient jusqu'ici aucun filtre de tenant (un
// `admin` pouvait techniquement créer/modifier n'importe quel utilisateur,
// sans conséquence tant qu'une seule commune existait). Repris pour qu'un
// admin ne puisse jamais toucher aux comptes d'une autre commune —
// `read`/`delete` deviennent des fonctions qui renvoient un `Where` scopé
// (via `getTenantAccess` du plugin), pas plus de simples booléens : sans
// ça, un admin de la commune A pourrait encore *lister* les utilisateurs de
// la commune B, juste pas les modifier.
const scopedToOwnTenants: Access = ({ req }) => {
	if (!req.user) return false;
	if (req.user.role === 'super-admin') return true;
	return getTenantAccess({ fieldName: 'tenants.tenant', user: req.user as never });
};

export const Users: CollectionConfig = {
	slug: 'users',
	auth: true,
	admin: {
		useAsTitle: 'email'
	},
	// 2026-08-28 — `tenants` (ajouté par le plugin, `tenantsArrayField`)
	// n'a, contrairement au champ `tenant` simple des autres collections,
	// aucun remplissage automatique à la création : il fallait le choisir à
	// la main, y compris pour un compte super-admin créé depuis la console
	// dédiée — confusant ("pourquoi rattacher ce compte à UNE commune ?") et
	// source d'un vrai bug (un compte créé sans tenant devenait invisible
	// dans les vues filtrées). Rattaché d'office au tenant "maison" de
	// l'équipe (`domaine` = `SUPER_ADMIN_DOMAIN`) quand rien n'est choisi.
	hooks: {
		beforeChange: [
			async ({ data, operation, req }) => {
				if (operation !== 'create') return data;
				if (Array.isArray(data.tenants) && data.tenants.length > 0) return data;
				const domaine = process.env.SUPER_ADMIN_DOMAIN;
				if (!domaine) return data;
				const { docs } = await req.payload.find({
					collection: 'tenants',
					where: { domaine: { equals: domaine } },
					limit: 1,
					overrideAccess: true
				});
				const homeTenant = docs[0];
				if (homeTenant) data.tenants = [{ tenant: homeTenant.id }];
				return data;
			}
		]
	},
	access: {
		read: scopedToOwnTenants,
		// admin (mairie) peut créer/modifier/supprimer, mais jamais accorder un
		// rôle égal ou supérieur au sien — évite qu'un admin mairie se
		// nomme lui-même super-admin ou promeuve un autre admin. Et jamais
		// pour une commune qui n'est pas la sienne.
		create: ({ req, data }) => {
			if (!req.user) return false;
			if (req.user.role === 'super-admin') return true;
			if (req.user.role !== 'admin') return false;
			// Payload évalue aussi cette fonction SANS `data` (ex.
			// `getAccessResults` avec `fetchData: false`) pour décider
			// d'afficher le bouton "Créer nouveau" — sans ce cas, un admin
			// mairie légitime ne voyait jamais ce bouton (bug réel constaté
			// le 2026-09-15) car `getUserTenantIDs(undefined)` renvoie
			// toujours `[]`. La vraie validation reste faite plus bas,
			// contre les données réellement soumises à la création.
			if (!data) return true;
			if (data?.role && data.role !== 'editeur') return false;

			const adminTenantIds = getUserTenantIDs(req.user as never);
			const newUserTenantIds = getUserTenantIDs(data as never);
			return newUserTenantIds.length > 0 && newUserTenantIds.every((id) => adminTenantIds.includes(id));
		},
		update: ({ req, data, id }) => {
			if (!req.user) return false;
			if (req.user.role === 'super-admin') return true;
			if (req.user.role === 'admin') {
				// data?.role absent = pas de changement de rôle demandé, autorisé
				if (data?.role && data.role !== 'editeur') return false;
				// Where scopé : Payload l'évalue contre le document ciblé — un
				// admin ne peut modifier que les utilisateurs d'une commune où
				// il a lui-même accès.
				return getTenantAccess({ fieldName: 'tenants.tenant', user: req.user as never });
			}
			return req.user.id === id;
		},
		delete: scopedToOwnTenants
	},
	fields: [
		// Décision 69 — nom/prénom pour le "Bonjour {prénom}" du tableau de
		// bord sur-mesure (admin/Dashboard) ; jusqu'ici seul l'email existait.
		withInfo(
			{ name: 'prenom', type: 'text', required: true, label: 'Prénom' },
			'Utilisé pour vous saluer sur le tableau de bord.'
		),
		withInfo({ name: 'nom', type: 'text', required: true, label: 'Nom' }, 'Votre nom de famille.'),
		// Décision 74 — avatar affiché dans le pied de la sidebar
		// (`admin/Nav`), repli sur l'initiale de l'email si absent.
		withInfo(
			{ name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo' },
			"Votre photo, affichée en bas de la barre de navigation (optionnel)."
		),
		withInfo(
			{
				name: 'role',
				type: 'select',
				required: true,
				defaultValue: 'editeur',
				access: {
					// Seul un super-admin peut changer un rôle après coup — cohérent
					// avec la restriction déjà posée sur `create`/`update` ci-dessus.
					update: isSuperAdminField
				},
				options: [
					{ label: 'Super-admin (dev/vendeur)', value: 'super-admin' },
					{ label: 'Admin (mairie)', value: 'admin' },
					{ label: 'Éditeur mairie', value: 'editeur' }
				]
			},
			'Détermine ce que cette personne a le droit de faire dans le back office.'
		)
	]
};
