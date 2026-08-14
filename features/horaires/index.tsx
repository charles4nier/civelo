import Link from 'next/link';
import {
	ChevronRight,
	Clock,
	Phone,
	Building2,
	ShieldAlert,
	Flame
} from 'lucide-react';
import ContactCard from '@shared/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'horaires';

const schedule = [
	{ day: 'Lundi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Mardi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Mercredi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Jeudi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Vendredi', morning: '9h – 12h', afternoon: '14h – 17h' },
	{ day: 'Samedi', morning: 'Fermé', afternoon: 'Fermé' },
	{ day: 'Dimanche', morning: 'Fermé', afternoon: 'Fermé' }
];

const fermetures = [
	'24 décembre (après-midi)',
	'1er janvier',
	'Lundi de Pâques',
	'1er mai'
];

export default function HorairesPage() {
	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`}
				/>
				<div
					className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`}
				/>
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
					<h1 className={`${CLASS_NAME}__title`}>
						Horaires &amp; informations
					</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Les horaires d'ouverture de la mairie et les numéros à
						connaître
						<br />
						pour vos démarches du quotidien.
					</p>
				</div>
			</section>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					{/* Horaires d'ouverture */}
					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>
							Accueil du public
						</p>
						<h2 className={`${CLASS_NAME}__block-title`}>
							Horaires d'ouverture de la mairie
						</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__table-wrap`}>
							<table className={`${CLASS_NAME}__table`}>
								<caption
									className={`${CLASS_NAME}__table-caption`}
								>
									Horaires d'ouverture au public, par jour de
									la semaine
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
												s.morning === 'Fermé'
													? `${CLASS_NAME}__table-row--closed`
													: undefined
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

						<div className={`${CLASS_NAME}__closures`}>
							<p className={`${CLASS_NAME}__closures-title`}>
								Fermetures exceptionnelles{' '}
								{new Date().getFullYear()}
							</p>
							<ul className={`${CLASS_NAME}__closures-list`}>
								{fermetures.map((f) => (
									<li key={f}>{f}</li>
								))}
							</ul>
						</div>
					</div>

					{/* Contacts pratiques */}
					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>
							Services & urgences
						</p>
						<h2 className={`${CLASS_NAME}__block-title`}>
							Contacts pratiques
						</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__contacts`}>
							<ContactCard
								icon="Phone"
								iconVariant="primary"
								category="Secrétariat"
								name="Accueil mairie"
								description="Renseignements généraux, état civil, démarches administratives."
								contacts={[
									{ type: 'phone', value: '05 55 00 60 15' },
									{
										type: 'email',
										value: 'mairie@saint-hilaire-bonneval.fr'
									}
								]}
							/>
							<ContactCard
								icon="Building2"
								iconVariant="leaf"
								category="Sur rendez-vous"
								name="Service urbanisme"
								description="Permis de construire, déclarations préalables, PLU. Le mardi matin uniquement."
								contacts={[
									{ type: 'phone', value: '05 55 00 60 20' }
								]}
							/>
							<ContactCard
								icon="ShieldAlert"
								iconVariant="muted"
								category="Sécurité"
								name="Police municipale / Gendarmerie"
								description="Gendarmerie de Saint-Hilaire-Bonneval."
								contacts={[
									{ type: 'phone', value: '05 55 00 60 17' }
								]}
							/>
							<ContactCard
								icon="Flame"
								iconVariant="coral"
								category="Urgence"
								name="Pompiers"
								description="Incendie et secours, numéro national disponible 24h/24."
								contacts={[{ type: 'phone', value: '18' }]}
							/>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
