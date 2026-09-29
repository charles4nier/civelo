import type { CollectionConfig, Field, PayloadRequest, Where } from 'payload';
import {
	lexicalEditor,
	ParagraphFeature,
	HeadingFeature,
	BoldFeature,
	ItalicFeature,
	UnderlineFeature,
	LinkFeature,
	UnorderedListFeature,
	OrderedListFeature,
	BlockquoteFeature,
	UploadFeature,
	FixedToolbarFeature,
	InlineToolbarFeature
} from '@payloadcms/richtext-lexical';
import { isLoggedIn } from './access';
import { withInfo } from './Pages';
import { buildPreviewURL } from './preview';
import { slugify } from '../shared/lib/slug';
import { LAYOUTS_EN_FICHES } from './fichesTypes';

export { LAYOUTS_EN_FICHES };

// Décision 98 (chantier « fiches », plan dans `.claude/docs/chantier-fiches.md`)
// — un élément de liste (actualité, événement, commerce…) n'est plus une
// ligne de tableau dans sa page Liste mais une fiche à part entière : sa
// propre URL (`/<page liste>/<fiche>`), un vrai texte, des pièces jointes,
// un brouillon. Une seule collection pour tous les types : chaque fiche est
// rattachée à une page Liste, dont elle hérite l'URL, la commune et le type
// (le `liste.layoutType` de la page, recopié dans `type`).

// Types dont l'URL porte la date (`2026-09-29-titre`) : un même titre revient
// d'une année sur l'autre (« Repas des aînés »). Décidé le 2026-09-29.
const TYPES_DATES = ['actualites', 'document'];

// Reprise de données (migration des anciennes actualités, import d'une
// archive) : les données d'origine n'avaient pas toutes ces obligations
// (catégorie supprimée depuis, date vide…) — on les reprend telles quelles
// plutôt que de faire échouer toute la reprise.
const estReprise = (req: PayloadRequest | undefined) => Boolean(req?.context?.reprise);

const estType =
	(...types: string[]) =>
	(data: Record<string, unknown> | undefined) =>
		types.includes(String(data?.type ?? ''));

// Texte riche volontairement restreint (chantier-fiches.md §2) : intertitres
// H2/H3 seulement — le H1 est le titre de la fiche, et un intertitre ne doit
// pas sauter de niveau (RGAA 9.1) —, pas de couleur ni de taille libres.
// Images dans le texte : `media` seulement (texte alternatif obligatoire) ;
// les PDF passent par « Pièces jointes », affichés avec format et poids.
const editeurFiche = lexicalEditor({
	features: () => [
		ParagraphFeature(),
		HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
		BoldFeature(),
		ItalicFeature(),
		UnderlineFeature(),
		UnorderedListFeature(),
		OrderedListFeature(),
		BlockquoteFeature(),
		LinkFeature(),
		UploadFeature({ enabledCollections: ['media'] }),
		FixedToolbarFeature(),
		InlineToolbarFeature()
	]
});

const idOf = (value: unknown): number | string | undefined => {
	if (value === null || value === undefined || value === '') return undefined;
	if (typeof value === 'object') return (value as { id?: number | string }).id;
	return value as number | string;
};

// Slug unique pour une même page de la même commune : suffixe -2, -3… en cas
// de collision (deux actualités du même titre le même jour).
async function slugDisponible(
	req: PayloadRequest,
	base: string,
	tenantId: number | string,
	pageId: number | string,
	selfId?: number | string
): Promise<string> {
	for (let n = 1; n < 100; n++) {
		const candidat = n === 1 ? base : `${base}-${n}`;
		const where: Where = {
			and: [
				{ slug: { equals: candidat } },
				{ page: { equals: pageId } },
				{ tenant: { equals: tenantId } },
				...(selfId ? [{ id: { not_equals: selfId } }] : [])
			]
		};
		const { totalDocs } = await req.payload.count({ collection: 'fiches', where, overrideAccess: true, req });
		if (totalDocs === 0) return candidat;
	}
	return `${base}-${Date.now()}`;
}

// Date du jour à Paris (AAAA-MM-JJ) : une date Payload est stockée en UTC, un
// `toISOString()` brut pourrait tomber sur la veille.
function jourParis(iso: string): string {
	return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date(iso));
}

const generatePreviewURL: NonNullable<CollectionConfig['admin']>['preview'] = async (doc, { req }) => {
	const pageId = idOf(doc?.page);
	if (!pageId || !doc?.slug) return null;
	const page = await req.payload
		.findByID({ collection: 'pages', id: pageId, depth: 0, overrideAccess: true, draft: true })
		.catch(() => null);
	if (!page?.slug) return null;
	return buildPreviewURL({
		req,
		collection: 'fiches',
		docId: doc.id,
		tenant: doc.tenant as Parameters<typeof buildPreviewURL>[0]['tenant'],
		path: `/${page.slug}/${doc.slug}`
	});
};

const champsCommunsHaut: Field[] = [
	withInfo({ name: 'titre', type: 'text', required: true }, 'Le titre de la fiche, affiché en haut de sa page.'),
	withInfo(
		{
			name: 'chapo',
			label: 'Chapô',
			type: 'textarea',
			required: true
		},
		'Deux ou trois phrases qui résument la fiche : affichées dans la liste et en haut de la fiche.'
	)
];

export const Fiches: CollectionConfig = {
	slug: 'fiches',
	labels: { singular: 'Fiche', plural: 'Fiches' },
	indexes: [{ fields: ['tenant', 'page', 'slug'], unique: true }],
	versions: { drafts: { autosave: false }, maxPerDoc: 20 },
	defaultSort: '-date',
	admin: {
		useAsTitle: 'titre',
		defaultColumns: ['titre', 'date', 'categorie', '_status'],
		listSearchableFields: ['titre', 'chapo'],
		pagination: { defaultLimit: 25 },
		preview: generatePreviewURL,
		components: {
			// En tête de liste : le nom de la page (« Actualités ») et le bouton
			// « Nouvelle fiche », déjà rattachée à cette page (voir le composant).
			Description: '/admin/FichesListHeader'
		}
	},
	access: {
		create: isLoggedIn,
		update: isLoggedIn,
		delete: isLoggedIn,
		// Un visiteur ne lit jamais un brouillon, même par l'API REST.
		read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } })
	},
	fields: [
		...champsCommunsHaut,
		{
			name: 'page',
			type: 'relationship',
			relationTo: 'pages',
			required: true,
			label: 'Page',
			filterOptions: {
				and: [{ gabarit: { equals: 'liste' } }, { 'liste.layoutType': { in: [...LAYOUTS_EN_FICHES] } }]
			},
			admin: {
				position: 'sidebar',
				description: 'La page de la liste où la fiche est publiée.',
				// Préremplit la page quand on arrive depuis « Publier une fiche ›
				// <page> », et recopie son type pour afficher les bons champs.
				components: { Field: '/admin/FichePageField' }
			}
		},
		{
			// Recopié depuis `liste.layoutType` de la page (hook ci-dessous, et
			// côté client par `FichePageField` pour afficher tout de suite les
			// champs du type) — jamais saisi.
			name: 'type',
			type: 'select',
			options: [
				{ label: 'Actualité', value: 'actualites' },
				{ label: 'Événement', value: 'agenda' },
				{ label: 'Démarche', value: 'demarches' },
				{ label: 'Annuaire', value: 'annuaire' },
				{ label: 'Publication', value: 'document' },
				{ label: 'Projet', value: 'budget-projet' }
			],
			admin: { hidden: true }
		},
		{
			name: 'slug',
			type: 'text',
			index: true,
			label: 'Adresse (URL)',
			admin: {
				position: 'sidebar',
				readOnly: true,
				description: 'Calculée depuis le titre, et la date pour une actualité. Ne change plus une fois la fiche publiée.'
			}
		},
		withInfo(
			{
				name: 'date',
				type: 'date',
				admin: {
					condition: estType(...TYPES_DATES),
					date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' }
				},
				validate: (value: unknown, { siblingData, req }: { siblingData: Record<string, unknown>; req: PayloadRequest }) =>
					estType(...TYPES_DATES)(siblingData) && !value && !estReprise(req) ? 'La date est obligatoire.' : true
			} as Field,
			'La date de publication, affichée sur la fiche et dans la liste.'
		),
		withInfo(
			{
				name: 'categorie',
				label: 'Catégorie',
				type: 'relationship',
				relationTo: 'categories',
				// Décision 10 — catégories verrouillées par page : seulement
				// celles de la page de la fiche.
				filterOptions: ({ siblingData }) => ({
					page: { equals: idOf((siblingData as { page?: unknown })?.page) ?? 0 }
				}),
				validate: (value: unknown, { siblingData, req }: { siblingData: Record<string, unknown>; req: PayloadRequest }) =>
					estType('actualites')(siblingData) && !value && !estReprise(req) ? 'La catégorie est obligatoire.' : true
			} as Field,
			'La catégorie de la fiche, utilisée par les filtres de la liste.'
		),
		{
			name: 'epinglee',
			type: 'checkbox',
			defaultValue: false,
			label: "Épingler sur l'accueil",
			admin: {
				condition: estType('actualites'),
				description:
					"L'actualité passe en premier sur la page d'accueil. Si plusieurs sont épinglées, la plus récente l'emporte."
			}
		},
		withInfo(
			{ name: 'image', type: 'upload', relationTo: 'media', label: 'Image principale' },
			'Affichée en haut de la fiche et sur sa carte dans la liste (facultatif).'
		),
		withInfo(
			{ name: 'contenu', type: 'richText', label: 'Texte', editor: editeurFiche },
			'Le texte complet de la fiche. Intertitres, listes, liens et images sont possibles.'
		),
		withInfo(
			{
				name: 'piecesJointes',
				type: 'upload',
				relationTo: 'documents',
				hasMany: true,
				label: 'Pièces jointes'
			},
			'Un ou plusieurs PDF à télécharger, affichés sous le texte avec leur format et leur poids.'
		),
		withInfo(
			{ name: 'pageLiee', type: 'relationship', relationTo: 'pages', label: 'Page liée' },
			'Une page du site à proposer en fin de fiche (facultatif).'
		),
		{
			name: 'seo',
			type: 'group',
			label: 'Référencement',
			admin: {
				description: 'Facultatif : sans rien ici, Google reçoit le titre et le chapô de la fiche.'
			},
			fields: [
				{ name: 'titre', type: 'text', label: 'Titre pour Google' },
				{ name: 'description', type: 'textarea', label: 'Description pour Google' }
			]
		}
	],
	hooks: {
		beforeValidate: [
			async ({ data, req, originalDoc }) => {
				if (!data) return data;
				const pageId = idOf(data.page ?? originalDoc?.page);
				if (!pageId) return data;

				// La page fait autorité : elle fixe le type et la commune de la
				// fiche. Une fiche ne peut donc jamais être rattachée à la page
				// d'une autre commune que la sienne.
				const page = await req.payload
					.findByID({ collection: 'pages', id: pageId, depth: 0, overrideAccess: true, draft: true, req })
					.catch(() => null);
				const layoutType = (page?.liste as { layoutType?: string } | undefined)?.layoutType;
				if (!page || page.gabarit !== 'liste' || !(LAYOUTS_EN_FICHES as readonly string[]).includes(layoutType ?? '')) {
					throw new Error("Cette page n'accepte pas de fiches.");
				}
				data.type = layoutType;
				const tenantId = idOf(page.tenant);
				if (tenantId) data.tenant = tenantId;

				// Import d'une archive (`scripts/import-tenant.template.ts`) :
				// l'URL exportée est reprise telle quelle.
				if (req.context?.reprise && req.context?.conserverSlug && data.slug) return data;

				// URL figée dès la première publication : un lien partagé ou
				// référencé ne doit plus casser si le titre change ensuite.
				const dejaPubliee = originalDoc?._status === 'published' && originalDoc?.slug;
				if (dejaPubliee) {
					data.slug = originalDoc.slug;
					return data;
				}

				const titre = String(data.titre ?? originalDoc?.titre ?? '');
				const date = data.date ?? originalDoc?.date;
				let base = slugify(titre) || 'fiche';
				if (TYPES_DATES.includes(layoutType ?? '') && date) {
					base = `${jourParis(String(date))}-${base}`;
				}
				if (tenantId) {
					data.slug = await slugDisponible(req, base, tenantId, pageId, originalDoc?.id);
				} else {
					data.slug = base;
				}
				return data;
			}
		]
	}
};
