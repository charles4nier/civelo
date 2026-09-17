import { Mail, MapPin, Phone, Globe } from 'lucide-react';
import type { ContactItem } from '@themes/atelier/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'cta';

const ICONS = { address: MapPin, phone: Phone, email: Mail, hours: Phone, website: Globe } as const;
const LABELS = { address: 'Adresse', phone: 'Téléphone', email: 'Email', hours: 'Horaires', website: 'Site web' } as const;

export type CTAData = {
	titre?: string;
	description?: string;
	boutonLabel?: string;
	contacts: ContactItem[];
};

type Props = { data: CTAData };

export default function CTA({ data }: Props) {
	return (
		<section id="contact" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__blob ${CLASS_NAME}__blob--top`} />
					<div className={`${CLASS_NAME}__blob ${CLASS_NAME}__blob--bottom`} />

					<div className={`${CLASS_NAME}__grid`}>
						<div className={`${CLASS_NAME}__intro`}>
							<p className={`${CLASS_NAME}__eyebrow`}>Mairie de Saint-Hilaire-Bonneval</p>
							<h2 className={`${CLASS_NAME}__title`}>{data.titre ?? 'Nous contacter'}</h2>
							<div className={`${CLASS_NAME}__divider`} />
							{data.description && <p className={`${CLASS_NAME}__desc`}>{data.description}</p>}
							<a href="/contact" className={`${CLASS_NAME}__btn`}>
								{data.boutonLabel ?? 'Prendre rendez-vous'}
							</a>
						</div>

						<div className={`${CLASS_NAME}__contacts`}>
							{data.contacts.map((c, i) => {
								const Icon = ICONS[c.type];
								return (
									<div key={i} className={`${CLASS_NAME}__contact-item`}>
										<div className={`${CLASS_NAME}__contact-icon`}>
											<Icon size={20} aria-hidden="true" />
										</div>
										<div>
											<div className={`${CLASS_NAME}__contact-label`}>{LABELS[c.type]}</div>
											<div className={`${CLASS_NAME}__contact-value`}>{c.value}</div>
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
