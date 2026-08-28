import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

export type NewsItemData = {
	key: string;
	date: string; // ISO
	category?: string;
	title: string;
	excerpt: string;
	documentHref?: string;
};

type Props = { articles: NewsItemData[] };

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });

export default function News({ articles }: Props) {
	return (
		<section id="actualites" className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__header`}>
					<div>
						<p className="eyebrow">Actualités municipales</p>
						<h2 className={`${CLASS_NAME}__title`}>
							Les dernières nouvelles
							<br />
							de la commune
						</h2>
					</div>
					<Link href="/mairie/actualites" className="btn-outline">
						Toutes les actualités <ArrowRight size={14} />
					</Link>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{articles.map((a) => (
						<article key={a.key} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-meta`}>
								<span className={`${CLASS_NAME}__card-date`}>{DATE_FORMAT.format(new Date(a.date))}</span>
								{a.category && (
									<>
										<span className={`${CLASS_NAME}__card-dot`} />
										<span className={`${CLASS_NAME}__card-cat`}>{a.category}</span>
									</>
								)}
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{a.title}</h3>
							<p className={`${CLASS_NAME}__card-text`}>{a.excerpt}</p>
							<Link href={a.documentHref ?? '/mairie/actualites'} className={`${CLASS_NAME}__card-link`}>
								Lire la suite <ArrowRight size={13} />
							</Link>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
