import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const B = 'contact-card';

export type ContactItem =
	| { type: 'address'; value: string }
	| { type: 'hours'; value: string }
	| { type: 'phone'; value: string }
	| { type: 'email'; value: string }
	| { type: 'website'; value: string };

export type IconVariant = 'primary' | 'coral' | 'leaf' | 'muted' | 'sunshine';

// Décision 65 (edito) — reprise ici : les sites web ne sont pas toujours
// écrits avec un protocole (ex. "www.commune.fr") ; `href` en a besoin pour
// rester cliquable, l'affichage garde le texte d'origine.
function websiteHref(value: string) {
	return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

type Props = {
	// Nom d'icône lucide-react (ex. venu de Payload, sérialisable) plutôt
	// qu'une référence de composant — voir shared/lib/icons.ts.
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
	contacts,
}: Props) {
	return (
		<article className={B}>
			<div className={`${B}__top`}>
				<span className={`${B}__category`}>{category}</span>
				<div className={`${B}__icon ${B}__icon--${iconVariant}`}>
					<LucideIconByName name={icon} size={16} strokeWidth={1.75} />
				</div>
			</div>

			<h3 className={`${B}__name`}>{name}</h3>
			{badge && <span className={`${B}__badge`}>{badge}</span>}
			{description && <p className={`${B}__desc`}>{description}</p>}

			{contacts && contacts.length > 0 && (
				<div className={`${B}__contacts`}>
					{contacts.map((c, i) => {
						if (c.type === 'address') return (
							<div key={i} className={`${B}__row`}>
								<MapPin size={13} className={`${B}__row-icon`} />
								<span>{c.value}</span>
							</div>
						);
						if (c.type === 'hours') return (
							<div key={i} className={`${B}__row`}>
								<Clock size={13} className={`${B}__row-icon`} />
								<span>{c.value}</span>
							</div>
						);
						if (c.type === 'phone') {
							const isMultiple = c.value.includes('·');
							return (
								<div key={i} className={`${B}__row`}>
									<Phone size={13} className={`${B}__row-icon`} />
									{isMultiple
										? <span>{c.value}</span>
										: <a href={`tel:${c.value.replace(/[\s.]/g, '')}`} className={`${B}__link`}>{c.value}</a>
									}
								</div>
							);
						}
						if (c.type === 'email') return (
							<div key={i} className={`${B}__row`}>
								<Mail size={13} className={`${B}__row-icon`} />
								<a href={`mailto:${c.value}`} className={`${B}__link`}>{c.value}</a>
							</div>
						);
						if (c.type === 'website') return (
							<div key={i} className={`${B}__row`}>
								<Globe size={13} className={`${B}__row-icon`} />
								<a href={websiteHref(c.value)} target="_blank" rel="noopener noreferrer" className={`${B}__link`}>{c.value}</a>
							</div>
						);
					})}
				</div>
			)}
		</article>
	);
}
