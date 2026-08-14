import type { CollectionConfig } from 'payload';
import { isLoggedIn, isAdminOrAbove } from './access';

// Décision 25 — collection dédiée aux fichiers téléchargeables (cartes
// Document et Budget/Projet). Format et poids fournis nativement par
// l'upload Payload, réutilisés pour l'affichage accessible du lien
// de téléchargement (point RGAA relevé en décision 21).
export const DocumentsCollection: CollectionConfig = {
	slug: 'documents',
	upload: {
		mimeTypes: ['application/pdf']
	},
	access: {
		create: isLoggedIn,
		update: isLoggedIn,
		delete: isAdminOrAbove,
		read: () => true
	},
	fields: [
		{
			name: 'titre',
			type: 'text',
			admin: {
				description: 'Optionnel si déjà porté par la page qui utilise ce fichier'
			}
		}
	]
};
