import { Clock, AlertCircle } from 'lucide-react';
import PageHeader from '@themes/preau/components/PageHeader';
import ContactCard, { type ContactItem, type IconVariant } from '@themes/preau/components/ContactCard';
import './style.scss';

const B = 'horaires-layout';

export type ScheduleDay = { day: string; morning: string; afternoon: string };

export type HorairesContactData = {
	key: string;
	icon: string;
	iconVariant: IconVariant;
	category: string;
	name: string;
	description?: string;
	contacts: ContactItem[];
};

type Props = {
	schedule: ScheduleDay[];
	fermetures: string[];
	contacts: HorairesContactData[];
};

export default function HorairesLayout({ schedule, fermetures, contacts }: Props) {
	return (
		<>
			<PageHeader
				breadcrumb="Horaires & informations"
				eyebrowIcon={Clock}
				eyebrow="Votre mairie"
				title="Horaires & informations"
				subtitle="Retrouvez les horaires d'ouverture de la mairie et les contacts pratiques du secrétariat."
			/>

			<section className={`${B}__section`}>
				<div className={`${B}__inner container`}>
					<div className={`${B}__block`}>
						<p className={`${B}__block-eyebrow`}>Ouverture au public</p>
						<h2 className={`${B}__block-title`}>Horaires de la mairie</h2>
						<div className={`${B}__block-divider`} />

						<div className={`${B}__table`}>
							{schedule.map((s) => {
								const closed = s.morning === 'Fermé' && s.afternoon === 'Fermé';
								return (
									<div key={s.day} className={`${B}__row${closed ? ` ${B}__row--closed` : ''}`}>
										<span className={`${B}__row-day`}>{s.day}</span>
										<span className={`${B}__row-hours`}>
											{closed ? 'Fermé' : `${s.morning} · ${s.afternoon}`}
										</span>
									</div>
								);
							})}
						</div>

						{fermetures.length > 0 && (
							<div className={`${B}__closures`}>
								<div className={`${B}__closures-icon`}>
									<AlertCircle size={16} />
								</div>
								<div>
									<p className={`${B}__closures-title`}>Fermetures exceptionnelles</p>
									<p className={`${B}__closures-list`}>{fermetures.join(' · ')}</p>
								</div>
							</div>
						)}
					</div>

					{contacts.length > 0 && (
						<div className={`${B}__block`}>
							<p className={`${B}__block-eyebrow`}>Services</p>
							<h2 className={`${B}__block-title`}>Contacts pratiques</h2>
							<div className={`${B}__block-divider`} />

							<div className={`${B}__contacts`}>
								{contacts.map((c) => (
									<ContactCard
										key={c.key}
										icon={c.icon}
										iconVariant={c.iconVariant}
										category={c.category}
										name={c.name}
										description={c.description}
										contacts={c.contacts}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
