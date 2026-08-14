import type { CollectionConfig, Field } from 'payload';
import { isSuperAdmin, isLoggedIn, isSuperAdminField } from './access';

// Décision 19 — une seule collection pour tous les gabarits (multi-instances
// ET singleton), avec champs conditionnels par gabarit plutôt que des
// collections séparées. Voir PAYLOAD-CMS.md pour le détail de chaque
// décision référencée en commentaire.

const GABARITS_SINGLETON = ['accueil', 'horaires', 'carte-interactive'];

// Décision 22 — un item de contact ne stocke jamais un numéro/email en
// texte libre : relation vers `telephones`/`emails`. Réutilisé par
// Annuaire, Contact, Horaires, Numéros utiles.
const contactItemFields: Field[] = [
	{
		name: 'type',
		type: 'select',
		required: true,
		options: [
			{ label: 'Adresse', value: 'address' },
			{ label: 'Horaires', value: 'hours' },
			{ label: 'Téléphone', value: 'phone' },
			{ label: 'Email', value: 'email' }
		]
	},
	{
		name: 'valeur',
		type: 'text',
		admin: {
			description: 'Pour "Adresse" ou "Horaires" uniquement',
			condition: (_, siblingData) =>
				siblingData?.type === 'address' || siblingData?.type === 'hours'
		}
	},
	{
		name: 'telephone',
		type: 'relationship',
		relationTo: 'telephones',
		admin: {
			condition: (_, siblingData) => siblingData?.type === 'phone'
		}
	},
	{
		name: 'email',
		type: 'relationship',
		relationTo: 'emails',
		admin: {
			condition: (_, siblingData) => siblingData?.type === 'email'
		}
	}
];

// Décision 10 — catégorie toujours verrouillée par page : relation vers
// `categories`, filtrée pour ne montrer que les catégories de la page en
// cours d'édition (jamais la liste complète du site).
const categoryField = (name = 'categorie'): Field => ({
	name,
	type: 'relationship',
	relationTo: 'categories',
	required: true,
	filterOptions: ({ id }) => ({ page: { equals: id } })
});

// Décision 11 / 30 — composant d'aperçu visuel par option. Illustrations
// schématiques (pas des captures réelles, aucun outil de capture disponible
// pour produire ça — voir item 9 de la feuille de route), dans
// public/admin-previews/.
const GABARIT_PREVIEWS: Record<string, string> = {
	liste: '/admin-previews/gabarit-liste.svg',
	editorial: '/admin-previews/gabarit-editorial.svg',
	trombinoscope: '/admin-previews/gabarit-trombinoscope.svg',
	'catalogue-lieux': '/admin-previews/gabarit-catalogue-lieux.svg',
	contact: '/admin-previews/gabarit-contact.svg',
	'numeros-utiles': '/admin-previews/gabarit-numeros-utiles.svg',
	accueil: '/admin-previews/gabarit-accueil.svg',
	horaires: '/admin-previews/gabarit-horaires.svg',
	'carte-interactive': '/admin-previews/gabarit-carte-interactive.svg'
};

const LAYOUT_TYPE_PREVIEWS: Record<string, string> = {
	annuaire: '/admin-previews/carte-annuaire.svg',
	demarches: '/admin-previews/carte-demarches.svg',
	actualites: '/admin-previews/carte-actualites.svg',
	document: '/admin-previews/carte-document.svg',
	'budget-projet': '/admin-previews/carte-budget-projet.svg',
	agenda: '/admin-previews/carte-agenda.svg'
};

const previewPickerComponent = (previewImages: Record<string, string> = {}) => ({
	Field: {
		path: '/fields/PreviewPicker',
		clientProps: { previewImages }
	}
});

export const Pages: CollectionConfig = {
	slug: 'pages',
	// Décision 5 — réordonnancement par glisser-déposer plutôt qu'un champ
	// `order` numérique manuel. Ajoute un champ interne `_order` (fractional
	// indexing) et le définit comme tri par défaut des requêtes.
	orderable: true,
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'gabarit', 'menu']
	},
	access: {
		// Décision 13 — création/suppression de page réservées au super-admin.
		// Édition ouverte à tous les rôles connectés, restreinte au niveau
		// champ par champ ci-dessous (décision 10).
		create: isSuperAdmin,
		delete: isSuperAdmin,
		update: isLoggedIn,
		read: () => true
	},
	fields: [
		{
			name: 'title',
			type: 'text',
			required: true,
			access: { update: isSuperAdminField }
		},
		{
			name: 'slug',
			type: 'text',
			required: true,
			unique: true,
			access: { update: isSuperAdminField }
		},
		{
			// Décision 2 & 3 — obligatoire, une seule section, sans exception pour
			// l'Accueil (choix explicite : une seule règle, pas de cas particulier).
			name: 'menu',
			type: 'select',
			required: true,
			access: { update: isSuperAdminField },
			options: [
				{ label: "L'essentiel", value: 'essentiel' },
				{ label: 'Votre mairie', value: 'mairie' },
				{ label: 'Ma commune', value: 'commune' },
				{ label: 'Tourisme & découverte', value: 'tourisme' }
			]
		},
		{
			// Décision 1 — indépendant du menu.
			name: 'gabarit',
			type: 'select',
			required: true,
			access: { update: isSuperAdminField },
			admin: { components: previewPickerComponent(GABARIT_PREVIEWS) },
			options: [
				{ label: 'Liste', value: 'liste' },
				{ label: 'Éditorial', value: 'editorial' },
				{ label: 'Trombinoscope', value: 'trombinoscope' },
				{ label: 'Catalogue de lieux/prestations', value: 'catalogue-lieux' },
				{ label: 'Contact', value: 'contact' },
				{ label: 'Numéros utiles', value: 'numeros-utiles' },
				{ label: 'Accueil', value: 'accueil' },
				{ label: 'Horaires', value: 'horaires' },
				{ label: 'Carte interactive', value: 'carte-interactive' }
			]
		},

		// ---- Gabarit Liste (décision 6) ----
		{
			name: 'liste',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'liste' },
			fields: [
				{
					// Décision 6 — "carte" au sens décision initiale était
					// ambigu avec le petit composant visuel par item (ex.
					// ContactCard) que ce layout importe ensuite. Renommé
					// `layoutType` : ce champ choisit la mise en page de la
					// liste (quel composant `XxxLayout` afficher), pas une
					// carte au sens UI.
					name: 'layoutType',
					type: 'select',
					required: true,
					access: { update: isSuperAdminField },
					admin: { components: previewPickerComponent(LAYOUT_TYPE_PREVIEWS) },
					options: [
						{ label: 'Annuaire', value: 'annuaire' },
						{ label: 'Démarches', value: 'demarches' },
						{ label: 'Actualités', value: 'actualites' },
						{ label: 'Document', value: 'document' },
						{ label: 'Budget/Projet', value: 'budget-projet' },
						{ label: 'Agenda', value: 'agenda' }
					]
				},
				{
					name: 'nombreFiltres',
					type: 'select',
					defaultValue: '1',
					options: [
						{ label: '1 filtre', value: '1' },
						{ label: '2 filtres', value: '2' }
					]
				},
				{ name: 'ctaActif', type: 'checkbox', defaultValue: false },
				{
					name: 'cta',
					type: 'group',
					admin: { condition: (_, siblingData) => siblingData?.ctaActif },
					fields: [
						{ name: 'eyebrow', type: 'text' },
						{ name: 'titre', type: 'text' },
						{ name: 'description', type: 'textarea' },
						{ name: 'email', type: 'relationship', relationTo: 'emails' }
					]
				},

				// layoutType "annuaire"
				{
					name: 'itemsAnnuaire',
					type: 'array',
					admin: { condition: (_, siblingData) => siblingData?.layoutType === 'annuaire' },
					fields: [
						{ name: 'nom', type: 'text', required: true },
						categoryField(),
						{ name: 'badge', type: 'text' },
						{ name: 'description', type: 'textarea' },
						{ name: 'contacts', type: 'array', fields: contactItemFields }
					]
				},

				// layoutType "demarches" — icône verrouillée PAR ITEM, pas par catégorie
				// (décision 10 amendée : perte de distinction sinon, cf. Naissance
				// vs Décès dans "État civil").
				{
					name: 'itemsDemarches',
					type: 'array',
					admin: { condition: (_, siblingData) => siblingData?.layoutType === 'demarches' },
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField(),
						{
							name: 'icone',
							type: 'text',
							access: { update: isSuperAdminField },
							admin: {
								description:
									"Nom d'icône lucide-react, verrouillé par démarche (pas par catégorie)"
							}
						},
						{ name: 'resume', type: 'text', required: true },
						{ name: 'contenu', type: 'richText' }
					]
				},

				// layoutType "actualites"
				{
					name: 'itemsActualites',
					type: 'array',
					admin: { condition: (_, siblingData) => siblingData?.layoutType === 'actualites' },
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField(),
						{ name: 'date', type: 'date', required: true },
						{ name: 'extrait', type: 'textarea', required: true },
						{
							name: 'lienDocument',
							type: 'relationship',
							relationTo: 'pages',
							admin: {
								description: 'Optionnel — remplace "Lire la suite" par "Voir le document"'
							}
						}
					]
				},

				// layoutType "document"
				{
					name: 'itemsDocument',
					type: 'array',
					admin: { condition: (_, siblingData) => siblingData?.layoutType === 'document' },
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField('type'),
						{ name: 'date', type: 'date', required: true },
						{ name: 'fichier', type: 'upload', relationTo: 'documents', required: true }
					]
				},

				// layoutType "budget-projet" — pas de catégorie (décision 24), `nature` est
				// un discriminant structurel comme celui du gabarit lui-même.
				{
					name: 'itemsBudgetProjet',
					type: 'array',
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'budget-projet'
					},
					fields: [
						{
							name: 'nature',
							type: 'select',
							required: true,
							options: [
								{ label: 'Budget', value: 'budget' },
								{ label: 'Projet', value: 'projet' }
							]
						},
						{ name: 'titre', type: 'text', required: true },
						{ name: 'date', type: 'date', required: true },
						{
							name: 'fichier',
							type: 'upload',
							relationTo: 'documents',
							admin: { condition: (_, siblingData) => siblingData?.nature === 'budget' }
						},
						{
							name: 'statut',
							type: 'select',
							admin: { condition: (_, siblingData) => siblingData?.nature === 'projet' },
							options: [
								{ label: 'À venir', value: 'a-venir' },
								{ label: 'En cours', value: 'en-cours' },
								{ label: 'Terminé', value: 'termine' }
							]
						},
						{
							name: 'description',
							type: 'textarea',
							admin: { condition: (_, siblingData) => siblingData?.nature === 'projet' }
						}
					]
				},

				// layoutType "agenda"
				{
					name: 'itemsAgenda',
					type: 'array',
					admin: { condition: (_, siblingData) => siblingData?.layoutType === 'agenda' },
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField(),
						{ name: 'date', type: 'date', required: true },
						{
							name: 'horaire',
							type: 'text',
							admin: { description: 'Texte libre — ex. "19h00" ou "9h–13h"' }
						},
						{ name: 'lieu', type: 'text', required: true },
						{ name: 'description', type: 'textarea' }
					]
				}
			]
		},

		// ---- Gabarit Éditorial ----
		{
			name: 'editorial',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'editorial' },
			fields: [
				{
					name: 'sections',
					type: 'blocks',
					blocks: [
						{
							slug: 'texte',
							fields: [
								{ name: 'titre', type: 'text' },
								{ name: 'corps', type: 'richText', required: true }
							]
						},
						{
							slug: 'image',
							fields: [
								{ name: 'image', type: 'upload', relationTo: 'media', required: true },
								{ name: 'legende', type: 'text' }
							]
						}
					]
				}
			]
		},

		// ---- Gabarit Trombinoscope ----
		{
			name: 'trombinoscope',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'trombinoscope' },
			fields: [
				{ name: 'intro', type: 'richText' },
				{
					name: 'membres',
					type: 'array',
					fields: [
						{ name: 'nom', type: 'text', required: true },
						{ name: 'fonction', type: 'text', required: true },
						{ name: 'photo', type: 'upload', relationTo: 'media' },
						{ name: 'email', type: 'relationship', relationTo: 'emails' }
					]
				},
				{ name: 'infosReunion', type: 'textarea' }
			]
		},

		// ---- Gabarit Catalogue de lieux/prestations (décision 7 : démarre
		// minimal avec juste "salles", à étoffer si le besoin se confirme) ----
		{
			name: 'catalogueLieux',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'catalogue-lieux' },
			fields: [
				{
					name: 'salles',
					type: 'array',
					fields: [
						{ name: 'nom', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						{ name: 'capacite', type: 'text' },
						{
							name: 'tarifs',
							type: 'array',
							fields: [
								{ name: 'public', type: 'text', required: true },
								{ name: 'prix', type: 'text', required: true }
							]
						},
						{ name: 'images', type: 'upload', relationTo: 'media', hasMany: true }
					]
				}
			]
		},

		// ---- Gabarit Contact ----
		{
			name: 'contact',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'contact' },
			fields: [
				{ name: 'description', type: 'textarea' },
				{ name: 'coordonnees', type: 'array', fields: contactItemFields },
				{ name: 'formulaireActif', type: 'checkbox', defaultValue: true }
			]
		},

		// ---- Gabarit Numéros utiles ----
		{
			name: 'numerosUtiles',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'numeros-utiles' },
			fields: [
				{
					name: 'urgences',
					type: 'array',
					fields: [
						{ name: 'numero', type: 'text', required: true },
						{ name: 'label', type: 'text', required: true },
						{ name: 'description', type: 'text' },
						{
							// Sévérité visuelle (rouge/bleu/neutre) — verrouillée comme
							// les icônes (décision 10 amendée), pas un choix éditeur.
							name: 'couleur',
							type: 'select',
							access: { update: isSuperAdminField },
							options: [
								{ label: 'Rouge', value: 'red' },
								{ label: 'Bleu', value: 'blue' },
								{ label: 'Neutre', value: 'muted' }
							]
						}
					]
				},
				{
					// Champ dédié plutôt que `contactItemFields` — chaque numéro
					// local a besoin d'un libellé (ex. "Mairie de..."), pas juste
					// une valeur. Découvert en essayant de migrer les données
					// réelles (item 10) : `contactItemFields` seul ne portait
					// aucun nom, incomplet pour ce cas précis.
					name: 'contactsLocaux',
					type: 'array',
					fields: [
						{ name: 'label', type: 'text', required: true },
						{ name: 'detail', type: 'text' },
						{ name: 'telephone', type: 'relationship', relationTo: 'telephones', required: true }
					]
				}
			]
		},

		// ---- Gabarit Accueil (singleton, décision 23) ----
		{
			name: 'accueil',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'accueil' },
			fields: [
				{
					name: 'hero',
					type: 'group',
					fields: [
						{ name: 'image', type: 'upload', relationTo: 'media', required: true },
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						{ name: 'boutonPrincipalLabel', type: 'text' },
						{ name: 'boutonPrincipalLien', type: 'relationship', relationTo: 'pages' },
						{ name: 'boutonSecondaireLabel', type: 'text' },
						{ name: 'boutonSecondaireLien', type: 'relationship', relationTo: 'pages' }
					]
				},
				{
					// Décision 17 — la bande agenda intégrée n'a aucun champ, calcul
					// automatique. Seules les 3 tuiles sont éditables.
					name: 'quickAccessItems',
					type: 'array',
					minRows: 3,
					maxRows: 3,
					fields: [
						{
							name: 'icone',
							type: 'text',
							access: { update: isSuperAdminField },
							admin: { description: 'Verrouillé par tuile, comme Démarches' }
						},
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'text' },
						{ name: 'lien', type: 'relationship', relationTo: 'pages', required: true }
					]
				},
				{
					// Décision 16 — épinglage optionnel d'une actu précise.
					// LIMITE CONNUE : les actus vivent en `array` dans une page
					// Liste (pas leur propre collection), donc pas relatables par un
					// vrai champ `relationship` Payload. Solution de repli en texte
					// libre pour l'instant — à retrancher si les actus deviennent un
					// jour leur propre collection (même tension que pois/sentiers,
					// décision 23, non résolue ici faute de trancher entre
					// réordonnancement natif par array et relation propre).
					name: 'actuEpinglee',
					type: 'text',
					admin: {
						description:
							"Titre exact de l'actu à épingler (limitation technique, voir commentaire du code)"
					}
				},
				{
					name: 'mayorWord',
					type: 'group',
					fields: [
						{ name: 'image', type: 'upload', relationTo: 'media', required: true },
						{ name: 'citation', type: 'textarea', required: true },
						{ name: 'nomSignataire', type: 'text' },
						{ name: 'statNombre', type: 'text' },
						{ name: 'statLibelle', type: 'text' }
					]
				},
				{
					name: 'discoverCards',
					type: 'array',
					minRows: 3,
					maxRows: 3,
					fields: [
						{ name: 'etiquette', type: 'text' },
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						{ name: 'image', type: 'upload', relationTo: 'media', required: true },
						{
							name: 'lienPoi',
							type: 'relationship',
							relationTo: 'pois',
							admin: { description: 'Un POI OU un sentier, pas les deux' }
						},
						{ name: 'lienSentier', type: 'relationship', relationTo: 'sentiers' }
					]
				},
				{
					name: 'cta',
					type: 'group',
					fields: [
						{ name: 'titre', type: 'text' },
						{ name: 'description', type: 'textarea' },
						{ name: 'boutonLabel', type: 'text' },
						{ name: 'coordonnees', type: 'array', fields: contactItemFields }
					]
				}
			]
		},

		// ---- Gabarit Horaires (singleton, décision 23) ----
		{
			name: 'horaires',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'horaires' },
			fields: [
				// Jours verrouillés (champs fixes, pas un array) — l'éditeur ne
				// peut ni en ajouter ni en retirer, seulement éditer matin/après-midi.
				...(
					['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const
				).map(
					(jour): Field => ({
						name: jour,
						type: 'group',
						fields: [
							{ name: 'matin', type: 'text' },
							{ name: 'apresMidi', type: 'text' }
						]
					})
				),
				{
					name: 'fermetures',
					type: 'array',
					fields: [{ name: 'libelle', type: 'text', required: true }]
				},
				{
					name: 'contactsPratiques',
					type: 'array',
					fields: [
						{ name: 'icone', type: 'text', access: { update: isSuperAdminField } },
						{ name: 'label', type: 'text', required: true },
						{ name: 'nom', type: 'text', required: true },
						{ name: 'description', type: 'text' },
						{ name: 'contacts', type: 'array', fields: contactItemFields }
					]
				}
			]
		},

		// ---- Gabarit Carte interactive (singleton, décision 23) ----
		// Quasiment aucun champ propre : `pois` et `sentiers` sont des
		// collections séparées, le rendu Leaflet reste du code (décision 8).
		{
			name: 'carteInteractive',
			type: 'group',
			admin: { condition: (data) => data.gabarit === 'carte-interactive' },
			fields: [{ name: 'description', type: 'textarea' }]
		}
	],
	hooks: {
		beforeValidate: [
			async ({ data, req, originalDoc }) => {
				// Décision 9 — un gabarit singleton ne peut exister qu'une fois.
				const gabarit = data?.gabarit ?? originalDoc?.gabarit;
				if (!gabarit || !GABARITS_SINGLETON.includes(gabarit)) return data;

				const existing = await req.payload.find({
					collection: 'pages',
					where: {
						and: [
							{ gabarit: { equals: gabarit } },
							...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])
						]
					},
					limit: 1
				});

				if (existing.totalDocs > 0) {
					throw new Error(
						`Le gabarit "${gabarit}" est un singleton (décision 9) — une page de ce type existe déjà.`
					);
				}

				return data;
			}
		]
	}
};
