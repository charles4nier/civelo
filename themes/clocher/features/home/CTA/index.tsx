import { Mail, MapPin, Phone, Globe, Clock } from 'lucide-react';
import type { ContactItem } from '@themes/clocher/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'cta-block';

const ICONS = { address: MapPin, phone: Phone, email: Mail, hours: Clock, website: Globe } as const;
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
					<div className={`${CLASS_NAME}__intro`}>
						<h2 className={`${CLASS_NAME}__title`}>{data.titre ?? 'Nous contacter'}</h2>
						{data.description && <p className={`${CLASS_NAME}__desc`}>{data.description}</p>}
						<a href="/contact" className={`${CLASS_NAME}__btn`}>
							{data.boutonLabel ?? 'Prendre rendez-vous'}
						</a>
					</div>

					<dl className={`${CLASS_NAME}__contacts`}>
						{data.contacts.map((c, i) => {
							const Icon = ICONS[c.type];
							return (
								<div key={i} className={`${CLASS_NAME}__contact-item`}>
									<dt className={`${CLASS_NAME}__contact-label`}>
										<Icon size={14} aria-hidden="true" />
										{LABELS[c.type]}
									</dt>
									<dd className={`${CLASS_NAME}__contact-value`}>{c.value}</dd>
								</div>
							);
						})}
					</dl>
				</div>
			</div>
		</section>
	);
}
