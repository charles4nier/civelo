import type { CollectionConfig, Field, PayloadRequest } from 'payload';
import { SignJWT } from 'jose';
import { isSuperAdmin, isLoggedIn, isSuperAdminField } from './access';

// Décision 19 — une seule collection pour tous les gabarits (multi-instances
// ET singleton), avec champs conditionnels par gabarit plutôt que des
// collections séparées. Voir PAYLOAD-CMS.md pour le détail de chaque
// décision référencée en commentaire.

const GABARITS_SINGLETON = ['accueil', 'horaires', 'carte-interactive'];

// Décision 76 — "je veux une indication d'aide derrière chaque intitulé,
// comme on a déjà fait à certains endroits" (testé auprès de plusieurs
// personnes, jugé beaucoup plus clair). Étend le pattern de la décision 54
// (`admin/LabelWithInfo`, "Titre – explication") à quasiment tous les
// champs du site plutôt qu'à une poignée. Helper pour éviter de répéter le
// même bloc `admin.components.Label` des dizaines de fois — fusionne avec
// un `admin`/`admin.components` déjà présent sur le champ (condition,
// description...) plutôt que de l'écraser.
export function withInfo(field: Field, info: string): Field {
	const admin = (field as { admin?: Record<string, unknown> }).admin ?? {};
	return {
		...field,
		admin: {
			...admin,
			components: {
				...(admin.components as Record<string, unknown> | undefined),
				Label: { path: '/admin/LabelWithInfo', clientProps: { info } }
			}
		}
	} as Field;
}

// Décision 81 — sur les listes les plus utilisées (Annuaire, Démarches,
// Actualités, Documents, Budget/Projet, Agenda, Membres, Salles), un second
// bouton "+ Ajouter" identique au bouton natif de Payload est posé tout en
// haut du champ (`admin/ArrayAddRowBefore`, slot `beforeInput`) — le bouton
// natif de Payload reste en bas, inchangé. Plus besoin de tout scroller pour
// ajouter un élément, quelle que soit la longueur de la liste.
export function withAddRowTop(field: Field): Field {
	const admin = (field as { admin?: Record<string, unknown> }).admin ?? {};
	return {
		...field,
		admin: {
			...admin,
			components: {
				...(admin.components as Record<string, unknown> | undefined),
				beforeInput: ['/admin/ArrayAddRowBefore']
			}
		}
	} as Field;
}

// Décision 49 (annule décision 22) — plus de collections `telephones`/
// `emails` : la sélection dans une liste pour saisir un numéro/email était
// jugée pas du tout intuitive, surtout dans les fiches. `telephone`/`email`
// redeviennent des champs texte directs (saisis sur place), au prix de la
// source unique (un numéro changé doit être corrigé partout où il apparaît
// — compromis assumé). Décision 48 : 3 champs directs, tous optionnels, pas
// de tableau. Un seul de chaque (pas de second numéro). Réutilisé par
// Annuaire, Contact, Horaires. Décision 76 — explications ajoutées ici une
// fois, reprises partout où `contactFields` est utilisé.
export const contactFields: Field[] = [
	withInfo({ name: 'adresse', type: 'text', label: 'Adresse' }, "L'adresse postale."),
	withInfo({ name: 'telephone', type: 'text', label: 'Téléphone' }, 'Le numéro de téléphone.'),
	withInfo({ name: 'email', type: 'email', label: 'Email' }, "L'adresse email."),
	// Décision 65 — trouvé en migrant l'annuaire (décision 64) : 2 fiches
	// avaient un site web rangé dans l'ancien champ email, faute de mieux.
	withInfo({ name: 'siteWeb', type: 'text', label: 'Site web' }, "L'adresse du site web (optionnel).")
];

// Décision 10 — catégorie toujours verrouillée par page : relation vers
// `categories`, filtrée pour ne montrer que les catégories de la page en
// cours d'édition (jamais la liste complète du site).
const categoryField = (name = 'categorie', info = 'La catégorie à laquelle cette fiche appartient.'): Field =>
	withInfo(
		{
			name,
			type: 'relationship',
			relationTo: 'categories',
			required: true,
			filterOptions: ({ id }) => ({ page: { equals: id } })
		},
		info
	);

// Décision 55/56 — relation vers `icones`, avec `admin/IconPickerField` pour
// afficher le glyphe dans la liste de choix (pas juste le nom, comme le
// menu déroulant natif d'un `relationship`). `access` optionnel : la
// plupart de ces champs sont verrouillés au super-admin (icône fixée par
// entrée, pas un choix éditeur au quotidien), sauf celui de Categories.
// Décision 76 — pas de `withInfo` ici : le sélecteur `IconPickerField` a sa
// propre interface (liste + glyphes), l'intention est déjà claire sans texte
// d'appoint, et il rend son propre `label` en interne (pas via
// `admin/LabelWithInfo`, un ajout ici serait sans effet visible).
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
	withInfo(
		{ name: `${prefix}Label`, type: 'text', label: `Texte du ${label.toLowerCase()}` },
		'Le texte affiché sur le bouton.'
	),
	withInfo(
		{
			name: `${prefix}Lien`,
			type: 'relationship',
			relationTo: 'pages',
			label: `Lien du ${label.toLowerCase()}`
		},
		'Vers quelle page du site voulez-vous que ce bouton redirige ?'
	)
];

// Mode brouillon/preview (roadmap 2026-09-14) — le bouton "Aperçu" doit
// ouvrir le VRAI domaine de la commune, en Next.js Draft Mode. Le `token` que
// Payload propose de base est le JWT de session (valide 2h par défaut, cf.
// `payload/dist/collections/config/defaults.js`) — trop puissant à faire
// transiter dans une URL (donnerait un accès complet à l'API à quiconque
// l'intercepterait), quelle que soit sa durée. On signe donc ici un jeton
// dédié, minimal (juste l'id de la page et de l'utilisateur, rien d'autre) —
// revérifié intégralement côté serveur par `app/(payload)/api/preview`
// (jamais fait confiance à ces seules données, juste à leur fraîcheur).
// Expire en 1h, pas 2 minutes comme au premier jet : ce lien est généré au
// CHARGEMENT de la page d'édition (`admin.preview` s'exécute au rendu de la
// vue, pas au clic sur le bouton — vérifié dans le code de Payload) donc une
// expiration trop courte rendait le bouton inutilisable dès qu'on passait
// plus de 2 minutes à éditer avant de cliquer (signalé le 2026-09-16). Une
// heure reste très supérieure au risque : ce jeton ne permet RIEN d'autre que
// voir CETTE page précise en brouillon, contrairement au JWT de session.
const generatePreviewURL: NonNullable<CollectionConfig['admin']>['preview'] = async (doc, { req }) => {
	if (!doc?.id || !req.user) return null;

	const tenant = doc.tenant as { domaine?: string; id?: unknown } | number | string | null | undefined;
	const tenantId = typeof tenant === 'object' && tenant !== null ? tenant.id : tenant;
	if (!tenantId) return null;

	let domaine = typeof tenant === 'object' && tenant !== null ? tenant.domaine : undefined;
	if (!domaine) {
		const tenantDoc = await req.payload
			.findByID({ collection: 'tenants', id: tenantId as number | string, overrideAccess: true })
			.catch(() => null);
		domaine = tenantDoc?.domaine as string | undefined;
	}
	if (!domaine) return null;

	const secret = process.env.PAYLOAD_SECRET;
	if (!secret) return null;

	const path = doc.gabarit === 'accueil' ? '/' : `/${doc.slug ?? ''}`;
	const token = await new SignJWT({ pageId: doc.id, purpose: 'page-preview', userId: req.user.id })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('1h')
		.sign(new TextEncoder().encode(secret));

	return `https://${domaine}/api/preview?token=${encodeURIComponent(token)}&path=${encodeURIComponent(path)}`;
};

export const Pages: CollectionConfig = {
	slug: 'pages',
	// Décision 5 — réordonnancement par glisser-déposer plutôt qu'un champ
	// `order` numérique manuel. Ajoute un champ interne `_order` (fractional
	// indexing) et le définit comme tri par défaut des requêtes.
	orderable: true,
	// Étape 7 du plan multi-tenant — unicité du slug PAR commune, pas
	// globale (voir le commentaire sur le champ `slug` ci-dessous). `tenant`
	// est le nom par défaut du champ ajouté par le plugin multi-tenant.
	indexes: [{ fields: ['tenant', 'slug'], unique: true }],
	// Mode brouillon (roadmap 2026-09-14) — enregistrer une page sans la
	// publier ne touche jamais la ligne "courante" tant qu'on ne publie pas
	// (confirmé dans `payload/dist/collections/operations/utilities/
	// update.js` : `isSavingDraft` évite l'écriture de la table de base, une
	// nouvelle version va dans `_pages_v`) — donc aucune des ~14 fonctions de
	// `lib/payload.ts` qui lisent `pages` sans `draft: true` n'a besoin de
	// changer pour continuer à montrer la dernière version PUBLIÉE.
	versions: { drafts: { autosave: false } },
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'gabarit', 'menu'],
		preview: generatePreviewURL
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
		withInfo(
			{
				name: 'title',
				label: 'Titre',
				type: 'text',
				required: true,
				access: { update: isSuperAdminField }
			},
			'Le nom de la page, affiché dans le menu et en haut de la page sur le site.'
		),
		withInfo(
			{
				// Étape 7 du plan multi-tenant — `unique: true` directement sur
				// le champ créait un index unique sur TOUTE la collection, pas
				// par tenant (bug confirmé, issue payloadcms/payload#14801) :
				// deux communes n'auraient jamais pu avoir de page "contact" en
				// même temps. Remplacé par un index composé `tenant`+`slug`
				// tout en bas de cette collection.
				name: 'slug',
				type: 'text',
				required: true,
				access: { update: isSuperAdminField }
			},
			"L'adresse de la page dans le navigateur (ex. \"contact\" → mairie.fr/contact). Pas d'espace ni d'accent."
		),
		withInfo(
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
			'À quelle entrée du menu du site cette page doit être rattachée.'
		),
		{
			// Décision 1 — indépendant du menu. Décision 44 : le sélecteur
			// visuel (aperçus image, décision 11/30) est abandonné pour l'instant
			// — images jugées peu lisibles — au profit d'un menu déroulant
			// classique avec un descriptif texte de chaque option. Décision 76 —
			// pas de `withInfo` ici : le texte d'explication est déjà long
			// (plusieurs options à détailler), affiché en dessous
			// (`admin.description`), pas à droite du libellé — trop long pour
			// tenir sur une ligne, déjà tranché ainsi en décision 46.
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
					// carte au sens UI. Décision 76 — même raison que `gabarit`
					// ci-dessus : explication multi-options gardée en dessous.
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
				withInfo(
					{ name: 'ctaActif', type: 'checkbox', defaultValue: false },
					"Affiche un encart d'appel à l'action à la fin de la liste."
				),
				{
					name: 'cta',
					type: 'group',
					admin: { condition: (_, siblingData) => siblingData?.ctaActif },
					fields: [
						withInfo({ name: 'eyebrow', type: 'text' }, "Petit texte au-dessus du titre de l'encart."),
						withInfo({ name: 'titre', type: 'text' }, "Le titre de l'encart affiché en bas de la liste."),
						withInfo({ name: 'description', type: 'textarea' }, "Le texte qui accompagne le titre de l'encart."),
						withInfo({ name: 'email', type: 'email' }, "L'email affiché dans l'encart, cliquable pour écrire directement.")
					]
				},

				// layoutType "annuaire"
				withAddRowTop({
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
						withInfo(
							{ name: 'nom', type: 'text', required: true },
							'Le nom de la fiche (ex. nom du commerce, du médecin, de l\'association).'
						),
						withInfo(
							{ name: 'image', type: 'upload', relationTo: 'media' },
							"Une photo pour cette fiche (optionnel). Affichée en haut de la carte."
						),
						categoryField(),
						withInfo({ name: 'badge', type: 'text' }, "Petit texte affiché à côté du nom (ex. un sigle d'association)."),
						withInfo({ name: 'description', type: 'textarea' }, 'Quelques lignes qui présentent cette fiche.'),
						...contactFields
					]
				}),

				// layoutType "demarches" — icône verrouillée PAR ITEM, pas par catégorie
				// (décision 10 amendée : perte de distinction sinon, cf. Naissance
				// vs Décès dans "État civil").
				withAddRowTop({
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
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le nom de la démarche (ex. "Carte d\'identité").'),
						categoryField(),
						// Verrouillé par démarche (pas par catégorie).
						iconField({ update: isSuperAdminField }),
						withInfo(
							{ name: 'resume', type: 'text', required: true },
							'Une phrase qui résume la démarche, affichée avant de la déplier.'
						),
						withInfo(
							{ name: 'contenu', type: 'richText' },
							'Le détail de la démarche : ce qu\'il faut faire, les documents à fournir, les liens utiles.'
						)
					]
				}),

				// layoutType "actualites" — retour à un `array` (décision 36,
				// annule décision 35) : les items restent ici, comme tous les
				// autres layoutType, pour garder un modèle éditeur unique
				// ("j'ouvre la page, je gère son contenu dedans"). L'épinglage
				// (décision 16) se fait item par item via `epinglee`, pas via
				// une relation Payload séparée.
				withAddRowTop({
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
						withInfo({ name: 'titre', type: 'text', required: true }, "Le titre de l'actualité."),
						categoryField(),
						withInfo({ name: 'date', type: 'date', required: true }, "La date de publication de l'actualité."),
						withInfo({ name: 'extrait', type: 'textarea', required: true }, 'Le texte de l\'actualité, affiché dans la liste.'),
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
				}),

				// layoutType "document"
				withAddRowTop({
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
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le nom du document, affiché dans la liste.'),
						categoryField('type', 'La catégorie de ce document.'),
						withInfo({ name: 'date', type: 'date', required: true }, 'La date du document.'),
						withInfo(
							{
								// Pas `required` — décision 32 : le seed laisse ce champ
								// vide (aucun vrai fichier disponible), à compléter
								// manuellement dans l'admin ensuite. `required: true`
								// bloquait littéralement le seed (erreur de validation
								// réelle, découverte en l'exécutant).
								name: 'fichier',
								type: 'upload',
								relationTo: 'documents'
							},
							'Le fichier PDF à mettre à disposition en téléchargement.'
						)
					]
				}),

				// layoutType "budget-projet" — pas de catégorie (décision 24), `nature` est
				// un discriminant structurel comme celui du gabarit lui-même.
				withAddRowTop({
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
						withInfo(
							{
								name: 'nature',
								type: 'select',
								required: true,
								options: [
									{ label: 'Budget', value: 'budget' },
									{ label: 'Projet', value: 'projet' }
								]
							},
							'Choisissez si cette entrée est un budget voté ou un projet en cours.'
						),
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le nom du budget ou du projet.'),
						withInfo({ name: 'date', type: 'date', required: true }, 'La date associée à cette entrée.'),
						withInfo(
							{
								name: 'fichier',
								type: 'upload',
								relationTo: 'documents',
								admin: { condition: (_, siblingData) => siblingData?.nature === 'budget' }
							},
							'Le document PDF du budget, à mettre à disposition en téléchargement.'
						),
						withInfo(
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
							'Où en est ce projet.'
						),
						withInfo(
							{
								name: 'description',
								type: 'textarea',
								admin: { condition: (_, siblingData) => siblingData?.nature === 'projet' }
							},
							'Quelques lignes qui présentent ce projet.'
						)
					]
				}),

				// layoutType "agenda"
				withAddRowTop({
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
						withInfo({ name: 'titre', type: 'text', required: true }, "Le nom de l'événement."),
						categoryField(),
						withInfo({ name: 'date', type: 'date', required: true }, "La date de l'événement."),
						{
							name: 'horaire',
							type: 'text',
							admin: { description: 'Texte libre — ex. "19h00" ou "9h–13h"' }
						},
						withInfo({ name: 'lieu', type: 'text', required: true }, "Où se déroule l'événement."),
						withInfo({ name: 'description', type: 'textarea' }, "Quelques lignes qui présentent l'événement.")
					]
				})
			]
		},

		// ---- Gabarit Éditorial ----
		// Décision 82 — "Histoire" et "La commune" (les 2 seules pages
		// existantes de ce gabarit) restaient entièrement en dur (Lorem ipsum
		// pour Histoire) depuis la décision 41. Décision 84 — 1er essai
		// (décision 82, blocs texte/image/colonnes/statistiques génériques)
		// rejeté par le client : la mise en page sur-mesure d'origine (triptyque
		// d'images + texte, section pleine largeur, 2 colonnes + tuiles) FAIT
		// PARTIE du template, pas un détail sacrifiable pour la rendre
		// éditable. Reconstruite comme 3 vrais blocs au choix (liste
		// déroulante "Ajouter un bloc"), fidèles au design d'origine (voir
		// l'ancien `features/histoire/style.scss`, récupéré via git avant
		// suppression) — pas 4 blocs génériques recomposables à l'infini.
		{
			name: 'editorial',
			type: 'group',
			admin: {
				condition: (data) => data.gabarit === 'editorial',
				components: { Label: '/admin/HiddenLabel' }
			},
			fields: [
				withInfo(
					{ name: 'eyebrowText', type: 'text' },
					'Le petit texte au-dessus du titre, en haut de page (ex. "Patrimoine & Mémoire").'
				),
				withInfo({ name: 'sousTitre', type: 'text' }, 'Le sous-titre affiché sous le titre (optionnel).'),
				{
					name: 'sections',
					type: 'blocks',
					labels: { singular: 'Bloc', plural: 'Blocs' },
					blocks: [
						{
							slug: 'intro',
							labels: { singular: 'Intro (triptyque + texte)', plural: 'Intro (triptyque + texte)' },
							fields: [
								withInfo(
									{
										name: 'positionImages',
										type: 'select',
										defaultValue: 'droite',
										options: [
											{ label: 'Images à droite', value: 'droite' },
											{ label: 'Images à gauche', value: 'gauche' }
										]
									},
									'De quel côté placer les 3 images par rapport au texte.'
								),
								withInfo({ name: 'eyebrow', type: 'text' }, 'Petit texte au-dessus du titre (ex. "Aux origines", optionnel).'),
								withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de ce bloc.'),
								withInfo({ name: 'corps', type: 'richText', required: true }, 'Le texte de ce bloc.'),
								withInfo(
									{ name: 'imagePrincipale', type: 'upload', relationTo: 'media' },
									'La grande image, au-dessus des 2 autres. Utilisez une photo au format portrait (un peu plus haute que large, ratio environ 4:5) — une photo au format paysage sera recadrée et perdra du contenu sur les côtés.'
								),
								withInfo(
									{ name: 'imageSecondaire1', type: 'upload', relationTo: 'media' },
									'Une des 2 petites images côte à côte, sous la grande. Utilisez une photo au format carré (largeur = hauteur).'
								),
								withInfo(
									{ name: 'imageSecondaire2', type: 'upload', relationTo: 'media' },
									'L\'autre petite image, à côté de la précédente. Utilisez une photo au format carré (largeur = hauteur).'
								)
							]
						},
						{
							slug: 'texteCentre',
							labels: { singular: 'Texte centré (évolution)', plural: 'Texte centré (évolution)' },
							fields: [
								withInfo({ name: 'eyebrow', type: 'text' }, 'Petit texte au-dessus du titre (ex. "Évolution", optionnel).'),
								withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de ce bloc.'),
								withInfo({ name: 'corps', type: 'richText', required: true }, 'Le texte de ce bloc, sur toute la largeur.')
							]
						},
						{
							slug: 'titreColonnesTuiles',
							labels: { singular: 'Titre + 2 colonnes + tuiles', plural: 'Titre + 2 colonnes + tuiles' },
							fields: [
								withInfo({ name: 'eyebrow', type: 'text' }, 'Petit texte au-dessus du titre (ex. "Aujourd\'hui", optionnel).'),
								withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de ce bloc.'),
								withInfo({ name: 'colonneGauche', type: 'richText', required: true }, 'Le texte de la colonne de gauche.'),
								withInfo({ name: 'colonneDroite', type: 'richText', required: true }, 'Le texte de la colonne de droite.'),
								{
									name: 'tuiles',
									type: 'array',
									labels: { singular: 'Tuile', plural: 'Tuiles' },
									maxRows: 4,
									admin: {
										// Décision 86 — précisé "optionnel" explicitement : les
										// tuiles ne sont pas obligatoires, un texte à 2 colonnes
										// simple (sans rien en bas) est un usage normal de ce
										// bloc, pas un bloc à part.
										description:
											'Optionnel — jusqu\'à 4 tuiles (ex. chiffres clés) affichées en bas du bloc. Laissez vide pour un texte à 2 colonnes simple, sans rien en dessous.',
										components: {
											Label: '/admin/DynamicArrayLabel',
											RowLabel: { path: '/admin/RowLabel', clientProps: { prefix: 'Tuile', titleField: 'libelle' } }
										}
									},
									fields: [
										withInfo({ name: 'valeur', type: 'text', required: true }, 'Le chiffre ou texte affiché en grand (ex. "1 022").'),
										withInfo({ name: 'suffixe', type: 'text' }, 'Un suffixe affiché en plus petit à côté (ex. "km²", optionnel).'),
										withInfo({ name: 'libelle', type: 'text', required: true }, 'Ce que représente cette tuile (ex. "Habitants").')
									]
								}
							]
						},
						{
							slug: 'imagePleineLargeur',
							labels: { singular: 'Image pleine largeur', plural: 'Images pleine largeur' },
							fields: [
								withInfo(
									{ name: 'imageDesktop', type: 'upload', relationTo: 'media', required: true },
									'L\'image affichée sur ordinateur/tablette. Utilisez une photo au format paysage (plus large que haute) : elle remplit toute la largeur de la page.'
								),
								withInfo(
									{ name: 'imageMobile', type: 'upload', relationTo: 'media', required: true },
									'L\'image affichée sur mobile, à la place de la précédente. Utilisez une photo au format portrait (plus haute que large) — un cadrage différent, pas juste la même photo recadrée.'
								),
								withInfo({ name: 'legende', type: 'text' }, 'Une légende affichée sous l\'image (optionnel).')
							]
						},
						{
							slug: 'grilleImages',
							labels: { singular: 'Grille de 3 images', plural: 'Grilles de 3 images' },
							fields: [
								withInfo(
									{ name: 'image1', type: 'upload', relationTo: 'media', required: true },
									'1ʳᵉ image. Utilisez une photo au format portrait (plus haute que large).'
								),
								withInfo(
									{ name: 'image2', type: 'upload', relationTo: 'media', required: true },
									'2ᵉ image. Utilisez une photo au format portrait (plus haute que large).'
								),
								withInfo(
									{ name: 'image3', type: 'upload', relationTo: 'media', required: true },
									'3ᵉ image. Utilisez une photo au format portrait (plus haute que large).'
								)
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
				withInfo({ name: 'intro', type: 'richText' }, "Un texte d'introduction affiché en haut de la page (optionnel)."),
				withAddRowTop({
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
						withInfo({ name: 'nom', type: 'text', required: true }, "Le nom de l'élu."),
						withInfo(
							{ name: 'fonction', type: 'text', required: true },
							'La fonction de l\'élu (ex. "Adjointe à l\'urbanisme").'
						),
						withInfo(
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
							'Le groupe dans lequel cet élu est affiché.'
						),
						{
							name: 'commissions',
							type: 'array',
							labels: { singular: 'Commission', plural: 'Commissions' },
							fields: [withInfo({ name: 'nom', type: 'text', required: true }, 'Le nom de la commission.')]
						},
						{
							name: 'note',
							type: 'text',
							admin: { description: 'Ex. "Président de toutes les commissions" (Maire)' }
						},
						withInfo({ name: 'photo', type: 'upload', relationTo: 'media' }, "La photo de l'élu (optionnel)."),
						withInfo({ name: 'email', type: 'email' }, "L'email de contact de l'élu (optionnel).")
					]
				}),
				withInfo(
					{ name: 'infosReunion', type: 'textarea' },
					'Informations sur les réunions du conseil municipal (optionnel).'
				)
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
				withAddRowTop({
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
						withInfo({ name: 'nom', type: 'text', required: true }, 'Le nom de la salle.'),
						withInfo({ name: 'description', type: 'textarea' }, 'Quelques lignes qui présentent la salle.'),
						withInfo({ name: 'capacite', type: 'text' }, 'Le nombre de personnes que la salle peut accueillir.'),
						// Verrouillé par salle.
						iconField({ update: isSuperAdminField }),
						{
							name: 'groupesTarifs',
							type: 'array',
							labels: { singular: 'Groupe de tarifs', plural: 'Groupes de tarifs' },
							fields: [
								withInfo(
									{ name: 'label', type: 'text', required: true },
									'Le nom de ce groupe de tarifs (ex. "Manifestations").'
								),
								{
									name: 'lignes',
									type: 'array',
									labels: { singular: 'Tarif', plural: 'Tarifs' },
									fields: [
										withInfo(
											{ name: 'public', type: 'text', required: true },
											'À qui s\'adresse ce tarif (ex. "Habitants de la commune").'
										),
										withInfo({ name: 'prix', type: 'text', required: true }, 'Le prix pour ce public.'),
										withInfo({ name: 'caution', type: 'text' }, 'Le montant de la caution demandée (optionnel).')
									]
								}
							]
						},
						{
							name: 'notes',
							type: 'array',
							labels: { singular: 'Note', plural: 'Notes' },
							fields: [
								withInfo(
									{ name: 'texte', type: 'text', required: true },
									'Une information ou une consigne à afficher pour cette salle.'
								),
								withInfo(
									{
										name: 'type',
										type: 'select',
										defaultValue: 'info',
										options: [
											{ label: 'Information', value: 'info' },
											{ label: 'Condition/obligation', value: 'condition' }
										]
									},
									'Une simple information, ou une condition/obligation à respecter.'
								)
							]
						},
						withInfo(
							{ name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
							'Les photos de la salle.'
						)
					]
				})
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
				withInfo({ name: 'description', type: 'textarea' }, 'Un texte affiché en haut de la page Contact (optionnel).'),
				...contactFields,
				withInfo(
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
					'Un texte affiché à côté des coordonnées (ex. horaires du standard).'
				),
				withInfo(
					{ name: 'formulaireActif', type: 'checkbox', defaultValue: true },
					'Affiche ou masque le formulaire de contact sur cette page.'
				)
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
						withInfo({ name: 'numero', type: 'text', required: true }, "Le numéro de téléphone d'urgence."),
						withInfo(
							{ name: 'label', type: 'text', required: true },
							'Le nom de ce numéro d\'urgence (ex. "SAMU").'
						),
						withInfo({ name: 'description', type: 'text' }, 'Une précision sur ce numéro (optionnel).'),
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
						withInfo(
							{ name: 'label', type: 'text', required: true },
							'Le nom de ce contact (ex. "Mairie de...").'
						),
						withInfo({ name: 'detail', type: 'text' }, 'Une précision sur ce contact (optionnel).'),
						withInfo({ name: 'telephone', type: 'text', required: true }, 'Le numéro de téléphone de ce contact.')
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
						withInfo(
							{ name: 'image', type: 'upload', relationTo: 'media' },
							"L'image affichée en haut de la page d'accueil."
						),
						withInfo({ name: 'titre', type: 'text', required: true }, "Le titre principal de la page d'accueil."),
						withInfo({ name: 'description', type: 'textarea' }, 'Le texte affiché sous le titre principal.'),
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
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de cette tuile d\'accès rapide.'),
						withInfo({ name: 'description', type: 'text' }, 'Une courte description de cette tuile.'),
						withInfo(
							{ name: 'lien', type: 'relationship', relationTo: 'pages', required: true },
							'La page vers laquelle cette tuile redirige.'
						)
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
						withInfo({ name: 'image', type: 'upload', relationTo: 'media' }, 'La photo du maire (optionnel).'),
						withInfo(
							{ name: 'citation', type: 'textarea', required: true },
							"Le mot du maire, affiché sur la page d'accueil."
						),
						withInfo(
							{ name: 'nomSignataire', type: 'text' },
							'Le nom affiché sous la citation (ex. "Le Maire").'
						),
						withInfo(
							{ name: 'afficherEncart', type: 'checkbox', defaultValue: true },
							"Affiche ou masque l'encart chiffré superposé à la photo du maire (ex. \"1 022 · Habitants\")."
						),
						withInfo(
							{
								name: 'statNombre',
								type: 'text',
								admin: { condition: (_, siblingData) => siblingData?.afficherEncart !== false }
							},
							'Un chiffre mis en avant à côté du mot du maire (optionnel, ex. "12").'
						),
						withInfo(
							{
								name: 'statLibelle',
								type: 'text',
								admin: { condition: (_, siblingData) => siblingData?.afficherEncart !== false }
							},
							'Ce que ce chiffre représente (ex. "associations").'
						)
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
						withInfo({ name: 'etiquette', type: 'text' }, 'Un petit texte au-dessus du titre de la carte (optionnel).'),
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de cette carte Découvrir.'),
						withInfo({ name: 'description', type: 'textarea' }, 'Une courte description de ce lieu ou sentier.'),
						withInfo({ name: 'image', type: 'upload', relationTo: 'media' }, 'L\'image de cette carte.'),
						{
							name: 'lienPoi',
							type: 'relationship',
							relationTo: 'pois',
							admin: { description: 'Un POI OU un sentier, pas les deux' }
						},
						withInfo(
							{ name: 'lienSentier', type: 'relationship', relationTo: 'sentiers' },
							'Le sentier vers lequel cette carte redirige.'
						)
					]
				},
				withInfo(
					{ name: 'afficherSlideshow', type: 'checkbox', defaultValue: true },
					"Affiche ou masque la section Diaporama sur l'accueil (variante défaut et tourisme)."
				),
				{
					// Variante « tourisme » (`Tenants.variante`) — slideshow de mise
					// en avant sur l'accueil. Pas de min/maxRows : nombre de
					// diapositives libre, contrairement à `quickAccessItems`/
					// `discoverCards` (verrouillés à 3 par construction).
					name: 'slideshow',
					type: 'array',
					label: 'Section Diaporama',
					labels: { singular: 'Diapositive', plural: 'Diapositives' },
					admin: {
						description:
							"Met en avant un événement, un lieu ou un service en grand format sur l'accueil. Autant de diapositives que vous voulez.",
						condition: (_, siblingData) => siblingData?.afficherSlideshow !== false
					},
					fields: [
						withInfo({ name: 'image', type: 'upload', relationTo: 'media' }, 'L\'image de cette diapositive.'),
						withInfo(
							{ name: 'etiquette', type: 'text' },
							'Un petit texte au-dessus du titre de la diapositive (optionnel, ex. "Grande manifestation").'
						),
						withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de cette diapositive.'),
						withInfo({ name: 'description', type: 'textarea' }, 'Le texte de cette diapositive.'),
						withInfo(
							{ name: 'badgeNombre', type: 'text' },
							'Le chiffre mis en avant dans le badge (optionnel, ex. "12 & 13" ou "40 km").'
						),
						withInfo(
							{ name: 'badgeLibelle', type: 'text' },
							'Ce que ce chiffre représente (optionnel, ex. "Juillet · Rendez-vous au village").'
						),
						withInfo({ name: 'boutonLabel', type: 'text' }, 'Le texte du bouton de cette diapositive.'),
						withInfo(
							{ name: 'lien', type: 'relationship', relationTo: 'pages' },
							'La page vers laquelle le bouton de cette diapositive redirige.'
						)
					]
				},
				{
					name: 'cta',
					type: 'group',
					label: 'Section contact',
					fields: [
						withInfo({ name: 'titre', type: 'text' }, 'Le titre de la section contact de l\'accueil.'),
						withInfo({ name: 'description', type: 'textarea' }, 'Le texte affiché dans la section contact.'),
						withInfo({ name: 'boutonLabel', type: 'text' }, 'Le texte du bouton de la section contact.'),
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
							withInfo({ name: 'matin', type: 'text' }, 'Les horaires du matin pour ce jour (laisser vide si fermé).'),
							withInfo(
								{ name: 'apresMidi', type: 'text' },
								"Les horaires de l'après-midi pour ce jour (laisser vide si fermé)."
							)
						]
					})
				),
				{
					name: 'fermetures',
					type: 'array',
					labels: { singular: 'Fermeture exceptionnelle', plural: 'Fermetures exceptionnelles' },
					fields: [
						withInfo(
							{ name: 'libelle', type: 'text', required: true },
							'Le texte de cette fermeture exceptionnelle (ex. "Fermé le 25 décembre").'
						)
					]
				},
				{
					name: 'contactsPratiques',
					type: 'array',
					labels: { singular: 'Contact pratique', plural: 'Contacts pratiques' },
					fields: [
						iconField({ update: isSuperAdminField }),
						withInfo(
							{ name: 'label', type: 'text', required: true },
							'Le nom de ce contact pratique (ex. "État civil").'
						),
						withInfo(
							{ name: 'nom', type: 'text', required: true },
							'Le nom de la personne ou du service à contacter.'
						),
						withInfo({ name: 'description', type: 'text' }, 'Une précision sur ce contact (optionnel).'),
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
			fields: [
				withInfo(
					{ name: 'description', type: 'textarea' },
					'Un texte affiché en haut de la page Carte interactive (optionnel).'
				)
			]
		}
	],
	hooks: {
		beforeValidate: [
			async ({ data, req, originalDoc }) => {
				// Décision 9 — un gabarit singleton ne peut exister qu'une fois.
				// Étape 6 du plan multi-tenant — "qu'une fois" doit s'entendre
				// PAR COMMUNE, pas sur toute la base : sans le filtre `tenant`
				// ci-dessous, dès que la commune A crée son "Accueil", la
				// commune B ne pourrait plus jamais créer le sien (toute la
				// collection `pages` interrogée, tenants confondus).
				const gabarit = data?.gabarit ?? originalDoc?.gabarit;
				if (!gabarit || !GABARITS_SINGLETON.includes(gabarit)) return data;

				const tenant = data?.tenant ?? originalDoc?.tenant;
				const tenantId = typeof tenant === 'object' && tenant !== null ? (tenant as { id?: unknown }).id : tenant;
				// Pas de tenant renseigné : on laisse la validation du champ
				// `tenant` lui-même (ajouté par le plugin) gérer ce cas, pas ce
				// hook.
				if (!tenantId) return data;

				const existing = await req.payload.find({
					collection: 'pages',
					where: {
						and: [
							{ gabarit: { equals: gabarit } },
							{ tenant: { equals: tenantId } },
							...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])
						]
					},
					limit: 1
				});

				if (existing.totalDocs > 0) {
					throw new Error(
						`Le gabarit "${gabarit}" est un singleton — une page de ce type existe déjà pour cette commune.`
					);
				}

				return data;
			}
		],
		// Décision 79 — les listes chronologiques (Actualités, Agenda, Documents,
		// Budget/Projet) gardaient l'ordre de saisie/glisser-déposer, pas l'ordre
		// des dates : un ajout récent pouvait finir n'importe où, dans l'admin
		// comme sur le site public (qui affiche `liste.itemsXxx` tel quel, sans
		// re-trier — vérifié dans `lib/payload.ts`). Triées ici par date
		// décroissante à chaque enregistrement, une bonne fois pour toutes.
		beforeChange: [
			({ data }) => {
				const liste = (data as { liste?: Record<string, unknown> })?.liste;
				if (!liste) return data;

				const byDateDesc = (a: unknown, b: unknown) => {
					const dateA = (a as { date?: string })?.date;
					const dateB = (b as { date?: string })?.date;
					return new Date(dateB ?? 0).getTime() - new Date(dateA ?? 0).getTime();
				};

				for (const key of ['itemsActualites', 'itemsAgenda', 'itemsDocument', 'itemsBudgetProjet']) {
					const items = liste[key];
					if (Array.isArray(items)) {
						liste[key] = [...items].sort(byDateDesc);
					}
				}

				return data;
			}
		]
	}
};
