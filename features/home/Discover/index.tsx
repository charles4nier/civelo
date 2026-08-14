import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'discover';

const cards = [
	{
		src: '/saint-hilaire-bonneval-lake.jpg',
		tag: 'Nature',
		title: "Nos étangs et plans d'eau",
		desc: "Pêche, baignade et balades au fil de l'eau dans un cadre préservé.",
		href: '/tourisme/carte-interactive?id=etang-bonneval'
	},
	{
		src: '/saint-hilaire-bonneval-forest.jpg',
		tag: 'Randonnée',
		title: 'Sentiers du Limousin',
		desc: 'Plus de 40 km de chemins balisés à travers forêts et bocages.',
		href: '/tourisme/carte-interactive?id=sentier-cretes'
	},
	{
		src: '/saint-hilaire-bonneval-village.jpg',
		tag: 'Patrimoine',
		title: "L'âme du village",
		desc: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.',
		href: '/tourisme/carte-interactive?id=eglise'
	}
];

export default function Discover() {
	return (
		<section id="decouvrir" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__intro`}>
					<p className="eyebrow">Tourisme & Patrimoine</p>
					<h2 className={`${CLASS_NAME}__title`}>
						Un territoire à vivre, au rythme de la nature
					</h2>
					<div className="divider-line" />
					<p className={`${CLASS_NAME}__desc`}>
						Entre Limoges et Brive, Saint-Hilaire-Bonneval vous
						invite à ralentir. Découvrez ses paysages, son
						patrimoine bâti et la richesse d'un village où il fait
						bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((card, i) => (
						<article
							key={card.title}
							className={`${CLASS_NAME}__card ${i === 0 ? `${CLASS_NAME}__card--featured` : ''}`}
						>
							<Link
								href={card.href}
								className={`${CLASS_NAME}__card-image-wrap`}
							>
								<Image
									src={card.src}
									alt={card.title}
									fill
									sizes={
										i === 0
											? '(max-width: 1024px) 100vw, 33vw'
											: '(max-width: 1024px) 100vw, 22vw'
									}
									className={`${CLASS_NAME}__card-image`}
									loading="lazy"
								/>
								<div
									className={`${CLASS_NAME}__card-overlay`}
								/>
								<span className={`${CLASS_NAME}__card-tag`}>
									{card.tag}
								</span>
								<div className={`${CLASS_NAME}__card-body`}>
									<h3 className={`${CLASS_NAME}__card-title`}>
										{card.title}
									</h3>
									<p className={`${CLASS_NAME}__card-desc`}>
										{card.desc}
									</p>
									<div className={`${CLASS_NAME}__card-link`}>
										Voir sur la carte{' '}
										<ArrowRight
											size={16}
											aria-hidden="true"
										/>
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
