import Image from 'next/image';
import { MapPin, Clock, Facebook } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'footer';

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner`}>
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__brand`}>
						<div className={`${CLASS_NAME}__brand-logo`}>
							<div className={`${CLASS_NAME}__brand-badge`}>
								<Image
									src="/saint-hilaire-bonneval-logo.png"
									alt="Blason de Saint-Hilaire-Bonneval"
									width={36}
									height={36}
								/>
							</div>
							<div>
								<div className={`${CLASS_NAME}__brand-name`}>
									Commune de Saint-Hilaire-Bonneval
								</div>
								<div className={`${CLASS_NAME}__brand-sub`}>
									Haute-Vienne · 87260
								</div>
							</div>
						</div>
						<p className={`${CLASS_NAME}__brand-desc`}>
							Site officiel de la Mairie de
							Saint-Hilaire-Bonneval. Retrouvez ici toutes les
							informations relatives à la vie municipale, aux
							services publics et au territoire communal.
						</p>
						<p className={`${CLASS_NAME}__brand-motto`}>
							République Française · Liberté · Égalité ·
							Fraternité
						</p>
						<a href="#" className={`${CLASS_NAME}__social`}>
							<Facebook size={16} aria-hidden="true" />
							Suivez-nous sur Facebook
						</a>
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>
							La mairie
						</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							<li>
								<a href="#">Délibérations & arrêtés</a>
							</li>
							<li>
								<a href="#">Démarches en ligne</a>
							</li>
							<li>
								<a href="#">Marchés publics</a>
							</li>
						</ul>
						<div className={`${CLASS_NAME}__address`}>
							<div className={`${CLASS_NAME}__address-item`}>
								<MapPin size={14} aria-hidden="true" />
								<span>
									Place de la Mairie
									<br />
									87260 Saint-Hilaire-Bonneval
								</span>
							</div>
							<div className={`${CLASS_NAME}__address-item`}>
								<Clock size={14} aria-hidden="true" />
								<span>Lun–Ven · 9h–12h / 14h–17h</span>
							</div>
						</div>
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>
							Découvrir
						</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							<li>
								<a href="#">Tourisme & loisirs</a>
							</li>
							<li>
								<a href="#">Vie associative</a>
							</li>
							<li>
								<a href="#">Agenda communal</a>
							</li>
							<li>
								<a href="#">Patrimoine</a>
							</li>
						</ul>
					</div>
				</div>

				<div className={`${CLASS_NAME}__bottom`}>
					<div>
						© {year} Mairie de Saint-Hilaire-Bonneval · Tous droits
						réservés
					</div>
					<div className={`${CLASS_NAME}__bottom-links`}>
						<a href="#">Mentions légales</a>
						<a href="#">Accessibilité</a>
						<a href="#">Confidentialité</a>
						<a href="#">Plan du site</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
