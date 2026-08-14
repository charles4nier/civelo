import Link from 'next/link';
import { Calendar, ArrowRight, Download } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

type NewsItem = {
	date: string;
	cat: string;
	title: string;
	excerpt: string;
	// Comptes-rendus etc. point to a real document, not an article to "read
	// more" of — they get a download-style card instead of "Lire la suite".
	type?: 'document';
	href?: string;
};

const articles: NewsItem[] = [
	{
		date: '12 Mai',
		cat: 'Conseil municipal',
		title: 'Compte-rendu de la séance du 5 mai 2026',
		excerpt:
			"Budget primitif, voirie communale et nouveaux aménagements de l'étang.",
		type: 'document',
		href: '/mairie/publications'
	},
	{
		date: '08 Mai',
		cat: 'Vie locale',
		title: 'Marché de producteurs : nouvelle saison',
		excerpt:
			'Tous les samedis matin sur la place du village, de mai à septembre.'
	},
	{
		date: '01 Mai',
		cat: 'Travaux',
		title: 'Rénovation de la salle des fêtes',
		excerpt:
			"Les travaux débutent en juin pour une livraison prévue à l'automne."
	}
];

export default function News() {
	return (
		<section className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__header`}>
					<div className={`${CLASS_NAME}__header-text`}>
						<p className="eyebrow">Actualités municipales</p>
						<h2 className={`${CLASS_NAME}__title`}>
							Les dernières nouvelles de la commune
						</h2>
						<div className="divider-line" />
					</div>
					<a href="/mairie/actualites" className="btn-outline">
						Toutes les actualités{' '}
						<ArrowRight size={16} aria-hidden="true" />
					</a>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{articles.map((article) =>
						article.type === 'document' && article.href ? (
							<Link
								key={article.title}
								href={article.href}
								className={`${CLASS_NAME}__card ${CLASS_NAME}__card--document`}
							>
								<div className={`${CLASS_NAME}__card-meta`}>
									<span
										className={`${CLASS_NAME}__card-date`}
									>
										<Calendar
											size={14}
											aria-hidden="true"
										/>
										{article.date}
									</span>
									<span
										className={`${CLASS_NAME}__card-sep`}
									/>
									<span className={`${CLASS_NAME}__card-cat`}>
										{article.cat}
									</span>
								</div>
								<h3 className={`${CLASS_NAME}__card-title`}>
									{article.title}
								</h3>
								<p className={`${CLASS_NAME}__card-excerpt`}>
									{article.excerpt}
								</p>
								<div className={`${CLASS_NAME}__card-link`}>
									Voir le document
									<Download size={16} aria-hidden="true" />
								</div>
							</Link>
						) : (
							<article
								key={article.title}
								className={`${CLASS_NAME}__card`}
							>
								<div className={`${CLASS_NAME}__card-meta`}>
									<span
										className={`${CLASS_NAME}__card-date`}
									>
										<Calendar
											size={14}
											aria-hidden="true"
										/>
										{article.date}
									</span>
									<span
										className={`${CLASS_NAME}__card-sep`}
									/>
									<span className={`${CLASS_NAME}__card-cat`}>
										{article.cat}
									</span>
								</div>
								<h3 className={`${CLASS_NAME}__card-title`}>
									{article.title}
								</h3>
								<p className={`${CLASS_NAME}__card-excerpt`}>
									{article.excerpt}
								</p>
							</article>
						)
					)}
				</div>
			</div>
		</section>
	);
}
