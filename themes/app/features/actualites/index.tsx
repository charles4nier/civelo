'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Newspaper, ArrowRight } from 'lucide-react';
import PageHeader from '@themes/app/components/PageHeader';
import FilterBar from '@themes/app/components/FilterBar';
import './style.scss';

const B = 'actualites';

type Category = 'Mairie' | 'Vie locale' | 'Travaux' | 'Événements';
type Article = { date: string; cat: Category; title: string; excerpt: string };

const articles: Article[] = [
	{ date: '2026-05-12', cat: 'Mairie',      title: 'Compte-rendu de la séance du 5 mai 2026', excerpt: "Budget primitif, voirie communale et nouveaux aménagements de l'étang. Retrouvez le compte-rendu complet de la dernière séance du conseil municipal." },
	{ date: '2026-05-08', cat: 'Vie locale',  title: 'Marché de producteurs : nouvelle saison', excerpt: 'Tous les samedis matin sur la place du village, de mai à septembre. Venez retrouver vos producteurs locaux et découvrir les nouveautés de la saison.' },
	{ date: '2026-05-01', cat: 'Travaux',     title: 'Rénovation de la salle des fêtes', excerpt: "Les travaux débutent en juin pour une livraison prévue à l'automne. La salle sera entièrement rénovée pour accueillir les événements communaux dans de meilleures conditions." },
	{ date: '2026-04-24', cat: 'Événements',  title: 'Fête de la commune — 14 juillet 2026', excerpt: "Programme complet des festivités du 14 juillet : animations, feu d'artifice et bal populaire. Toutes les informations seront communiquées prochainement." },
	{ date: '2026-04-18', cat: 'Mairie',      title: 'Appel à projets — subventions aux associations 2026', excerpt: "La mairie lance son appel à projets annuel pour l'attribution de subventions aux associations locales. Dossiers à déposer avant le 30 mai." },
	{ date: '2026-04-10', cat: 'Travaux',     title: 'Réfection de la voirie — rue du Lavoir', excerpt: 'Des travaux de réfection de la chaussée débutent semaine prochaine rue du Lavoir. Circulation alternée prévue du lundi au vendredi pendant deux semaines.' },
	{ date: '2026-04-02', cat: 'Vie locale',  title: 'Assemblée générale du Foyer rural', excerpt: "Le Foyer rural tient son assemblée générale annuelle. Bilan d'activités, projets 2026 et élection du bureau." },
	{ date: '2026-03-25', cat: 'Événements',  title: 'Vide-grenier de printemps', excerpt: 'Le comité des fêtes organise son vide-grenier annuel sur la place du bourg. Inscriptions ouvertes auprès du secrétariat de mairie.' },
];

const filters: ('Tous' | Category)[] = ['Tous', 'Mairie', 'Vie locale', 'Travaux', 'Événements'];

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ActualitesPage() {
	const [active, setActive]           = useState<'Tous' | Category>('Tous');
	const [stuck, setStuck]             = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const sentinelRef                   = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => setStuck(!entry.isIntersecting),
			{ rootMargin: '-80px 0px 0px 0px', threshold: 0 },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const filtered = useMemo(
		() => (active === 'Tous' ? articles : articles.filter((a) => a.cat === active)).sort((a, b) => b.date.localeCompare(a.date)),
		[active],
	);

	const counts = useMemo(() => {
		const map: Partial<Record<'Tous' | Category, number>> = { Tous: articles.length };
		for (const a of articles) map[a.cat] = (map[a.cat] ?? 0) + 1;
		return map;
	}, []);

	return (
		<>
			<PageHeader
				breadcrumb="Actualités"
				eyebrowIcon={Newspaper}
				eyebrow="Votre mairie"
				title="Actualités"
				subtitle={<>Conseil municipal, vie locale, travaux et événements :<br />toutes les nouvelles de la commune.</>}
			/>

			<section className={`${B}__section`}>
				<div className={`${B}__head container`}>
					<p className={`${B}__head-eyebrow`}>Fil d'actualité</p>
					<h2 className={`${B}__head-title`}>
						<span className={`${B}__head-num`}>{filtered.length}</span>{' '}
						{filtered.length > 1 ? 'articles' : 'article'}
					</h2>
				</div>

				<div ref={sentinelRef} style={{ height: 1 }} />

				<FilterBar
					filters={filters}
					active={active}
					counts={counts as Record<string, number>}
					onSelect={(f) => { setActive(f as 'Tous' | Category); setFiltersOpen(false); }}
					stuck={stuck}
					filtersOpen={filtersOpen}
					onToggle={() => setFiltersOpen((o) => !o)}
				/>

				<div className={`${B}__body container`}>
					<div className={`${B}__grid`}>
						{filtered.map((article) => (
							<article key={article.title} className={`${B}__card`}>
								<div className={`${B}__card-top`}>
									<span className={`${B}__card-badge`}>{article.cat}</span>
									<span className={`${B}__card-date`}>
										<Calendar size={12} />
										{formatDate(article.date)}
									</span>
								</div>
								<h2 className={`${B}__card-title`}>{article.title}</h2>
								<p className={`${B}__card-excerpt`}>{article.excerpt}</p>
								<div className={`${B}__card-link`}>
									Lire la suite <ArrowRight size={14} />
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
