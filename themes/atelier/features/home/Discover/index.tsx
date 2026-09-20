import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

type Props = { cards: DiscoverCardData[] };

export default function Discover({ cards }: Props) {
	return (
		<section id="decouvrir" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__intro`}>
					<p className="eyebrow">Tourisme & Patrimoine</p>
					<h2 className={`${CLASS_NAME}__title`}>Un territoire à vivre, au rythme de la nature</h2>
					<div className="divider-line" />
					<p className={`${CLASS_NAME}__desc`}>
						Entre Limoges et Brive, Saint-Martin vous invite à ralentir. Découvrez ses
						paysages, son patrimoine bâti et la richesse d'un village où il fait bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((card, i) => (
						<article
							key={card.key}
							className={`${CLASS_NAME}__card ${i === 0 ? `${CLASS_NAME}__card--featured` : ''}`}
						>
							<Link href={card.href} className={`${CLASS_NAME}__card-image-wrap`}>
								<Image
									src={card.image}
									alt={card.titre}
									fill
									sizes={i === 0 ? '(max-width: 1024px) 100vw, 33vw' : '(max-width: 1024px) 100vw, 22vw'}
									className={`${CLASS_NAME}__card-image`}
									loading="lazy"
								/>
								<div className={`${CLASS_NAME}__card-overlay`} />
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
		</section>
	);
}
