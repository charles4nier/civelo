import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import WaveSVG from '@themes/app/components/WaveSVG';
import './style.scss';

const CLASS_NAME = 'discover';

const cards = [
	{
		img:  '/lake.jpg',
		tag:  'Nature',
		title: "Nos étangs et plans d'eau",
		text:  "Pêche, baignade et balades au fil de l'eau dans un cadre préservé.",
		href: '/tourisme/carte-interactive?category=nature',
	},
	{
		img:  '/forest.jpg',
		tag:  'Randonnée',
		title: 'Sentiers du Limousin',
		text:  'Plus de 40 km de chemins balisés à travers forêts et bocages.',
		href: '/tourisme/carte-interactive?category=randonnee',
	},
	{
		img:  '/village.jpg',
		tag:  'Patrimoine',
		title: "L'âme du village",
		text:  'Église, lavoirs, croix de chemin : un héritage qui se raconte.',
		href: '/tourisme/carte-interactive?category=patrimoine',
	},
];

export default function Discover() {
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
						Entre Limoges et Brive, Saint-Hilaire-Bonneval vous invite à ralentir.
						Découvrez ses paysages, son patrimoine bâti et la richesse d'un village où il fait bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((c) => (
						<Link key={c.title} href={c.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-img`}>
								<Image src={c.img} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
								<div className={`${CLASS_NAME}__card-overlay`} />
								<span className={`${CLASS_NAME}__card-tag`}>{c.tag}</span>
								<div className={`${CLASS_NAME}__card-body`}>
									<h3 className={`${CLASS_NAME}__card-title`}>{c.title}</h3>
									<p className={`${CLASS_NAME}__card-text`}>{c.text}</p>
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
