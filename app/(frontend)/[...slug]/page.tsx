import { notFound } from 'next/navigation';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import AnnuaireLayout from '@shared/components/AnnuaireLayout';
import DemarchesLayout from '@shared/components/DemarchesLayout';
import AgendaLayout from '@shared/components/AgendaLayout';
import ActualitesLayout from '@shared/components/ActualitesLayout';
import DocumentLayout from '@shared/components/DocumentLayout';
import BudgetProjetLayout from '@shared/components/BudgetProjetLayout';
import TrombinoscopeLayout from '@shared/components/TrombinoscopeLayout';
import CatalogueLieuxLayout from '@shared/components/CatalogueLieuxLayout';
import ContactLayout from '@shared/components/ContactLayout';
import NumerosUtilesLayout from '@shared/components/NumerosUtilesLayout';
import EditorialLayout from '@shared/components/EditorialLayout';
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
	getNumerosUtilesData
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

type Props = { params: Promise<{ slug: string[] }> };

export default async function DynamicPage({ params }: Props) {
	const { slug: slugParts } = await params;
	const slug = slugParts.join('/');
	const page = await getPageBySlug(slug);
	if (!page) notFound();

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
						eyebrowText="Mairie de Saint-Hilaire-Bonneval"
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
		const sections = (page.editorial as { sections?: Record<string, unknown>[] } | undefined)?.sections ?? [];
		return (
			<EditorialLayout
				heroGradient={DEFAULT_GRADIENT}
				breadcrumbLabel={title}
				eyebrowIcon={FileText}
				eyebrowText="Mairie de Saint-Hilaire-Bonneval"
				title={title}
				subtitle=""
			>
				{sections.map((block, i) => {
					if (block.blockType === 'texte') {
						return (
							<section key={i} className="editorial__section">
								<div className="editorial__section-inner container">
									{block.titre ? <h2>{String(block.titre)}</h2> : null}
									{block.corps ? <RichText data={block.corps as never} /> : null}
								</div>
							</section>
						);
					}
					if (block.blockType === 'image') {
						const image = block.image as { url?: string } | string | undefined;
						const url = typeof image === 'object' ? image?.url : undefined;
						if (!url) return null;
						return (
							<section key={i} className="editorial__section">
								<div className="editorial__section-inner container">
									<div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
										<Image src={url} alt={String(block.legende ?? '')} fill sizes="100vw" />
									</div>
									{block.legende ? <p>{String(block.legende)}</p> : null}
								</div>
							</section>
						);
					}
					return null;
				})}
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
