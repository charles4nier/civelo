import type { CollectionConfig, Field } from 'payload';
import { isSuperAdmin, isLoggedIn, isSuperAdminField } from './access';

// Décision 19 — une seule collection pour tous les gabarits (multi-instances
// ET singleton), avec champs conditionnels par gabarit plutôt que des
// collections séparées. Voir PAYLOAD-CMS.md pour le détail de chaque
// décision référencée en commentaire.

const GABARITS_SINGLETON = ['accueil', 'horaires', 'carte-interactive'];

// Décision 49 (annule décision 22) — plus de collections `telephones`/
// `emails` : la sélection dans une liste pour saisir un numéro/email était
// jugée pas du tout intuitive, surtout dans les fiches. `telephone`/`email`
// redeviennent des champs texte directs (saisis sur place), au prix de la
// source unique (un numéro changé doit être corrigé partout où il apparaît
// — compromis assumé). Décision 48 : 3 champs directs, tous optionnels, pas
// de tableau. Un seul de chaque (pas de second numéro). Réutilisé par
// Annuaire, Contact, Horaires.
export const contactFields: Field[] = [
	{ name: 'adresse', type: 'text', label: 'Adresse' },
	{ name: 'telephone', type: 'text', label: 'Téléphone' },
	{ name: 'email', type: 'email', label: 'Email' },
	// Décision 65 — trouvé en migrant l'annuaire (décision 64) : 2 fiches
	// avaient un site web rangé dans l'ancien champ email, faute de mieux.
	{ name: 'siteWeb', type: 'text', label: 'Site web' }
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

// Décision 55/56 — relation vers `icones`, avec `admin/IconPickerField` pour
// afficher le glyphe dans la liste de choix (pas juste le nom, comme le
// menu déroulant natif d'un `relationship`). `access` optionnel : la
// plupart de ces champs sont verrouillés au super-admin (icône fixée par
// entrée, pas un choix éditeur au quotidien), sauf celui de Categories.
const iconField = (access?: { update: typeof isSuperAdminField }): Field => ({
	name: 'icone',
	type: 'relationship',
	relationTo: 'icones',
	label: 'Icône',
	admin: { components: { Field: '/admin/IconPickerField' } },
	...(access ? { access } : {})
});

// Décision 52 — le libellé générique "Label" ne disait pas de quel bouton il
// s'agissait. Renommé explicitement "Texte du bouton principal/secondaire" +
// "Lien du bouton principal/secondaire". Un regroupement visuel en encadré a
// été tenté puis retiré — rendu impossible à vérifier sans voir l'admin en
// vrai, mieux vaut rester sur des champs plats déjà éprouvés que de deviner
// un style à l'aveugle. Le lien reste une relation vers `pages` (menu
// déroulant de toutes les pages du site) — cohérent avec les autres champs
// de navigation interne du BO (`quickAccessItems.lien`, `lienDocument`...).
// Décision 53 — l'info-bulle au survol (`admin/LabelWithInfo` v1) confirmée
// invisible à l'usage réel ("elle ne renvoie rien") : passée en description
// sous le champ, puis décision 54 : déplacée à droite de l'intitulé, sur la
// même ligne (`admin/LabelWithInfo` v2 — voir ce composant).
export const boutonFields = (prefix: string, label: string): Field[] => [
	{ name: `${prefix}Label`, type: 'text', label: `Texte du ${label.toLowerCase()}` },
	{
		name: `${prefix}Lien`,
		type: 'relationship',
		relationTo: 'pages',
		label: `Lien du ${label.toLowerCase()}`,
		admin: {
			components: {
				Label: {
					path: '/admin/LabelWithInfo',
					clientProps: { info: 'Vers quelle page du site voulez-vous que ce bouton redirige ?' }
				}
			}
		}
	}
];

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
			name: 'sectionInfosGenerales',
			type: 'ui',
			admin: {
				components: {
					Field: {
						path: '/admin/SectionHeading',
						clientProps: { heading: 'Informations générales' }
					}
				}
			}
		},
		{
			name: 'title',
			label: 'Titre',
			type: 'text',
			required: true,
			access: { update: isSuperAdminField },
			admin: {
				// Décision 54 — explication à droite de l'intitulé, sur la même
				// ligne ("Titre – explication"), pas en dessous (décision 53
				// abandonnée : correcte mais pas à l'emplacement voulu).
				components: {
					Label: {
						path: '/admin/LabelWithInfo',
						clientProps: { info: 'Le nom de la page, affiché dans le menu et en haut de la page sur le site.' }
					}
				}
			}
		},
		{
			name: 'slug',
			type: 'text',
			required: true,
			unique: true,
			access: { update: isSuperAdminField },
			admin: {
				components: {
					Label: {
						path: '/admin/LabelWithInfo',
						clientProps: { info: "L'adresse de la page dans le navigateur (ex. \"contact\" → mairie.fr/contact). Pas d'espace ni d'accent." }
					}
				}
			}
		},
		{
			// Décision 2 & 3 — obligatoire, une seule section, sans exception pour
			// l'Accueil (choix explicite : une seule règle, pas de cas particulier).
			name: 'menu',
			type: 'select',
			required: true,
			access: { update: isSuperAdminField },
			admin: {
				components: {
					Label: {
						path: '/admin/LabelWithInfo',
						clientProps: { info: 'À quelle entrée du menu du site cette page doit être rattachée.' }
					}
				}
			},
			options: [
				{ label: "L'essentiel", value: 'essentiel' },
				{ label: 'Votre mairie', value: 'mairie' },
				{ label: 'Ma commune', value: 'commune' },
				{ label: 'Tourisme & découverte', value: 'tourisme' }
			]
		},
		{
			// Décision 1 — indépendant du menu. Décision 44 : le sélecteur
			// visuel (aperçus image, décision 11/30) est abandonné pour l'instant
			// — images jugées peu lisibles — au profit d'un menu déroulant
			// classique avec un descriptif texte de chaque option.
			name: 'gabarit',
			type: 'select',
			required: true,
			access: { update: isSuperAdminField },
			admin: {
				condition: (data) => Boolean(data?.title),
				description:
					'Liste : page avec une collection d\'éléments (annuaire, actualités, agenda, documents...). ' +
					'Éditorial : page de texte libre (ex. Histoire, La commune). ' +
					'Trombinoscope : liste des élus avec photos. ' +
					'Catalogue de lieux/prestations : fiches détaillées (ex. location de salles). ' +
					'Contact : coordonnées et formulaire de contact. ' +
					'Numéros utiles : urgences et contacts pratiques. ' +
					'Accueil : page d\'accueil du site (une seule fois). ' +
					'Horaires : horaires d\'ouverture de la mairie (une seule fois). ' +
					'Carte interactive : carte des lieux et sentiers de la commune (une seule fois).'
			},
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
			admin: {
				condition: (data) => data.gabarit === 'liste',
				components: { Label: '/admin/HiddenLabel' }
			},
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
					admin: {
						description:
							'Annuaire : fiches avec coordonnées (ex. commerces, associations). ' +
							'Démarches : liste dépliable de démarches administratives. ' +
							'Actualités : articles avec date et catégorie. ' +
							'Document : fichiers téléchargeables (ex. comptes-rendus). ' +
							'Budget/Projet : budgets votés et projets municipaux. ' +
							'Agenda : événements avec date et lieu.'
					},
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
						{ name: 'email', type: 'email' }
					]
				},

				// layoutType "annuaire"
				{
					name: 'itemsAnnuaire',
					type: 'array',
					labels: { singular: 'Fiche', plural: 'Fiches' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'annuaire',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Fiche', titleField: 'nom' }
						} }
					},
					fields: [
						{ name: 'nom', type: 'text', required: true },
						categoryField(),
						{ name: 'badge', type: 'text' },
						{ name: 'description', type: 'textarea' },
						...contactFields
					]
				},

				// layoutType "demarches" — icône verrouillée PAR ITEM, pas par catégorie
				// (décision 10 amendée : perte de distinction sinon, cf. Naissance
				// vs Décès dans "État civil").
				{
					name: 'itemsDemarches',
					type: 'array',
					labels: { singular: 'Démarche', plural: 'Démarches' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'demarches',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Démarche', titleField: 'titre' }
						} }
					},
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField(),
						// Verrouillé par démarche (pas par catégorie).
						iconField({ update: isSuperAdminField }),
						{ name: 'resume', type: 'text', required: true },
						{ name: 'contenu', type: 'richText' }
					]
				},

				// layoutType "actualites" — retour à un `array` (décision 36,
				// annule décision 35) : les items restent ici, comme tous les
				// autres layoutType, pour garder un modèle éditeur unique
				// ("j'ouvre la page, je gère son contenu dedans"). L'épinglage
				// (décision 16) se fait item par item via `epinglee`, pas via
				// une relation Payload séparée.
				{
					name: 'itemsActualites',
					type: 'array',
					labels: { singular: 'Actualité', plural: 'Actualités' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'actualites',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Actualité', titleField: 'titre' }
						} }
					},
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField(),
						{ name: 'date', type: 'date', required: true },
						{ name: 'extrait', type: 'textarea', required: true },
						{
							name: 'epinglee',
							type: 'checkbox',
							defaultValue: false,
							admin: {
								description:
									'Épingle cette actu sur l\'Accueil (décision 16). Si plusieurs actus sont épinglées, la plus récente ("date") est prioritaire.'
							}
						},
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
					labels: { singular: 'Document', plural: 'Documents' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'document',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Document', titleField: 'titre' }
						} }
					},
					fields: [
						{ name: 'titre', type: 'text', required: true },
						categoryField('type'),
						{ name: 'date', type: 'date', required: true },
						{
							// Pas `required` — décision 32 : le seed laisse ce champ
							// vide (aucun vrai fichier disponible), à compléter
							// manuellement dans l'admin ensuite. `required: true`
							// bloquait littéralement le seed (erreur de validation
							// réelle, découverte en l'exécutant).
							name: 'fichier',
							type: 'upload',
							relationTo: 'documents'
						}
					]
				},

				// layoutType "budget-projet" — pas de catégorie (décision 24), `nature` est
				// un discriminant structurel comme celui du gabarit lui-même.
				{
					name: 'itemsBudgetProjet',
					type: 'array',
					labels: { singular: 'Entrée budget/projet', plural: 'Entrées budget/projet' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'budget-projet',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Entrée', titleField: 'titre' }
						} }
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
					labels: { singular: 'Événement', plural: 'Événements' },
					admin: {
						condition: (_, siblingData) => siblingData?.layoutType === 'agenda',
						components: { Label: '/admin/DynamicArrayLabel',
						RowLabel: {
							path: '/admin/RowLabel',
							clientProps: { prefix: 'Événement', titleField: 'titre' }
						} }
					},
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
			admin: {
				condition: (data) => data.gabarit === 'editorial',
				components: { Label: '/admin/HiddenLabel' }
			},
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
			admin: {
				condition: (data) => data.gabarit === 'trombinoscope',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				{ name: 'intro', type: 'richText' },
				{
					name: 'membres',
					type: 'array',
					labels: { singular: 'Membre', plural: 'Membres' },
					admin: {
						components: {
							Label: '/admin/DynamicArrayLabel',
							RowLabel: {
								path: '/admin/RowLabel',
								clientProps: { prefix: 'Membre', titleField: 'nom' }
							}
						}
					},
					fields: [
						{ name: 'nom', type: 'text', required: true },
						{ name: 'fonction', type: 'text', required: true },
						{
							// Décision 38 — discriminant explicite pour regrouper
							// l'affichage (Maire à part, puis 3 groupes) plutôt que
							// deviner un groupe à partir du texte libre `fonction`.
							name: 'role',
							type: 'select',
							required: true,
							options: [
								{ label: 'Maire', value: 'maire' },
								{ label: 'Adjoint', value: 'adjoint' },
								{ label: 'Conseiller délégué', value: 'delegue' },
								{ label: 'Conseiller municipal', value: 'conseiller' }
							]
						},
						{
							name: 'commissions',
							type: 'array',
							labels: { singular: 'Commission', plural: 'Commissions' },
							fields: [{ name: 'nom', type: 'text', required: true }]
						},
						{
							name: 'note',
							type: 'text',
							admin: { description: 'Ex. "Président de toutes les commissions" (Maire)' }
						},
						{ name: 'photo', type: 'upload', relationTo: 'media' },
						{ name: 'email', type: 'email' }
					]
				},
				{ name: 'infosReunion', type: 'textarea' }
			]
		},

		// ---- Gabarit Catalogue de lieux/prestations (décision 7 : démarre
		// minimal avec juste "salles" ; étoffé en décision 38 — le contenu réel
		// (Location de salles) a des groupes de tarifs distincts (Manifestations,
		// Vins d'honneur...), une caution par ligne, et des notes/consignes par
		// salle, absents du schéma minimal initial) ----
		{
			name: 'catalogueLieux',
			type: 'group',
			admin: {
				condition: (data) => data.gabarit === 'catalogue-lieux',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				{
					name: 'salles',
					type: 'array',
					labels: { singular: 'Salle', plural: 'Salles' },
					admin: {
						components: {
							Label: '/admin/DynamicArrayLabel',
							RowLabel: {
								path: '/admin/RowLabel',
								clientProps: { prefix: 'Salle', titleField: 'nom' }
							}
						}
					},
					fields: [
						{ name: 'nom', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						{ name: 'capacite', type: 'text' },
						// Verrouillé par salle.
						iconField({ update: isSuperAdminField }),
						{
							name: 'groupesTarifs',
							type: 'array',
							labels: { singular: 'Groupe de tarifs', plural: 'Groupes de tarifs' },
							fields: [
								{ name: 'label', type: 'text', required: true },
								{
									name: 'lignes',
									type: 'array',
									labels: { singular: 'Tarif', plural: 'Tarifs' },
									fields: [
										{ name: 'public', type: 'text', required: true },
										{ name: 'prix', type: 'text', required: true },
										{ name: 'caution', type: 'text' }
									]
								}
							]
						},
						{
							name: 'notes',
							type: 'array',
							labels: { singular: 'Note', plural: 'Notes' },
							fields: [
								{ name: 'texte', type: 'text', required: true },
								{
									name: 'type',
									type: 'select',
									defaultValue: 'info',
									options: [
										{ label: 'Information', value: 'info' },
										{ label: 'Condition/obligation', value: 'condition' }
									]
								}
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
			admin: {
				condition: (data) => data.gabarit === 'contact',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				{ name: 'description', type: 'textarea' },
				...contactFields,
				{
					// Décision 38 — texte d'accompagnement (ex. horaires
					// d'ouverture du standard téléphonique), commun aux
					// coordonnées de cette page (décision 48 : plus de tableau,
					// un seul jeu de coordonnées par page Contact). Renommé
					// `precision` (décision 50, plus de groupe `coordonnees` —
					// collision évitée avec la `description` de page ci-dessus).
					name: 'precision',
					type: 'text'
				},
				{ name: 'formulaireActif', type: 'checkbox', defaultValue: true }
			]
		},

		// ---- Gabarit Numéros utiles ----
		{
			name: 'numerosUtiles',
			type: 'group',
			admin: {
				condition: (data) => data.gabarit === 'numeros-utiles',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				{
					name: 'urgences',
					type: 'array',
					labels: { singular: "Numéro d'urgence", plural: "Numéros d'urgence" },
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
					labels: { singular: 'Contact local', plural: 'Contacts locaux' },
					fields: [
						{ name: 'label', type: 'text', required: true },
						{ name: 'detail', type: 'text' },
						{ name: 'telephone', type: 'text', required: true }
					]
				}
			]
		},

		// ---- Gabarit Accueil (singleton, décision 23) ----
		{
			name: 'accueil',
			type: 'group',
			admin: {
				condition: (data) => data.gabarit === 'accueil',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				{
					name: 'hero',
					type: 'group',
					label: "Section d'introduction",
					fields: [
						// Pas `required` sur `image` — même raison que
						// `Pois.image`/`itemsDocument.fichier` (décision 38+) :
						// aucun vrai fichier disponible au seed, à uploader ensuite.
						{ name: 'image', type: 'upload', relationTo: 'media' },
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						...boutonFields('boutonPrincipal', 'Bouton principal'),
						...boutonFields('boutonSecondaire', 'Bouton secondaire')
					]
				},
				{
					// Décision 17 — la bande agenda intégrée n'a aucun champ, calcul
					// automatique. Seules les 3 tuiles sont éditables.
					name: 'quickAccessItems',
					type: 'array',
					label: 'Section Accès rapides',
					labels: { singular: 'Tuile', plural: 'Tuiles' },
					admin: { description: '3 fiches qui orientent vers une page précise du site (ex. Démarches, Contact).' },
					minRows: 3,
					maxRows: 3,
					fields: [
						// Verrouillé par tuile, comme Démarches.
						iconField({ update: isSuperAdminField }),
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'text' },
						{ name: 'lien', type: 'relationship', relationTo: 'pages', required: true }
					]
				},
				// Décision 16/36 — pas de champ ici : l'épinglage vit sur chaque
				// actu (`liste.itemsActualites[].epinglee`, page "Actualités").
				// Au rendu, l'Accueil va chercher cette page et prend l'item
				// épinglé le plus récent (ou les 3 dernières par défaut, sans
				// épinglage).
				{
					name: 'mayorWord',
					type: 'group',
					label: 'Section Mot du maire',
					fields: [
						{ name: 'image', type: 'upload', relationTo: 'media' },
						{ name: 'citation', type: 'textarea', required: true },
						{ name: 'nomSignataire', type: 'text' },
						{ name: 'statNombre', type: 'text' },
						{ name: 'statLibelle', type: 'text' }
					]
				},
				{
					name: 'discoverCards',
					type: 'array',
					label: 'Section Découverte',
					labels: { singular: 'Carte Découvrir', plural: 'Cartes Découvrir' },
					admin: { description: 'Met en avant 3 fiches qui poussent vers un lieu ou un sentier précis de la carte interactive.' },
					minRows: 3,
					maxRows: 3,
					fields: [
						{ name: 'etiquette', type: 'text' },
						{ name: 'titre', type: 'text', required: true },
						{ name: 'description', type: 'textarea' },
						{ name: 'image', type: 'upload', relationTo: 'media' },
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
					label: 'Section contact',
					fields: [
						{ name: 'titre', type: 'text' },
						{ name: 'description', type: 'textarea' },
						{ name: 'boutonLabel', type: 'text' },
						...contactFields
					]
				}
			]
		},

		// ---- Gabarit Horaires (singleton, décision 23) ----
		{
			name: 'horaires',
			type: 'group',
			admin: {
				condition: (data) => data.gabarit === 'horaires',
				components: { Label: '/admin/HiddenLabel' }
			},
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
					labels: { singular: 'Fermeture exceptionnelle', plural: 'Fermetures exceptionnelles' },
					fields: [{ name: 'libelle', type: 'text', required: true }]
				},
				{
					name: 'contactsPratiques',
					type: 'array',
					labels: { singular: 'Contact pratique', plural: 'Contacts pratiques' },
					fields: [
						iconField({ update: isSuperAdminField }),
						{ name: 'label', type: 'text', required: true },
						{ name: 'nom', type: 'text', required: true },
						{ name: 'description', type: 'text' },
						...contactFields
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
			admin: {
				condition: (data) => data.gabarit === 'carte-interactive',
				components: { Label: '/admin/HiddenLabel' }
			},
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
