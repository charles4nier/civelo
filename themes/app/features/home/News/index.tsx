import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'news';

const articles = [
	{
		date:      '12 Mai',
		categorie: 'Conseil municipal',
		titre:     'Compte-rendu de la séance du 5 mai 2026',
		resume:    "Budget primitif, voirie communale et nouveaux aménagements de l'étang.",
		href:      '/mairie/comptes-rendus',
	},
	{
		date:      '08 Mai',
		categorie: 'Vie locale',
		titre:     'Marché de producteurs : nouvelle saison',
		resume:    'Tous les samedis matin sur la place du village, de mai à septembre.',
		href:      '/mairie/actualites',
	},
	{
		date:      '01 Mai',
		categorie: 'Travaux',
		titre:     'Rénovation de la salle des fêtes',
		resume:    "Les travaux débutent en juin pour une livraison prévue à l'automne.",
		href:      '/mairie/actualites',
	},
];

export default function News() {
	return (
		<section id="actualites" className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__header`}>
					<div>
						<p className="eyebrow">Actualités municipales</p>
						<h2 className={`${CLASS_NAME}__title`}>Les dernières nouvelles<br />de la commune</h2>
					</div>
					<Link href="/mairie/actualites" className="btn-outline">
						Toutes les actualités <ArrowRight size={14} />
					</Link>
				</div>

				<div className={`${CLASS_NAME}__grid`}>
					{articles.map((a) => (
						<article key={a.titre} className={`${CLASS_NAME}__card`}>
							<div className={`${CLASS_NAME}__card-meta`}>
								<span className={`${CLASS_NAME}__card-date`}>{a.date}</span>
								<span className={`${CLASS_NAME}__card-dot`} />
								<span className={`${CLASS_NAME}__card-cat`}>{a.categorie}</span>
							</div>
							<h3 className={`${CLASS_NAME}__card-title`}>{a.titre}</h3>
							<p className={`${CLASS_NAME}__card-text`}>{a.resume}</p>
							<Link href={a.href} className={`${CLASS_NAME}__card-link`}>
								Lire la suite <ArrowRight size={13} />
							</Link>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

