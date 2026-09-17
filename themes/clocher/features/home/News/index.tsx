import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news-block';

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
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function News({ articles }: Props) {
	return (
		<div className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__header`}>
				<h2 className={`${CLASS_NAME}__title`}>À la une</h2>
				<Link href="/mairie/actualites" className={`${CLASS_NAME}__link`}>
					Voir toutes les actualités
					<ArrowRight size={14} aria-hidden="true" />
				</Link>
			</div>

			<div className={`${CLASS_NAME}__grid`}>
				{articles.map((article) => {
					const inner = (
						<>
							<div className={`${CLASS_NAME}__meta`}>
								<span className={`${CLASS_NAME}__badge`}>{article.category}</span>
								<span className={`${CLASS_NAME}__date`}>{formatShortDate(article.date)}</span>
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{article.title}</h3>
							<p className={`${CLASS_NAME}__excerpt`}>{article.excerpt}</p>
							<span className={`${CLASS_NAME}__read-more`}>
								Lire la suite
								<ArrowRight size={13} aria-hidden="true" />
							</span>
						</>
					);
					return article.documentHref ? (
						<Link key={article.key} href={article.documentHref} className={`${CLASS_NAME}__card`}>
							{inner}
						</Link>
					) : (
						<article key={article.key} className={`${CLASS_NAME}__card`}>
							{inner}
						</article>
					);
				})}
			</div>
		</div>
	);
}
