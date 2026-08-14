import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isLoggedIn } from './access';

// Décision 22 — même principe que Telephones.
export const Emails: CollectionConfig = {
	slug: 'emails',
	admin: {
		useAsTitle: 'label'
	},
	access: {
		create: isSuperAdmin,
		update: isSuperAdmin,
		delete: isSuperAdmin,
		read: isLoggedIn
	},
	fields: [
		{
			name: 'label',
			type: 'text',
			required: true,
			admin: {
				description: 'Ex. "Contact général"'
			}
		},
		{
			name: 'adresse',
			type: 'email',
			required: true
		}
	]
};
