import Link from 'next/link';
import { ChevronRight, Phone } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'numeros';

export const urgences = [
	{ number: '15', label: 'SAMU', desc: 'Urgences médicales', color: 'red' },
	{
		number: '17',
		label: 'Police / Gendarmerie',
		desc: 'Urgences sécurité',
		color: 'blue'
	},
	{
		number: '18',
		label: 'Pompiers',
		desc: 'Incendie & secours',
		color: 'red'
	},
	{
		number: '112',
		label: 'Numéro européen',
		desc: 'Toutes urgences depuis un mobile',
		color: 'blue'
	},
	{
		number: '114',
		label: 'Urgences sourds & malentendants',
		desc: 'SMS, fax ou visiophonie',
		color: 'muted'
	},
	{
		number: '115',
		label: 'SAMU Social',
		desc: 'Personnes sans abri',
		color: 'muted'
	},
	{
		number: '119',
		label: "Protection de l'enfance",
		desc: 'Enfants en danger',
		color: 'muted'
	},
	{
		number: '3114',
		label: 'Prévention suicide',
		desc: 'Numéro national, 24h/24',
		color: 'muted'
	},
	{
		number: '3919',
		label: 'Violences conjugales',
		desc: 'Femmes victimes de violences, 24h/24',
		color: 'muted'
	}
];

export const locaux = [
	{
		label: 'Mairie de Saint-Hilaire-Bonneval',
		number: '05 55 00 60 15',
		detail: 'Lundi – vendredi : 9h – 12h / 14h – 17h',
		href: 'tel:+33555006015'
	},
	{
		label: 'Gendarmerie de Saint-Hilaire-Bonneval',
		number: '05 55 00 60 17',
		detail: null,
		href: 'tel:+33555006017'
	},
	{
		label: 'Centre hospitalier universitaire de Limoges',
		number: '05 55 05 55 55',
		detail: null,
		href: 'tel:+33555055555'
	}
];

export default function NumerosUtilesPage() {
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
						<span>Numéros utiles</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Phone size={14} aria-hidden="true" />
						Services & urgences
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Numéros utiles</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Numéros d'urgence nationaux et services locaux
						<br />à portée de main en toutes circonstances.
					</p>
				</div>
			</section>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					{/* Urgences */}
					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>
							Numéros d'urgence
						</p>
						<h2 className={`${CLASS_NAME}__block-title`}>
							En cas d'urgence, appelez le bon numéro
						</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__urgences`}>
							{urgences.map((u) => (
								<a
									key={u.number}
									href={`tel:${u.number}`}
									className={`${CLASS_NAME}__urgence ${CLASS_NAME}__urgence--${u.color}`}
								>
									<span
										className={`${CLASS_NAME}__urgence-number`}
									>
										{u.number}
									</span>
									<div
										className={`${CLASS_NAME}__urgence-info`}
									>
										<span
											className={`${CLASS_NAME}__urgence-label`}
										>
											{u.label}
										</span>
										<span
											className={`${CLASS_NAME}__urgence-desc`}
										>
											{u.desc}
										</span>
									</div>
									<Phone
										size={16}
										className={`${CLASS_NAME}__urgence-icon`}
										aria-hidden="true"
									/>
								</a>
							))}
						</div>
					</div>

					{/* Numéros locaux */}
					<div className={`${CLASS_NAME}__block`}>
						<p className={`${CLASS_NAME}__block-eyebrow`}>
							Services locaux
						</p>
						<h2 className={`${CLASS_NAME}__block-title`}>
							Contacts de la commune
						</h2>
						<div className={`${CLASS_NAME}__block-divider`} />

						<div className={`${CLASS_NAME}__locaux`}>
							{locaux.map((l) => (
								<div
									key={l.label}
									className={`${CLASS_NAME}__local`}
								>
									<div
										className={`${CLASS_NAME}__local-icon`}
									>
										<Phone
											size={18}
											strokeWidth={1.5}
											aria-hidden="true"
										/>
									</div>
									<div
										className={`${CLASS_NAME}__local-info`}
									>
										<p
											className={`${CLASS_NAME}__local-label`}
										>
											{l.label}
										</p>
										{l.detail && (
											<p
												className={`${CLASS_NAME}__local-detail`}
											>
												{l.detail}
											</p>
										)}
									</div>
									<a
										href={l.href}
										className={`${CLASS_NAME}__local-number`}
									>
										{l.number}
									</a>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
