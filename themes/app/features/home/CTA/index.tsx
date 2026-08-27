import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import './style.scss';

const B = 'cta';

const contacts = [
	{ icon: MapPin, label: 'Adresse',   value: 'Le Bourg, 87260 La Commune' },
	{ icon: Phone,  label: 'Téléphone', value: '05 55 00 00 00' },
	{ icon: Mail,   label: 'Email',     value: 'contact@commune.fr' },
];

export default function CTA() {
	return (
		<section className={B}>
			<div className={`${B}__inner container`}>
				<div className={`${B}__card`}>
					{/* ── Location de salle ── */}
					<div className={`${B}__location`}>
						<p className={`${B}__eyebrow`}>Réservez votre événement</p>
						<h2 className={`${B}__title`}>
							Location de salles <em>communales</em>
						</h2>
						<p className={`${B}__desc`}>
							Mariage, anniversaire, réunion associative : nos salles s'adaptent à tous vos
							projets, dans un cadre chaleureux au cœur du village.
						</p>
						<Link href="/location-salle" className={`${B}__btn`}>
							Réserver une salle <ArrowRight size={15} />
						</Link>

						<div className={`${B}__images`}>
							<Image src="/village.jpg" alt="Salle des fêtes"   width={300} height={300} loading="lazy" className={`${B}__img ${B}__img--a`} />
							<Image src="/lake.jpg"    alt="Espace extérieur"  width={300} height={300} loading="lazy" className={`${B}__img ${B}__img--b`} />
						</div>
					</div>

					{/* ── Séparateur ── */}
					<div className={`${B}__sep`} aria-hidden="true" />

					{/* ── Nous contacter ── */}
					<div className={`${B}__contact`}>
						<p className={`${B}__eyebrow`}>Mairie</p>
						<h2 className={`${B}__title`}>Nous contacter</h2>
						<p className={`${B}__desc`}>
							Du lundi au vendredi de 9h à 12h et de 14h à 17h. Le secrétariat est à votre
							disposition pour toute démarche administrative.
						</p>

						<div className={`${B}__tiles`}>
							{contacts.map((c) => {
								const Icon = c.icon;
								return (
									<div key={c.label} className={`${B}__tile`}>
										<div className={`${B}__tile-icon`}><Icon size={18} /></div>
										<div>
											<div className={`${B}__tile-label`}>{c.label}</div>
											<div className={`${B}__tile-value`}>{c.value}</div>
										</div>
									</div>
								);
							})}
						</div>

						<a href="mailto:contact@commune.fr" className={`${B}__btn`}>
							Prendre rendez-vous <ArrowRight size={15} />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
