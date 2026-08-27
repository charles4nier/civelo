import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'discover';

const items = [
	{
		img: '/news-garden.jpg',
		tag: 'Nature',
		title: "Nos étangs et plans d'eau",
		desc: 'Pêche, baignade et balades au fil de l\'eau dans un cadre préservé.',
		href: '/tourisme/carte-interactive?category=nature'
	},
	{
		img: '/news-library.jpg',
		tag: 'Randonnée',
		title: 'Sentiers du Limousin',
		desc: 'Plus de 40 km de chemins balisés à travers forêts et bocages.',
		href: '/tourisme/carte-interactive?category=randonnee'
	},
	{
		img: '/village-hero.jpg',
		tag: 'Patrimoine',
		title: "L'âme du village",
		desc: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.',
		href: '/histoire'
	}
];

export default function Discover() {
	return (
		<section id="tourisme" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<span className="eyebrow">Tourisme & Patrimoine</span>
					<h2 className={`${CLASS_NAME}__title`}>Un territoire à vivre, au rythme de la nature</h2>
					<p className={`${CLASS_NAME}__desc`}>
						Entre Limoges et Brive, Saint-Hilaire-Bonneval vous invite à ralentir. Découvrez ses paysages,
						son patrimoine bâti et la richesse d'un village où il fait bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{items.map((item) => (
						<a key={item.title} href={item.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-media`}>
								<Image src={item.img} alt={item.title} fill sizes="(min-width: 1024px) 33vw, 100vw" />
							</div>
							<div className={`${CLASS_NAME}__card-body`}>
								<div className={`${CLASS_NAME}__card-tag`}>{item.tag}</div>
								<h3 className={`${CLASS_NAME}__card-title`}>{item.title}</h3>
								<p className={`${CLASS_NAME}__card-desc`}>{item.desc}</p>
								<span className={`${CLASS_NAME}__card-link`}>
									Voir sur la carte <span className={`${CLASS_NAME}__card-arrow`}>→</span>
								</span>
							</div>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
