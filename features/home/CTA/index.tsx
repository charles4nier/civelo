import { Mail, MapPin, Phone } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'cta';

const contacts = [
	{
		icon: MapPin,
		label: 'Adresse',
		value: 'Le Bourg, 87260 Saint-Hilaire-Bonneval'
	},
	{ icon: Phone, label: 'Téléphone', value: '05 55 00 61 65' },
	{ icon: Mail, label: 'Email', value: 'contact@saint-hilaire-bonneval.fr' }
];

export default function CTA() {
	return (
		<section id="contact" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div
						className={`${CLASS_NAME}__blob ${CLASS_NAME}__blob--top`}
					/>
					<div
						className={`${CLASS_NAME}__blob ${CLASS_NAME}__blob--bottom`}
					/>

					<div className={`${CLASS_NAME}__grid`}>
						<div className={`${CLASS_NAME}__intro`}>
							<p className={`${CLASS_NAME}__eyebrow`}>
								Mairie de Saint-Hilaire-Bonneval
							</p>
							<h2 className={`${CLASS_NAME}__title`}>
								Nous contacter
							</h2>
							<div className={`${CLASS_NAME}__divider`} />
							<p className={`${CLASS_NAME}__desc`}>
								La mairie vous accueille du lundi au vendredi,
								de 9h à 12h et de 14h à 17h. Le secrétariat
								reste à votre disposition pour toute démarche.
							</p>
							<a href="/contact" className={`${CLASS_NAME}__btn`}>
								Prendre rendez-vous
							</a>
						</div>

						<div className={`${CLASS_NAME}__contacts`}>
							{contacts.map((c) => {
								const Icon = c.icon;
								return (
									<div
										key={c.label}
										className={`${CLASS_NAME}__contact-item`}
									>
										<div
											className={`${CLASS_NAME}__contact-icon`}
										>
											<Icon
												size={20}
												aria-hidden="true"
											/>
										</div>
										<div>
											<div
												className={`${CLASS_NAME}__contact-label`}
											>
												{c.label}
											</div>
											<div
												className={`${CLASS_NAME}__contact-value`}
											>
												{c.value}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
