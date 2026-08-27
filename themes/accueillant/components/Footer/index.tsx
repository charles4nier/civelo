import { MapPin, Clock, Facebook } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'footer';

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className={CLASS_NAME}>
			<div className={`${CLASS_NAME}__inner container`}>
				<div className={`${CLASS_NAME}__grid`}>
					<div className={`${CLASS_NAME}__brand`}>
						<span className={`${CLASS_NAME}__brand-name`}>Saint-Hilaire-Bonneval</span>
						<p className={`${CLASS_NAME}__brand-desc`}>
							Mairie de Saint-Hilaire-Bonneval
							<br />
							Le Bourg, 87260 Saint-Hilaire-Bonneval
							<br />
							Tél : 05 55 00 61 65
						</p>
						<a href="#" className={`${CLASS_NAME}__social`}>
							<Facebook size={16} />
							Suivez-nous sur Facebook
						</a>
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>Navigation</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							<li><a href="#">Mentions légales</a></li>
							<li><a href="#contact">Contactez-nous</a></li>
							<li><a href="#">Plan du site</a></li>
						</ul>
						<div className={`${CLASS_NAME}__address`}>
							<div className={`${CLASS_NAME}__address-item`}>
								<MapPin size={14} />
								<span>
									Le Bourg
									<br />
									87260 Saint-Hilaire-Bonneval
								</span>
							</div>
							<div className={`${CLASS_NAME}__address-item`}>
								<Clock size={14} />
								<span>Mar–Ven · 9h–12h / 14h–17h</span>
							</div>
						</div>
					</div>

					<div className={`${CLASS_NAME}__col`}>
						<h4 className={`${CLASS_NAME}__col-title`}>Suivez-nous</h4>
						<ul className={`${CLASS_NAME}__col-links`}>
							<li><a href="#">Facebook</a></li>
							<li><a href="#">Instagram</a></li>
							<li><a href="#">Newsletter</a></li>
						</ul>
					</div>
				</div>

				<div className={`${CLASS_NAME}__bottom`}>
					<span>© {year} Commune de Saint-Hilaire-Bonneval</span>
					<span>Site officiel de la mairie</span>
				</div>
			</div>
		</footer>
	);
}
