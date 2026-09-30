import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import AnnuaireLayout from '@themes/atelier/components/AnnuaireLayout';
import DemarchesLayout from '@themes/atelier/components/DemarchesLayout';
import AgendaLayout from '@themes/atelier/components/AgendaLayout';
import ActualitesLayout from '@themes/atelier/components/ActualitesLayout';
import DocumentLayout from '@themes/atelier/components/DocumentLayout';
import BudgetProjetLayout from '@themes/atelier/components/BudgetProjetLayout';
import TrombinoscopeLayout from '@themes/atelier/components/TrombinoscopeLayout';
import CatalogueLieuxLayout from '@themes/atelier/components/CatalogueLieuxLayout';
import ContactLayout from '@themes/atelier/components/ContactLayout';
import NumerosUtilesLayout from '@themes/atelier/components/NumerosUtilesLayout';
import EditorialLayout from '@themes/atelier/components/EditorialLayout';
import EditorialSections from '@themes/atelier/components/EditorialLayout/Sections';
import AtelierFicheLayout from '@themes/atelier/components/FicheLayout';
import ClocherFicheLayout from '@themes/clocher/components/FicheLayout';
import PreauFicheLayout from '@themes/preau/components/FicheLayout';
import BelvedereFicheLayout from '@themes/belvedere/components/FicheLayout';
import { getCurrentTheme, pickTheme } from '@shared/lib/theme';
import {
	getPageBySlug,
	getAnnuaireItems,
	getDemarchesItems,
	getAgendaItems,
	getActualitesItems,
	getDocumentItems,
	getBudgetProjetItems,
	getTrombinoscopeData,
	getCatalogueLieuxItems,
	getContactData,
	getNumerosUtilesData,
	getEditorialData,
	getFiche,
	getPayloadClient,
	getRedirection
} from '../../../lib/payload';

// Item 14 (phase 5) — route générique : sert les pages créées depuis l'admin
// qui n'ont pas (encore) de fichier de route statique dédié. Next.js
// privilégie toujours une route plus spécifique (`app/demarches/page.tsx`
// etc.) sur ce catch-all — les 17 pages du seed continuent de passer par
// leurs fichiers actuels, inchangés, tant qu'ils ne sont pas retirés "un par
// un" (item 14, feuille de route). Cette route ne gère donc, pour l'instant,
// que le cas d'une page réellement nouvelle.
//
// Gabarits singleton (Accueil, Horaires, Carte interactive — décision 9)
// volontairement absents du dispatch ci-dessous : ils ont une URL fixe et
// unique, déjà servie par une route dédiée (`app/page.tsx`,
// `app/mairie/horaires/page.tsx`, `app/tourisme/carte-interactive/page.tsx`)
// — il ne peut jamais en exister une seconde instance à router dynamiquement.
//
// Pas de repli statique ici par construction : une page purement dynamique
// n'a pas d'équivalent en dur vers lequel se replier. Si Payload est
// injoignable, `getPageBySlug` renvoie `null` (item 14) et on répond 404,
// plutôt que de planter.

const DEFAULT_GRADIENT = 'linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))';

function withTous(values: (string | undefined)[]): string[] {
	const unique = Array.from(new Set(values.filter((v): v is string => Boolean(v))));
	return ['Tous', ...unique];
}

type Props = {
	params: Promise<{ slug: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Décision 98 — `/<page liste>/<fiche>` : quand le chemin complet n'est pas
// une page, on tente « page liste parente + fiche ». Les routes statiques
// (`app/(frontend)/mairie/actualites/page.tsx`…) ne captent que leur propre
// chemin, jamais `/mairie/actualites/<fiche>`, qui arrive donc ici.
function decoderSansErreur(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

async function resolveFiche(slugParts: string[]) {
	if (slugParts.length < 2) return null;
	return getFiche(slugParts.slice(0, -1).join('/'), slugParts[slugParts.length - 1]);
}

// Chaque thème a son `FicheLayout` (en-tête du thème + corps commun
// `shared/components/FicheContent`).
async function ficheLayoutDuTheme() {
	const payload = await getPayloadClient().catch(() => null);
	const theme = payload ? await getCurrentTheme(payload) : 'atelier';
	return pickTheme(theme, {
		atelier: AtelierFicheLayout,
		clocher: ClocherFicheLayout,
		preau: PreauFicheLayout,
		belvedere: BelvedereFicheLayout
	});
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug: slugParts } = await params;
	const slug = slugParts.join('/');
	if (await getPageBySlug(slug)) return {};
	const fiche = await resolveFiche(slugParts);
	if (!fiche) return {};
	return {
		title: fiche.seo.titre,
		description: fiche.seo.description,
		alternates: { canonical: `/${slug}` },
		openGraph: {
			type: 'article',
			title: fiche.seo.titre,
			description: fiche.seo.description,
			url: `/${slug}`,
			...(fiche.date ? { publishedTime: fiche.date } : {}),
			...(fiche.updatedAt ? { modifiedTime: fiche.updatedAt } : {}),
			...(fiche.image ? { images: [{ url: fiche.image.url, alt: fiche.image.alt }] } : {})
		}
	};
}

export default async function DynamicPage({ params, searchParams }: Props) {
	const { slug: slugParts } = await params;
	const slug = slugParts.join('/');
	const page = await getPageBySlug(slug);
	if (!page) {
		const fiche = await resolveFiche(slugParts);
		if (fiche) {
			const FicheLayout = await ficheLayoutDuTheme();
			return <FicheLayout fiche={fiche} />;
		}
		// Décision 98 (§5) — ancienne adresse (reprise d'un site, page
		// renommée) : redirection définitive plutôt que 404. `slug` arrive
		// décodé ; la requête des vieux sites (`?id=12`) compte aussi.
		const requete = new URLSearchParams(
			Object.entries(await searchParams).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v === undefined ? [] : [[k, v]]))
		).toString();
		const cible = await getRedirection(slugParts.map(decoderSansErreur).join('/'), requete || undefined);
		if (cible) permanentRedirect(cible);
		notFound();
	}

	const title = String(page.title ?? '');
	const gabarit = page.gabarit as string | undefined;

	if (gabarit === 'liste') {
		const layoutType = (page.liste as { layoutType?: string } | undefined)?.layoutType;

		switch (layoutType) {
			case 'annuaire': {
				const cards = (await getAnnuaireItems(slug)) ?? [];
				return (
					<AnnuaireLayout
						heroGradient={DEFAULT_GRADIENT}
						breadcrumbLabel={title}
						eyebrowIcon="MapPin"
						eyebrowText="Mairie de Saint-Martin"
						title={title}
						subtitle=""
						sectionEyebrow="Annuaire"
						countSingular="résultat"
						countPlural="résultats"
						filters={withTous(cards.map((c) => c.category))}
						cards={cards}
					/>
				);
			}
			case 'demarches': {
				const rawItems = (await getDemarchesItems(slug)) ?? [];
				const items = rawItems.map((it) => ({
					...it,
					content: it.contenu ? <RichText data={it.contenu as never} /> : null
				}));
				return <DemarchesLayout filters={withTous(items.map((i) => i.category))} items={items} />;
			}
			case 'agenda': {
				const events = (await getAgendaItems(slug)) ?? [];
				return <AgendaLayout filters={withTous(events.map((e) => e.category))} events={events} />;
			}
			case 'actualites': {
				const items = (await getActualitesItems(slug)) ?? [];
				return <ActualitesLayout filters={withTous(items.map((i) => i.category))} items={items} />;
			}
			case 'document': {
				const items = (await getDocumentItems(slug)) ?? [];
				return <DocumentLayout filters={withTous(items.map((i) => i.type))} items={items} />;
			}
			case 'budget-projet': {
				const items = (await getBudgetProjetItems(slug)) ?? [];
				return <BudgetProjetLayout items={items} />;
			}
			default:
				notFound();
		}
	}

	if (gabarit === 'editorial') {
		const data = await getEditorialData(slug);
		return (
			<EditorialLayout
				heroGradient={DEFAULT_GRADIENT}
				breadcrumbLabel={title}
				eyebrowIcon={FileText}
				eyebrowText={data?.eyebrowText || 'Mairie de Saint-Martin'}
				title={title}
				subtitle={data?.sousTitre ?? ''}
			>
				<EditorialSections sections={data?.sections ?? []} />
			</EditorialLayout>
		);
	}

	if (gabarit === 'trombinoscope') {
		const data = await getTrombinoscopeData(slug);
		return <TrombinoscopeLayout members={data?.members ?? []} meetingInfo={data?.meetingInfo} />;
	}

	if (gabarit === 'catalogue-lieux') {
		const salles = (await getCatalogueLieuxItems(slug)) ?? [];
		return <CatalogueLieuxLayout salles={salles} />;
	}

	if (gabarit === 'contact') {
		const data = await getContactData(slug);
		return <ContactLayout cards={data?.cards ?? []} formulaireActif={data?.formulaireActif ?? true} />;
	}

	if (gabarit === 'numeros-utiles') {
		const data = await getNumerosUtilesData(slug);
		return <NumerosUtilesLayout urgences={data?.urgences ?? []} locaux={data?.locaux ?? []} />;
	}

	// Accueil / Horaires / Carte interactive (singletons) et tout gabarit
	// inconnu : pas de route dynamique pour ces cas — voir commentaire en
	// tête de fichier.
	notFound();
}
