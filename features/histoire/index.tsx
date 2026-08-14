import Image from 'next/image';
import { ScrollText } from 'lucide-react';
import EditorialLayout from '@shared/components/EditorialLayout';
import './style.scss';

const H = 'histoire';

const stats = [
	{ value: 'XI', suffix: 'ᵉ s.', label: 'Premières mentions historiques' },
	{ value: '1875', label: 'Aménagement du patrimoine naturel' },
	{ value: '1934', label: 'Développement économique local' },
	{ value: '50 km', label: 'De sentiers balisés' },
];

export default function HistoirePage() {
	return (
		<EditorialLayout
			heroGradient="linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))"
			breadcrumbLabel="Histoire"
			eyebrowIcon={ScrollText}
			eyebrowText="Patrimoine & Mémoire"
			title="Histoire de Saint-Hilaire-Bonneval"
			subtitle={
				<>
					<span className={`${H}__subtitle-upper`}>Un village aux racines profondes</span>
					<br />
					<span className={`${H}__subtitle-script`}>au cœur du Limousin</span>
				</>
			}
		>
			{/* Bloc 1 : origines */}
			<section className={`${H}__section`}>
				<div className={`${H}__section-inner container`}>
					<div className={`${H}__block-card editorial__overlap-card`}>
						<p className={`${H}__block-eyebrow`}>Aux origines</p>
						<h2 className={`${H}__block-title`}>Des premières traces à la formation de la commune</h2>
						<div className={`${H}__block-body`}>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.</p>
						</div>
					</div>

					<div className={`${H}__image-grid`}>
						<div className={`${H}__image-main`}>
							<Image src="/saint-hilaire-bonneval-village.jpg" alt="Le bourg de Saint-Hilaire-Bonneval" fill sizes="(max-width: 768px) 100vw, 50vw" className={`${H}__img`} />
						</div>
						<div className={`${H}__image-sub`}>
							<Image src="/saint-hilaire-bonneval-forest.jpg" alt="Forêt et patrimoine naturel" fill sizes="(max-width: 768px) 50vw, 25vw" className={`${H}__img`} />
						</div>
						<div className={`${H}__image-sub`}>
							<Image src="/saint-hilaire-bonneval-lake.jpg" alt="Plan d'eau de Forgeneuve" fill sizes="(max-width: 768px) 50vw, 25vw" className={`${H}__img`} />
						</div>
					</div>
				</div>
			</section>

			{/* Bloc 2 : évolution */}
			<section className={`${H}__section ${H}__section--muted`}>
				<div className={`${H}__evolution container`}>
					<p className={`${H}__evolution-eyebrow`}>Évolution</p>
					<h2 className={`${H}__evolution-title`}>Un bourg qui grandit au fil des siècles</h2>
					<div className={`${H}__evolution-divider`} />
					<div className={`${H}__evolution-body`}>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.</p>
						<p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit. Ut labore et dolore magnam aliquam quaerat voluptatem.</p>
						<p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.</p>
						<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.</p>
					</div>
				</div>
			</section>

			{/* Bloc 3 : aujourd'hui */}
			<section className={`${H}__section`}>
				<div className={`${H}__today container`}>
					<div className={`${H}__today-header`}>
						<p className={`${H}__today-eyebrow`}>Aujourd'hui</p>
						<h2 className={`${H}__today-title`}>Tourisme, agriculture et patrimoine vivant</h2>
						<div className={`${H}__today-divider`} />
					</div>
					<div className={`${H}__today-cols`}>
						<div className={`${H}__today-col`}>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
							<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
						</div>
						<div className={`${H}__today-col`}>
							<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.</p>
							<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
						</div>
					</div>
					<div className={`${H}__stats`}>
						{stats.map((s) => (
							<div key={s.label} className={`${H}__stat`}>
								<div className={`${H}__stat-value`}>
									{s.value}
									{s.suffix && <span className={`${H}__stat-suffix`}>{s.suffix}</span>}
								</div>
								<p className={`${H}__stat-label`}>{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</EditorialLayout>
	);
}
