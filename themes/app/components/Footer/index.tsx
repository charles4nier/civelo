import type { NavLink } from '@themes/app/components/MegaMenu';
import './style.scss';

const C = 'footer';

type Props = {
	navLinks: NavLink[];
	identite: { titre: string; sousTitre?: string; logoUrl: string };
	data: {
		description: string;
		adresse?: string;
		telephone?: string;
		email?: string;
		siteWeb?: string;
		joursOuverture?: string;
		horaires?: string;
		facebook?: string;
		instagram?: string;
	};
};

export default function Footer({ navLinks, identite, data }: Props) {
	const year = new Date().getFullYear();
	// Colonne "Explorer" — un lien par section du menu principal (pas la
	// liste complète des 18 pages, juste un point d'entrée par thématique).
	const explorerLinks = navLinks
		.map((link) => ({ href: link.children?.[0]?.href ?? link.href, label: link.label }))
		.filter((l) => l.href !== '#');

	return (
		<footer className={C}>
			<div className={`${C}__wave`} />
			<div className={`${C}__inner container`}>
				<div className={`${C}__grid`}>

					<div className={`${C}__brand`}>
						{identite.sousTitre && <div className={`${C}__brand-badge`}>{identite.sousTitre}</div>}
						<p className={`${C}__brand-name`}>{identite.titre}</p>
						<p className={`${C}__brand-desc`}>{data.description}</p>
					</div>

					<div className={`${C}__col`}>
						<div className={`${C}__col-title`}>Explorer</div>
						<div className={`${C}__col-pills`}>
							{explorerLinks.map((l) => (
								<a key={l.href} href={l.href} className={`${C}__pill-link`}>
									{l.label}
								</a>
							))}
						</div>
					</div>

					<div className={`${C}__col`}>
						<div className={`${C}__col-title`}>Nous joindre</div>
						<div className={`${C}__contact-list`}>
							{data.adresse && <div>{data.adresse}</div>}
							{data.telephone && <div style={{ fontWeight: 500 }}>{data.telephone}</div>}
							{data.email && (
								<a href={`mailto:${data.email}`} className={`${C}__contact-email`}>
									{data.email}
								</a>
							)}
						</div>
					</div>
				</div>

				<div className={`${C}__bottom`}>
					<div>© {year} {identite.titre}</div>
					<div className={`${C}__bottom-links`}>
						<a href="#">Mentions légales</a>
						<span style={{ opacity: 0.2 }}>·</span>
						<a href="#">Accessibilité</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
