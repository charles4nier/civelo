import type { Access, CollectionConfig, PayloadRequest } from 'payload';
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

// Bug de conception signale le 2026-09-15 : rien n'empechait un
// super-admin de creer un AUTRE super-admin depuis le back-office
// verrouille d'une commune (pas seulement depuis la console dediee), ni
// de le rattacher explicitement a une commune precise via `tenants`. Un
// super-admin est cense etre lie a `admin.civelo.fr` et avoir un acces
// global de par son role (voir `access.create`/`access.update`
// ci-dessous) — jamais scope a une commune. Les deux garde-fous
// ci-dessous imposent cette regle au niveau des donnees, pas seulement
// de l'UI.
const isOnSuperAdminConsole = (req: PayloadRequest): boolean => {
	const domaine = process.env.SUPER_ADMIN_DOMAIN;
	if (!domaine) return false;
	const host = req.headers.get('host')?.split(':')[0] ?? '';
	return host === domaine;
};

const findHomeTenantId = async (req: PayloadRequest) => {
	const domaine = process.env.SUPER_ADMIN_DOMAIN;
	if (!domaine) return undefined;
	const { docs } = await req.payload.find({
		collection: 'tenants',
		where: { domaine: { equals: domaine } },
		limit: 1,
		overrideAccess: true
	});
	return docs[0]?.id as string | number | undefined;
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
			async ({ data, operation, req, originalDoc }) => {
				const effectiveRole = data.role ?? originalDoc?.role;
				// Un super-admin reste TOUJOURS rattache au tenant "maison", quoi
				// qu'on ait soumis dans `tenants` (create ou update) — voir le
				// commentaire sur `isOnSuperAdminConsole` plus haut. Ecrase donc
				// systematiquement, pas seulement quand `tenants` est vide.
				if (effectiveRole === 'super-admin') {
					const homeTenantId = await findHomeTenantId(req);
					if (homeTenantId !== undefined) data.tenants = [{ tenant: homeTenantId }];
					return data;
				}

				if (operation !== 'create') return data;
				if (Array.isArray(data.tenants) && data.tenants.length > 0) return data;
				const homeTenantId = await findHomeTenantId(req);
				if (homeTenantId !== undefined) data.tenants = [{ tenant: homeTenantId }];
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
			if (req.user.role === 'super-admin') {
				// Cf. `isOnSuperAdminConsole` : creer un compte super-admin n'est
				// permis que depuis la console dediee, jamais depuis le
				// back-office verrouille d'une commune (meme par un super-admin).
				if (data?.role === 'super-admin' && !isOnSuperAdminConsole(req)) return false;
				return true;
			}
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
			if (req.user.role === 'super-admin') {
				// Même règle que sur `create` : promouvoir quelqu'un super-admin
				// n'est permis que depuis la console dédiée.
				if (data?.role === 'super-admin' && !isOnSuperAdminConsole(req)) return false;
				return true;
			}
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
