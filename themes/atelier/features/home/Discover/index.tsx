import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NewsGrid, type NewsItemData } from '../News';
import './style.scss';

const CLASS_NAME = 'discover';

export type DiscoverCardData = {
	key: string;
	etiquette?: string;
	titre: string;
	description?: string;
	image: string;
	href: string;
};

type GridProps = { cards: DiscoverCardData[] };

// Contenu seul (intro + grille), sans la section/bande décorative — exporté
// à part pour pouvoir être appelé depuis le `<section class="news">` en
// variante tourisme (prop `variant`), qui échange le CONTENU de
// Découvrir et Actualités sans déplacer les wrappers de section eux-mêmes.
// Garde les noms de classes `discover__*` : c'est ce qui embarque le style
// (`Discover/style.scss`) quel que soit l'endroit où ce contenu est rendu.
export function DiscoverGrid({ cards }: GridProps) {
	return (
		<div className="container">
			<div className={`${CLASS_NAME}__intro`}>
				{/* Même traitement que "AGENDA"/"ACTUALITÉS" (`Agenda`, `News`,
				    `&__heading`/`&__title`) — plus d'eyebrow ni de divider. */}
				<h2 className={`${CLASS_NAME}__title`}>Tourisme & Patrimoine</h2>
				<p className={`${CLASS_NAME}__desc`}>
					Entre Limoges et Brive, Saint-Martin vous invite à ralentir. Découvrez ses
					paysages, son patrimoine bâti et la richesse d'un village où il fait bon vivre.
				</p>
			</div>

			<div className={`${CLASS_NAME}__grid`}>
				{cards.map((card) => (
					<article key={card.key} className={`${CLASS_NAME}__card`}>
						<Link href={card.href} className={`${CLASS_NAME}__card-image-wrap`}>
							<Image
								src={card.image}
								alt={card.titre}
								fill
								sizes="(max-width: 1024px) 100vw, 33vw"
								className={`${CLASS_NAME}__card-image`}
								loading="lazy"
							/>
							{card.etiquette && <span className={`${CLASS_NAME}__card-tag`}>{card.etiquette}</span>}
							<div className={`${CLASS_NAME}__card-body`}>
								<h3 className={`${CLASS_NAME}__card-title`}>{card.titre}</h3>
								{card.description && (
									<p className={`${CLASS_NAME}__card-desc`}>{card.description}</p>
								)}
								<div className={`${CLASS_NAME}__card-link`}>
									Voir sur la carte <ArrowRight size={16} aria-hidden="true" />
								</div>
							</div>
						</Link>
					</article>
				))}
			</div>
		</div>
	);
}

type Props = {
	cards: DiscoverCardData[];
	// Variante tourisme : le DOM ne change pas (mêmes blocs, même ordre, mêmes
	// bandes décoratives) — seul le CONTENU de ce bloc (en bas de page, après
	// Mot du Maire) est échangé avec celui de `News` : il porte Actualités à la
	// place de Tourisme & Patrimoine.
	variant?: 'tourisme' | 'defaut';
	articles?: NewsItemData[];
};

export default function Discover({ cards, variant = 'defaut', articles = [] }: Props) {
	return (
		<section id="decouvrir" className={CLASS_NAME}>
			{/* Décoratif — même bande que "Édito municipal" (`MayorWord/index.tsx`),
			    mais jaune et ferrée à droite au lieu de verte à gauche. */}
			<div className={`${CLASS_NAME}__decoration`} aria-hidden="true" />
			{variant === 'tourisme' ? <NewsGrid articles={articles} /> : <DiscoverGrid cards={cards} />}
		</section>
	);
}
