import Image from 'next/image';
import Link from 'next/link';
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
				<h2 className={`${CLASS_NAME}__title`}>Un territoire à vivre, au rythme de la commune</h2>

				<div className={`${CLASS_NAME}__grid`}>
					{cards.map((card) => (
						<Link key={card.key} href={card.href} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__image-wrap`}>
								<Image
									src={card.image}
									alt={card.titre}
									fill
									sizes="(max-width: 1024px) 100vw, 33vw"
									className={`${CLASS_NAME}__image`}
									loading="lazy"
								/>
							</div>
							<div className={`${CLASS_NAME}__body`}>
								{card.etiquette && <span className={`${CLASS_NAME}__tag`}>{card.etiquette}</span>}
								<h3 className={`${CLASS_NAME}__card-title`}>{card.titre}</h3>
								{card.description && (
									<p className={`${CLASS_NAME}__desc`}>{card.description}</p>
								)}
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
