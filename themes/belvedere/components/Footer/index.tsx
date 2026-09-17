import { MapPin, Clock, Facebook } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'footer';

type NavLink = { label: string; href: string; children?: { label: string; href: string }[] };

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
	const exploreLinks = navLinks
		.map((link) => ({ href: link.children?.[0]?.href ?? link.href, label: link.label }))
		.filter((l) => l.href !== '#');

	return (
		<footer className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__brand`}>
						<span className={`${CLASS_NAME}__brand-name`}>{identite.titre}</span>
						<p className={`${CLASS_NAME}__brand-desc`}>
							{data.description}
							{data.adresse && (
								<>
									<br />
									{data.adresse}
								</>
							)}
							{data.telephone && (
								<>
									<br />
									Tél : {data.telephone}
								</>
							)}
						</p>
						{data.facebook && (
							<a href={data.facebook} className={`${CLASS_NAME}__social`}>
								<Facebook size={16} />
								Suivez-nous sur Facebook
							</a>
						)}
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>Navigation</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							{exploreLinks.map((l) => (
								<li key={l.href}>
									<a href={l.href}>{l.label}</a>
								</li>
							))}
						</ul>
						{(data.adresse || data.horaires) && (
							<div className={`${CLASS_NAME}__address`}>
								{data.adresse && (
									<div className={`${CLASS_NAME}__address-item`}>
										<MapPin size={14} />
										<span>{data.adresse}</span>
									</div>
								)}
								{data.horaires && (
									<div className={`${CLASS_NAME}__address-item`}>
										<Clock size={14} />
										<span>{data.horaires}</span>
									</div>
								)}
							</div>
						)}
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>Informations</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							<li><a href="#">Mentions légales</a></li>
							<li><a href="#">Accessibilité</a></li>
						</ul>
					</div>
				</div>

				<div className={`${CLASS_NAME}__bottom`}>
					<span>© {year} {identite.titre}</span>
					<span>Site officiel de la mairie</span>
				</div>
			</div>
		</footer>
	);
}
