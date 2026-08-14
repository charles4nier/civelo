import Image from 'next/image';
import { MapPin } from 'lucide-react';
import EditorialLayout from '@shared/components/EditorialLayout';
import './style.scss';

const C = 'commune';

const stats = [
	{ value: '1 022', label: 'Habitants' },
	{ value: '28,9', suffix: 'km²', label: 'Superficie' },
	{ value: '1', label: 'École primaire publique' },
	{ value: '15+', label: 'Commerces & artisans' },
];

export default function CommunePage() {
	return (
		<EditorialLayout
			heroGradient="linear-gradient(135deg, oklch(0.52 0.17 240), oklch(0.70 0.16 220))"
			breadcrumbLabel="La commune"
			eyebrowIcon={MapPin}
			eyebrowText="Vivre à Saint-Hilaire-Bonneval"
			title="La commune"
			subtitle={
				<>
					<span className={`${C}__subtitle-upper`}>Un village à taille humaine</span>
					<br />
					<span className={`${C}__subtitle-script`}>au cœur du Limousin</span>
				</>
			}
		>
			{/* Bloc 1 : portrait */}
			<section className={`${C}__section`}>
				<div className={`${C}__section-inner container`}>
					<div className={`${C}__block-card editorial__overlap-card`}>
						<p className={`${C}__block-eyebrow`}>Portrait</p>
						<h2 className={`${C}__block-title`}>Une commune rurale aux multiples atouts</h2>
						<div className={`${C}__block-body`}>
							<p>Nichée au cœur de la Haute-Vienne, Saint-Hilaire-Bonneval est une commune rurale qui conjugue douceur de vivre, nature préservée et services de proximité. À quelques kilomètres de Limoges, elle offre un cadre de vie idéal pour les familles comme pour les personnes souhaitant s'éloigner de l'agitation urbaine.</p>
							<p>Avec ses étangs, ses forêts et son patrimoine bâti remarquable, la commune attire chaque année de nouveaux habitants séduits par la qualité de l'environnement et la richesse du tissu associatif et commercial local.</p>
							<p>La municipalité s'engage au quotidien pour maintenir et développer les services essentiels : école, commerces, infrastructures sportives et culturelles, afin que chacun puisse trouver ici sa place.</p>
						</div>
					</div>

					<div className={`${C}__image-grid`}>
						<div className={`${C}__image-main`}>
							<Image src="/saint-hilaire-bonneval-village.jpg" alt="Le bourg de Saint-Hilaire-Bonneval" fill sizes="(max-width: 768px) 100vw, 50vw" className={`${C}__img`} />
						</div>
						<div className={`${C}__image-sub`}>
							<Image src="/saint-hilaire-bonneval-forest.jpg" alt="Forêts et nature" fill sizes="(max-width: 768px) 50vw, 25vw" className={`${C}__img`} />
						</div>
						<div className={`${C}__image-sub`}>
							<Image src="/saint-hilaire-bonneval-lake.jpg" alt="Plan d'eau de Forgeneuve" fill sizes="(max-width: 768px) 50vw, 25vw" className={`${C}__img`} />
						</div>
					</div>
				</div>
			</section>

			{/* Bloc 2 : cadre de vie */}
			<section className={`${C}__section ${C}__section--muted`}>
				<div className={`${C}__evolution container`}>
					<p className={`${C}__evolution-eyebrow`}>Cadre de vie</p>
					<h2 className={`${C}__evolution-title`}>Nature, calme et proximité avec Limoges</h2>
					<div className={`${C}__evolution-divider`} />
					<div className={`${C}__evolution-body`}>
						<p>Saint-Hilaire-Bonneval bénéficie d'une situation géographique privilégiée, à moins de 20 minutes du centre de Limoges, tout en conservant le charme et la tranquillité d'un village rural. Ses habitants profitent du meilleur des deux mondes : la nature à portée de main et l'accès rapide aux services d'une grande ville.</p>
						<p>Le territoire communal est traversé par plusieurs cours d'eau et ponctué d'étangs qui constituent autant de lieux de promenade, de pêche et de détente. Les sentiers balisés permettent d'explorer à pied ou à vélo un paysage de bocage typiquement limousin, préservé et varié.</p>
						<p>L'école primaire publique, le terrain de sport, la salle des fêtes et les nombreuses associations assurent une vie locale dynamique, propice à l'épanouissement de tous, des plus jeunes aux séniors.</p>
						<p>La commune veille également à son développement durable : gestion raisonnée des espaces verts, entretien du patrimoine bâti, soutien aux initiatives locales et accompagnement des projets de ses habitants.</p>
					</div>
				</div>
			</section>

			{/* Bloc 3 : services & chiffres */}
			<section className={`${C}__section`}>
				<div className={`${C}__today container`}>
					<div className={`${C}__today-header`}>
						<p className={`${C}__today-eyebrow`}>Services &amp; vie locale</p>
						<h2 className={`${C}__today-title`}>Tout le nécessaire à portée de la commune</h2>
						<div className={`${C}__today-divider`} />
					</div>
					<div className={`${C}__today-cols`}>
						<div className={`${C}__today-col`}>
							<p>La commune dispose d'un tissu de commerces et d'artisans locaux qui répondent aux besoins du quotidien : alimentation, restauration, artisans du bâtiment, professionnels de santé et bien d'autres encore.</p>
							<p>L'école primaire publique accueille les enfants du village et des communes voisines dans un environnement sécurisé et bienveillant.</p>
							<p>Le réseau associatif est particulièrement riche : sport, culture, entraide, loisirs… Les associations animent la vie locale tout au long de l'année.</p>
						</div>
						<div className={`${C}__today-col`}>
							<p>La mairie assure l'ensemble des services administratifs de proximité : état civil, urbanisme, affichage légal, location de salles communales.</p>
							<p>Les infrastructures sportives et culturelles — terrain de foot, salle polyvalente, aires de jeux — sont entretenues et régulièrement améliorées.</p>
							<p>Saint-Hilaire-Bonneval s'inscrit également dans une démarche de développement touristique en valorisant son patrimoine naturel et bâti.</p>
						</div>
					</div>
					<div className={`${C}__stats`}>
						{stats.map((s) => (
							<div key={s.label} className={`${C}__stat`}>
								<div className={`${C}__stat-value`}>
									{s.value}
									{s.suffix && <span className={`${C}__stat-suffix`}>{s.suffix}</span>}
								</div>
								<p className={`${C}__stat-label`}>{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</EditorialLayout>
	);
}
