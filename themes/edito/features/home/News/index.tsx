import Link from 'next/link';
import { Calendar, ArrowRight, Download } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

export type NewsItemData = {
	key: string;
	date: string; // ISO
	category: string;
	title: string;
	excerpt: string;
	documentHref?: string;
};

type Props = { articles: NewsItemData[] };

function formatShortDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function News({ articles }: Props) {
	return (
		<section className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<div className={`${CLASS_NAME}__header-text`}>
						<p className="eyebrow">Actualités municipales</p>
						<h2 className={`${CLASS_NAME}__title`}>Les dernières nouvelles de la commune</h2>
						<div className="divider-line" />
					</div>
					<a href="/mairie/actualites" className="btn-outline">
						Toutes les actualités <ArrowRight size={16} aria-hidden="true" />
					</a>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{articles.map((article) =>
						article.documentHref ? (
							<Link
								key={article.key}
								href={article.documentHref}
								className={`${CLASS_NAME}__card ${CLASS_NAME}__card--document`}
							>
								<div className={`${CLASS_NAME}__card-meta`}>
									<span className={`${CLASS_NAME}__card-date`}>
										<Calendar size={14} aria-hidden="true" />
										{formatShortDate(article.date)}
									</span>
									<span className={`${CLASS_NAME}__card-sep`} />
									<span className={`${CLASS_NAME}__card-cat`}>{article.category}</span>
								</div>
								<h3 className={`${CLASS_NAME}__card-title`}>{article.title}</h3>
								<p className={`${CLASS_NAME}__card-excerpt`}>{article.excerpt}</p>
								<div className={`${CLASS_NAME}__card-link`}>
									Voir le document
									<Download size={16} aria-hidden="true" />
								</div>
							</Link>
						) : (
							<article key={article.key} className={`${CLASS_NAME}__card`}>
								<div className={`${CLASS_NAME}__card-meta`}>
									<span className={`${CLASS_NAME}__card-date`}>
										<Calendar size={14} aria-hidden="true" />
										{formatShortDate(article.date)}
									</span>
									<span className={`${CLASS_NAME}__card-sep`} />
									<span className={`${CLASS_NAME}__card-cat`}>{article.category}</span>
								</div>
								<h3 className={`${CLASS_NAME}__card-title`}>{article.title}</h3>
								<p className={`${CLASS_NAME}__card-excerpt`}>{article.excerpt}</p>
							</article>
						)
					)}
				</div>
			</div>
		</section>
	);
}
