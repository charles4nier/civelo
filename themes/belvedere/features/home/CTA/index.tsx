import type { ContactItem } from '@themes/atelier/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'cta';

export type CTAData = { titre?: string; description?: string; boutonLabel?: string; contacts: ContactItem[] };

const LABELS: Partial<Record<ContactItem['type'], string>> = {
	address: 'Adresse',
	phone: 'Téléphone',
	email: 'Email'
};

const fallbackInfos: ContactItem[] = [
	{ type: 'address', value: 'Le Bourg, 87260 Saint-Hilaire-Bonneval' },
	{ type: 'phone', value: '05 55 00 61 65' },
	{ type: 'email', value: 'contact@saint-hilaire-bonneval.fr' }
];

type Props = { data?: CTAData | null; nomCommune?: string };

export default function CTA({ data, nomCommune }: Props) {
	const infos = (data?.contacts ?? []).filter((c) => c.type in LABELS);
	const emailContact = infos.find((c) => c.type === 'email');

	return (
		<section id="contact" className={CLASS_NAME}>
			<div className="container">
				<div className={`${CLASS_NAME}__card`}>
					<div className={`${CLASS_NAME}__intro`}>
						<span className={`${CLASS_NAME}__eyebrow`}>{nomCommune ? `Mairie de ${nomCommune}` : 'Mairie'}</span>
						<h2 className={`${CLASS_NAME}__title`}>{data?.titre || 'Nous contacter'}</h2>
						<p className={`${CLASS_NAME}__desc`}>
							{data?.description ||
								"La mairie vous accueille du lundi au vendredi, de 9h à 12h et de 14h à 17h. Le secrétariat reste à votre disposition pour toute démarche."}
						</p>
						<a href={emailContact ? `mailto:${emailContact.value}` : '#'} className={`${CLASS_NAME}__link`}>
							{data?.boutonLabel || 'Prendre rendez-vous'} →
						</a>
					</div>

					<dl className={`${CLASS_NAME}__infos`}>
						{(infos.length > 0 ? infos : fallbackInfos).map((info) => (
							<div key={info.type}>
								<dt>{LABELS[info.type]}</dt>
								<dd>{info.value}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}
