import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import type { ContactItem } from '@themes/atelier/components/ContactCard';
import './style.scss';

const B = 'cta';

export type CTAData = {
	titre?: string;
	description?: string;
	boutonLabel?: string;
	contacts: ContactItem[];
};

type Props = { data: CTAData | null };

const ICONS: Partial<Record<ContactItem['type'], typeof MapPin>> = {
	address: MapPin,
	phone: Phone,
	email: Mail
};

const LABELS: Partial<Record<ContactItem['type'], string>> = {
	address: 'Adresse',
	phone: 'Téléphone',
	email: 'Email'
};

export default function CTA({ data }: Props) {
	const contacts = (data?.contacts ?? []).filter((c): c is ContactItem => c.type in ICONS);
	const emailContact = contacts.find((c) => c.type === 'email');

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
							Mariage, anniversaire, réunion associative : nos salles s'adaptent à tous vos projets, dans un cadre
							chaleureux au cœur du village.
						</p>
						<Link href="/location-salle" className={`${B}__btn`}>
							Réserver une salle <ArrowRight size={15} />
						</Link>

						<div className={`${B}__images`}>
							<Image src="/village.jpg" alt="Salle des fêtes" width={300} height={300} loading="lazy" className={`${B}__img ${B}__img--a`} />
							<Image src="/lake.jpg" alt="Espace extérieur" width={300} height={300} loading="lazy" className={`${B}__img ${B}__img--b`} />
						</div>
					</div>

					{/* ── Séparateur ── */}
					<div className={`${B}__sep`} aria-hidden="true" />

					{/* ── Nous contacter ── */}
					<div className={`${B}__contact`}>
						<p className={`${B}__eyebrow`}>Mairie</p>
						<h2 className={`${B}__title`}>{data?.titre || 'Nous contacter'}</h2>
						{data?.description && <p className={`${B}__desc`}>{data.description}</p>}

						{contacts.length > 0 && (
							<div className={`${B}__tiles`}>
								{contacts.map((c) => {
									const Icon = ICONS[c.type]!;
									return (
										<div key={c.type} className={`${B}__tile`}>
											<div className={`${B}__tile-icon`}>
												<Icon size={18} />
											</div>
											<div>
												<div className={`${B}__tile-label`}>{LABELS[c.type]}</div>
												<div className={`${B}__tile-value`}>{c.value}</div>
											</div>
										</div>
									);
								})}
							</div>
						)}

						{emailContact && (
							<a href={`mailto:${emailContact.value}`} className={`${B}__btn`}>
								{data?.boutonLabel || 'Prendre rendez-vous'} <ArrowRight size={15} />
							</a>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
