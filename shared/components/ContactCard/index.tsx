import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const B = 'contact-card';

export type ContactItem =
	| { type: 'address'; value: string }
	| { type: 'hours'; value: string }
	| { type: 'phone'; value: string }
	| { type: 'email'; value: string };

export type IconVariant = 'primary' | 'coral' | 'leaf' | 'muted' | 'sunshine';

type Props = {
	// Nom d'icône lucide-react (ex. "Phone"), pas une référence de composant
	// — voir shared/lib/icons.ts pour pourquoi (item 11).
	icon: string;
	iconVariant: IconVariant;
	category: string;
	name: string;
	badge?: string;
	description?: string;
	contacts?: ContactItem[];
};

export default function ContactCard({
	icon,
	iconVariant,
	category,
	name,
	badge,
	description,
	contacts
}: Props) {
	return (
		<article className={B}>
			<div className={`${B}__icon ${B}__icon--${iconVariant}`}>
				<LucideIconByName name={icon} size={20} strokeWidth={1.75} aria-hidden="true" />
			</div>
			<p className={`${B}__category`}>{category}</p>
			<h3 className={`${B}__name`}>
				{badge && <span className={`${B}__badge`}>{badge} — </span>}
				{name}
			</h3>
			{description && <p className={`${B}__desc`}>{description}</p>}
			{contacts && contacts.length > 0 && (
				<div className={`${B}__contacts`}>
					{contacts.map((c, i) => {
						if (c.type === 'address') {
							return (
								<div key={i} className={`${B}__row`}>
									<MapPin
										size={13}
										className={`${B}__row-icon`}
										aria-hidden="true"
									/>
									<span>{c.value}</span>
								</div>
							);
						}
						if (c.type === 'hours') {
							return (
								<div key={i} className={`${B}__row`}>
									<Clock
										size={13}
										className={`${B}__row-icon`}
										aria-hidden="true"
									/>
									<span>{c.value}</span>
								</div>
							);
						}
						if (c.type === 'phone') {
							const isMultiple = c.value.includes('·');
							return (
								<div key={i} className={`${B}__row`}>
									<Phone
										size={13}
										className={`${B}__row-icon`}
										aria-hidden="true"
									/>
									{isMultiple ? (
										<span>{c.value}</span>
									) : (
										<a
											href={`tel:${c.value.replace(/[\s.]/g, '')}`}
											className={`${B}__link`}
										>
											{c.value}
										</a>
									)}
								</div>
							);
						}
						if (c.type === 'email') {
							return (
								<div key={i} className={`${B}__row`}>
									<Mail
										size={13}
										className={`${B}__row-icon`}
										aria-hidden="true"
									/>
									<a
										href={`mailto:${c.value}`}
										className={`${B}__link`}
									>
										{c.value}
									</a>
								</div>
							);
						}
					})}
				</div>
			)}
		</article>
	);
}
