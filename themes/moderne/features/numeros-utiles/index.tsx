import { Phone } from 'lucide-react';
import PageHeader from '@themes/moderne/components/PageHeader';
import { getNumerosUtilesData } from '@lib/payload';
import './style.scss';

const CLASS_NAME = 'numeros';

const fallbackUrgences = [
	{ key: '15',   number: '15',   label: 'SAMU',                           desc: 'Urgences médicales',                        color: 'red' },
	{ key: '17',   number: '17',   label: 'Police / Gendarmerie',           desc: 'Urgences sécurité',                         color: 'blue' },
	{ key: '18',   number: '18',   label: 'Pompiers',                       desc: 'Incendie & secours',                        color: 'red' },
	{ key: '112',  number: '112',  label: 'Numéro européen',                desc: 'Toutes urgences depuis un mobile',          color: 'blue' },
	{ key: '3919', number: '3919', label: 'Violences conjugales',           desc: 'Femmes victimes de violences, 24h/24',      color: 'muted' },
];

const fallbackLocaux = [
	{ key: 'mairie', label: 'Mairie de la commune', number: '00 00 00 00 00', detail: 'Lun – Ven : 9h – 12h / 14h – 17h', href: 'tel:+330000000000' },
];

export default async function NumerosUtilesPage() {
	const data = await getNumerosUtilesData('numeros-utiles');
	const urgences = data?.urgences.length ? data.urgences : fallbackUrgences;
	const locaux = data?.locaux.length ? data.locaux : fallbackLocaux;

	return (
		<>
			<PageHeader
				breadcrumb="Numéros utiles"
				eyebrowIcon={Phone}
				eyebrow="Services & urgences"
				title="Numéros utiles"
				subtitle={<>Numéros d'urgence nationaux et services locaux<br />à portée de main en toutes circonstances.</>}
			/>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>

					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>Numéros d'urgence</p>
						<h2 className={`${CLASS_NAME}__block-title`}>En cas d'urgence, appelez le bon numéro</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__urgences`}>
							{urgences.map((u) => (
								<a key={u.key} href={`tel:${u.number}`} className={`${CLASS_NAME}__urgence ${CLASS_NAME}__urgence--${u.color}`}>
									<span className={`${CLASS_NAME}__urgence-number`}>{u.number}</span>
									<div className={`${CLASS_NAME}__urgence-info`}>
										<span className={`${CLASS_NAME}__urgence-label`}>{u.label}</span>
										{u.desc && <span className={`${CLASS_NAME}__urgence-desc`}>{u.desc}</span>}
									</div>
									<Phone size={16} className={`${CLASS_NAME}__urgence-icon`} />
								</a>
							))}
						</div>
					</div>

					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>Services locaux</p>
						<h2 className={`${CLASS_NAME}__block-title`}>Contacts de la commune</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__locaux`}>
							{locaux.map((l) => (
								<div key={l.key} className={`${CLASS_NAME}__local`}>
									<div className={`${CLASS_NAME}__local-icon`}>
										<Phone size={18} strokeWidth={1.5} />
									</div>
									<div className={`${CLASS_NAME}__local-info`}>
										<p className={`${CLASS_NAME}__local-label`}>{l.label}</p>
										{l.detail && <p className={`${CLASS_NAME}__local-detail`}>{l.detail}</p>}
									</div>
									<a href={l.href} className={`${CLASS_NAME}__local-number`}>{l.number}</a>
								</div>
							))}
						</div>
					</div>

				</div>
			</section>
		</>
	);
}
