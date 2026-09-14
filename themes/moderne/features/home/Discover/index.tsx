import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import WaveSVG from '@themes/moderne/components/WaveSVG';
import './style.scss';

const CLASS_NAME = 'discover';

export type DiscoverCardData = {
	key: string;
	image?: string;
	etiquette?: string;
	titre: string;
	description?: string;
	href: string;
};

type Props = { cards: DiscoverCardData[] };

const FALLBACK_IMAGES = ['/lake.jpg', '/forest.jpg', '/village.jpg'];

export default function Discover({ cards }: Props) {
	return (
		<section id="tourisme" className={CLASS_NAME}>
			{/* Vague haut — absolue, rotée, couleur background (blanc) */}
			<div className={`${CLASS_NAME}__wave-top`} aria-hidden="true">
				<WaveSVG />
			</div>

			{/* Motif diagonal droite */}
			<div className={`${CLASS_NAME}__wave-divider`} aria-hidden="true" />

			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__header`}>
					<p className="eyebrow eyebrow--accent">Tourisme &amp; Patrimoine</p>
					<h2 className={`${CLASS_NAME}__title`}>
						Un territoire à vivre,{' '}
						<em>au rythme de la nature</em>
					</h2>
					<p className={`${CLASS_NAME}__subtitle`}>
						La commune vous invite à ralentir. Découvrez ses paysages, son patrimoine bâti et la richesse d'un lieu où il
						fait bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((c, i) => (
						<Link key={c.key} href={c.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-img`}>
								<Image
									src={c.image ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
									alt={c.titre}
									fill
									sizes="(max-width: 768px) 100vw, 33vw"
									loading="lazy"
								/>
								<div className={`${CLASS_NAME}__card-overlay`} />
								{c.etiquette && <span className={`${CLASS_NAME}__card-tag`}>{c.etiquette}</span>}
								<div className={`${CLASS_NAME}__card-body`}>
									<h3 className={`${CLASS_NAME}__card-title`}>{c.titre}</h3>
									{c.description && <p className={`${CLASS_NAME}__card-text`}>{c.description}</p>}
									<span className={`${CLASS_NAME}__card-link`}>
										Voir sur la carte <ArrowRight size={12} />
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>

			{/* Vague bas — absolue, couleur background (blanc) */}
			<div className={`${CLASS_NAME}__wave-bottom`} aria-hidden="true">
				<WaveSVG />
			</div>
		</section>
	);
}
