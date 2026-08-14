import type { CollectionConfig } from 'payload';
import { isAdminOrAbove, isSuperAdminField } from './access';

export const Users: CollectionConfig = {
	slug: 'users',
	auth: true,
	admin: {
		useAsTitle: 'email'
	},
	access: {
		read: isAdminOrAbove,
		// admin (mairie) peut créer/modifier/supprimer, mais jamais accorder un
		// rôle égal ou supérieur au sien — évite qu'un admin mairie se
		// nomme lui-même super-admin ou promeuve un autre admin.
		create: ({ req, data }) => {
			if (!req.user) return false;
			if (req.user.role === 'super-admin') return true;
			if (req.user.role === 'admin') return data?.role === 'editeur';
			return false;
		},
		update: ({ req, data, id }) => {
			if (!req.user) return false;
			if (req.user.role === 'super-admin') return true;
			if (req.user.role === 'admin') {
				// data?.role absent = pas de changement de rôle demandé, autorisé
				if (data?.role && data.role !== 'editeur') return false;
				return true;
			}
			return req.user.id === id;
		},
		delete: isAdminOrAbove
	},
	fields: [
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
		}
	]
};
