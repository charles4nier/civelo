import './style.scss';

const CLASS_NAME = 'cta';

export default function CTA() {
	return (
		<section id="contact" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__intro`}>
						<span className={`${CLASS_NAME}__eyebrow`}>Mairie de Saint-Hilaire-Bonneval</span>
						<h2 className={`${CLASS_NAME}__title`}>Nous contacter</h2>
						<p className={`${CLASS_NAME}__desc`}>
							La mairie vous accueille du lundi au vendredi, de 9h à 12h et de 14h à 17h. Le secrétariat
							reste à votre disposition pour toute démarche.
						</p>
						<a href="#" className={`${CLASS_NAME}__link`}>
							Prendre rendez-vous →
						</a>
					</div>

					<dl className={`${CLASS_NAME}__infos`}>
						<div>
							<dt>Adresse</dt>
							<dd>Le Bourg, 87260 Saint-Hilaire-Bonneval</dd>
						</div>
						<div>
							<dt>Téléphone</dt>
							<dd>05 55 00 61 65</dd>
						</div>
						<div>
							<dt>Email</dt>
							<dd>contact@saint-hilaire-bonneval.fr</dd>
						</div>
					</dl>
				</div>
			</div>
		</section>
	);
}
