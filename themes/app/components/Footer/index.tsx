import { commune } from '@themes/app/config/commune';
import './style.scss';

const C = 'footer';

const navLinks = [
	{ href: '/mairie/actualites', label: 'Votre mairie' },
	{ href: '/tourisme', label: 'Tourisme' },
	{ href: '/demarches', label: 'Démarches' },
	{ href: '/location-salles', label: 'Location de salles' },
	{ href: '/mairie/actualites', label: 'Actualités' },
	{ href: '/contact', label: 'Contact' },
];

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className={C}>
			<div className={`${C}__wave`} />
			<div className={`${C}__inner container`}>
				<div className={`${C}__grid`}>

					<div className={`${C}__brand`}>
						<div className={`${C}__brand-badge`}>
							{commune.departement} · {commune.codePostal}
						</div>
						<p className={`${C}__brand-name`}>{commune.nom}</p>
						<p className={`${C}__brand-desc`}>
							Site officiel de la commune. Au cœur du Limousin, entre nature et patrimoine.
						</p>
					</div>

					<div className={`${C}__col`}>
						<div className={`${C}__col-title`}>Explorer</div>
						<div className={`${C}__col-pills`}>
							{navLinks.map((l) => (
								<a key={l.href} href={l.href} className={`${C}__pill-link`}>
									{l.label}
								</a>
							))}
						</div>
					</div>

					<div className={`${C}__col`}>
						<div className={`${C}__col-title`}>Nous joindre</div>
						<div className={`${C}__contact-list`}>
							<div>{commune.adresse}</div>
							<div style={{ fontWeight: 500 }}>{commune.telephone}</div>
							<a href={`mailto:${commune.email}`} className={`${C}__contact-email`}>
								{commune.email}
							</a>
						</div>
					</div>
				</div>

				<div className={`${C}__bottom`}>
					<div>© {year} Commune de {commune.nom}</div>
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
