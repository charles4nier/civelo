import type { CollectionConfig } from 'payload';
import { isSuperAdmin, isLoggedIn, isSuperAdminField } from './access';
import { withInfo } from './Pages';

// Étape 3 du plan multi-tenant — collection pivot (une ligne par commune
// cliente). Registrée dans `payload.config.ts` en dehors de la config du
// plugin (`multiTenantPlugin`) : c'est elle que le plugin référence, pas une
// collection qu'il scope lui-même.
//
// Répartition des droits, tranchée avec le client : `admin`/`éditeur`
// peuvent modifier les coordonnées + le logo de LEUR commune (contenu
// courant, même logique que les anciens globals Identité/Footer) ; tout le
// reste (nom, domaine, thème, statut du contrat...) reste verrouillé
// super-admin — ce sont des leviers commerciaux/techniques, pas du contenu.
// Le scoping "leur commune uniquement" vient du plugin multi-tenant (étape
// 4), pas d'ici — cette collection n'a pas encore le champ `tenant` sur
// elle-même (elle EST la référence de tenant).
export const Tenants: CollectionConfig = {
	slug: 'tenants',
	admin: {
		useAsTitle: 'nom',
		defaultColumns: ['nom', 'domaine', 'statutContrat']
	},
	access: {
		// Jamais public — contrairement à Pages/Media/etc. Une lecture
		// publique exposerait le domaine, les coordonnées et le statut
		// contractuel (actif/suspendu/résilié) de toutes les communes
		// clientes à quiconque interroge l'API. Le site public résout son
		// tenant via un appel serveur (`overrideAccess: true`), pas via
		// cette règle.
		create: isSuperAdmin,
		read: isLoggedIn,
		update: isLoggedIn,
		delete: isSuperAdmin
	},
	fields: [
		withInfo(
			{ name: 'nom', type: 'text', required: true, access: { update: isSuperAdminField } },
			'Le nom de la commune (ex. "Saint-Hilaire-Bonneval").'
		),
		withInfo(
			{ name: 'domaine', type: 'text', required: true, unique: true, access: { update: isSuperAdminField } },
			'Le nom de domaine du site de cette commune (ex. "saint-hilaire-bonneval.fr") — sert à identifier automatiquement quelle commune répondre selon le domaine appelé.'
		),
		withInfo(
			{ name: 'insee', type: 'text', access: { update: isSuperAdminField } },
			'Le code INSEE de la commune (optionnel).'
		),
		withInfo(
			{
				name: 'theme',
				type: 'select',
				required: true,
				defaultValue: 'edito',
				access: { update: isSuperAdminField },
				// À étoffer au fur et à mesure que d'autres structures de page
				// seront construites (3e thème prévu, ex-style-ludique).
				options: [
					{ label: 'Style édito', value: 'edito' },
					{ label: 'App', value: 'app' }
				]
			},
			'La structure de page utilisée par le site de cette commune.'
		),
		withInfo(
			{
				name: 'palette',
				type: 'select',
				required: true,
				defaultValue: 'defaut',
				access: { update: isSuperAdminField },
				options: [{ label: 'Par défaut', value: 'defaut' }]
			},
			'La palette de couleurs du site de cette commune.'
		),
		withInfo(
			{
				name: 'typographie',
				type: 'select',
				required: true,
				defaultValue: 'defaut',
				access: { update: isSuperAdminField },
				options: [{ label: 'Par défaut', value: 'defaut' }]
			},
			'Le couple typographique du site de cette commune.'
		),
		withInfo(
			{ name: 'blason', type: 'upload', relationTo: 'media' },
			'Le blason ou logo de la commune, affiché dans l\'en-tête et le pied de page de son site.'
		),
		{
			name: 'coordonnees',
			type: 'group',
			fields: [
				withInfo({ name: 'adresse', type: 'text' }, "L'adresse postale de la mairie."),
				withInfo({ name: 'telephone', type: 'text' }, 'Le numéro de téléphone de la mairie.'),
				withInfo({ name: 'courriel', type: 'email' }, "L'adresse email de la mairie."),
				withInfo({ name: 'horaires', type: 'text' }, "Les horaires d'ouverture de la mairie (ex. \"9h–12h / 14h–17h\").")
			]
		},
		withInfo(
			{
				name: 'statutContrat',
				type: 'select',
				required: true,
				defaultValue: 'actif',
				access: { update: isSuperAdminField },
				options: [
					{ label: 'Actif', value: 'actif' },
					{ label: 'Suspendu', value: 'suspendu' },
					{ label: 'Résilié', value: 'resilie' }
				]
			},
			"Le statut du contrat de cette commune — une suspension/résiliation suit une procédure contractuelle définie, ne pas couper l'accès directement depuis ce champ sans l'avoir suivie."
		)
	]
};
