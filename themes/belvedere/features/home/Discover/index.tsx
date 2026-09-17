import Image from 'next/image';
import './style.scss';

const CLASS_NAME = 'discover';

export type DiscoverCardData = { key: string; image?: string; etiquette?: string; titre: string; description?: string; href: string };

const FALLBACK_IMAGES = ['/news-garden.jpg', '/news-library.jpg', '/village-hero.jpg'];

const fallbackCards: DiscoverCardData[] = [
	{ key: '0', image: '/news-garden.jpg', etiquette: 'Nature', titre: "Nos étangs et plans d'eau", description: "Pêche, baignade et balades au fil de l'eau dans un cadre préservé.", href: '/tourisme/carte-interactive?category=nature' },
	{ key: '1', image: '/news-library.jpg', etiquette: 'Randonnée', titre: 'Sentiers du Limousin', description: 'Plus de 40 km de chemins balisés à travers forêts et bocages.', href: '/tourisme/carte-interactive?category=randonnee' },
	{ key: '2', image: '/village-hero.jpg', etiquette: 'Patrimoine', titre: "L'âme du village", description: 'Église, lavoirs, croix de chemin : un héritage qui se raconte.', href: '/histoire' }
];

type Props = { cards?: DiscoverCardData[] };

export default function Discover({ cards = fallbackCards }: Props) {
	return (
		<section id="tourisme" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<span className="eyebrow">Tourisme & Patrimoine</span>
					<h2 className={`${CLASS_NAME}__title`}>Un territoire à vivre, au rythme de la nature</h2>
					<p className={`${CLASS_NAME}__desc`}>
						La commune vous invite à ralentir. Découvrez ses paysages, son patrimoine bâti et la richesse d'un lieu où
						il fait bon vivre.
					</p>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((item, i) => (
						<a key={item.key} href={item.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-media`}>
								<Image
									src={item.image ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
									alt={item.titre}
									fill
									sizes="(min-width: 1024px) 33vw, 100vw"
								/>
							</div>
							<div className={`${CLASS_NAME}__card-body`}>
								{item.etiquette && <div className={`${CLASS_NAME}__card-tag`}>{item.etiquette}</div>}
								<h3 className={`${CLASS_NAME}__card-title`}>{item.titre}</h3>
								{item.description && <p className={`${CLASS_NAME}__card-desc`}>{item.description}</p>}
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
