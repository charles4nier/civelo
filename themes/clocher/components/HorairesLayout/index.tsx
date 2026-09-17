import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import ContactCard, { type ContactItem, type IconVariant } from '@themes/clocher/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'horaires';

export type DayScheduleData = { day: string; morning: string; afternoon: string };

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
	schedule: DayScheduleData[];
	fermetures: string[];
	contacts: HorairesContactData[];
};

export default function HorairesLayout({ schedule, fermetures, contacts }: Props) {
	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`} />
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`} />
				<div className={`${CLASS_NAME}__hero-content`}>
					<nav className={`${CLASS_NAME}__breadcrumb`} aria-label="Fil d'Ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<Link href="/mairie/horaires">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Horaires &amp; informations</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Clock size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Horaires &amp; informations</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Les horaires d'ouverture de la mairie et les numéros à connaître
						<br />
						pour vos démarches du quotidien.
					</p>
				</div>
			</section>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					{/* Horaires d'ouverture */}
					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>Accueil du public</p>
						<h2 className={`${CLASS_NAME}__block-title`}>Horaires d'ouverture de la mairie</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__table-wrap`}>
							<table className={`${CLASS_NAME}__table`}>
								<caption className={`${CLASS_NAME}__table-caption`}>
									Horaires d'ouverture au public, par jour de la semaine
								</caption>
								<thead>
									<tr>
										<th scope="col">Jour</th>
										<th scope="col">Matin</th>
										<th scope="col">Après-midi</th>
									</tr>
								</thead>
								<tbody>
									{schedule.map((s) => (
										<tr
											key={s.day}
											className={
												s.morning === 'Fermé' ? `${CLASS_NAME}__table-row--closed` : undefined
											}
										>
											<th scope="row">{s.day}</th>
											<td>{s.morning}</td>
											<td>{s.afternoon}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{fermetures.length > 0 && (
							<div className={`${CLASS_NAME}__closures`}>
								<p className={`${CLASS_NAME}__closures-title`}>
									Fermetures exceptionnelles {new Date().getFullYear()}
								</p>
								<ul className={`${CLASS_NAME}__closures-list`}>
									{fermetures.map((f) => (
										<li key={f}>{f}</li>
									))}
								</ul>
							</div>
						)}
					</div>

					{/* Contacts pratiques */}
					{contacts.length > 0 && (
						<div className={`${CLASS_NAME}__block`}>
							<p className={`${CLASS_NAME}__block-eyebrow`}>Services & urgences</p>
							<h2 className={`${CLASS_NAME}__block-title`}>Contacts pratiques</h2>
							<div className={`${CLASS_NAME}__block-divider`} />

							<div className={`${CLASS_NAME}__contacts`}>
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
