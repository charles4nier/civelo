import type { CollectionConfig } from 'payload';
import { isAdminOrAbove } from './access';

// Décision 98 (§7, étape 5) — inscrits à la lettre d'information de la
// commune. Inscriptions seules pour l'instant : aucun e-mail n'est envoyé
// (pas encore de fournisseur d'e-mails transactionnels, voir `roadmap.md`) ;
// la mairie exporte la liste (CSV, `/api/newsletter/export`). Le `jeton`
// servira au lien de désinscription des futurs envois
// (`/api/newsletter/desinscription?jeton=…`, déjà en place).
//
// Données personnelles : lecture et gestion réservées à l'admin de la
// commune et au super-admin. Les inscriptions ne passent que par la route
// publique `/api/newsletter` (consentement obligatoire), jamais par l'API
// REST de Payload (`create` fermé à tous).
export const AbonnesNewsletter: CollectionConfig = {
	slug: 'abonnes-newsletter',
	labels: { singular: 'Abonné', plural: "Abonnés à la lettre d'information" },
	indexes: [{ fields: ['tenant', 'email'], unique: true }],
	admin: {
		useAsTitle: 'email',
		defaultColumns: ['email', 'statut', 'consentementLe', 'desinscritLe'],
		components: { Description: '/admin/AbonnesListHeader' }
	},
	access: {
		create: () => false,
		read: isAdminOrAbove,
		update: isAdminOrAbove,
		delete: isAdminOrAbove
	},
	fields: [
		{ name: 'email', type: 'email', required: true, label: 'E-mail' },
		{
			name: 'statut',
			type: 'select',
			required: true,
			defaultValue: 'actif',
			options: [
				{ label: 'Inscrit', value: 'actif' },
				{ label: 'Désinscrit', value: 'desinscrit' }
			]
		},
		{
			name: 'consentementLe',
			type: 'date',
			label: 'Consentement donné le',
			admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } }
		},
		{
			name: 'desinscritLe',
			type: 'date',
			label: 'Désinscrit le',
			admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } }
		},
		{ name: 'jeton', type: 'text', index: true, admin: { hidden: true } }
	]
};
