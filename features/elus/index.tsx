import Link from 'next/link';
import { ChevronRight, Users, Calendar } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'elus';

export type Elu = {
	name: string;
	role: string;
	commissions?: string[];
	note?: string;
};

export const maire: Elu = {
	name: 'Christian LATOUILLE',
	role: 'Maire',
	note: 'Président de toutes les commissions'
};

export const adjoints: Elu[] = [
	{
		name: 'Alain MARTHON',
		role: '1er Adjoint',
		commissions: [
			'Finances',
			'Sports, loisirs et culture',
			'Affaires sociales et santé publique (vice-président)',
			"Appel d'offres"
		]
	},
	{
		name: 'Jacqueline CLOT',
		role: '2ème Adjointe',
		commissions: [
			'Finances',
			'Sports, loisirs et culture (vice-présidente)',
			'Affaires sociales et santé publique'
		]
	},
	{
		name: 'Philippe VEYRIRAS',
		role: '3ème Adjoint',
		commissions: [
			'Finances',
			'Travaux, aménagement et urbanisme',
			'Affaires sociales (vice-président)',
			"Appel d'offres"
		]
	},
	{
		name: 'Fabrice ARNAUD',
		role: '4ème Adjoint',
		commissions: [
			'Travaux, aménagement et urbanisme (vice-président)',
			'Sports, loisirs et culture'
		]
	}
];

export const delegues: Elu[] = [
	{
		name: 'Marie-Josée LEJEUNE',
		role: 'Conseillère déléguée',
		commissions: [
			'Communication',
			'Affaires sociales et santé publique',
			"Appel d'offres"
		]
	},
	{
		name: 'Jean-Michel BRUN',
		role: 'Conseiller délégué',
		commissions: [
			'Affaires scolaires',
			'Patrimoine, environnement et tourisme'
		]
	}
];

export const conseillers: Elu[] = [
	{
		name: 'Mireille DEMAR-LAGE',
		role: 'Conseillère',
		commissions: [
			'Affaires scolaires',
			'Affaires sociales et santé publique'
		]
	},
	{
		name: 'Marie-Cécile LECOMTE',
		role: 'Conseillère',
		commissions: [
			'Affaires scolaires',
			'Communication',
			'Sports, loisirs et culture'
		]
	},
	{
		name: 'Bertrand DESBORDES',
		role: 'Conseiller',
		commissions: [
			'Communication',
			'Sports, loisirs et culture',
			'Patrimoine, environnement et tourisme'
		]
	},
	{
		name: 'Pascale DUPUY',
		role: 'Conseillère',
		commissions: [
			'Travaux, aménagement et urbanisme',
			'Communication',
			'Patrimoine, environnement et tourisme',
			"Appel d'offres"
		]
	},
	{
		name: 'Sabrina TIGOULET',
		role: 'Conseillère',
		commissions: [
			'Travaux, aménagement et urbanisme',
			'Communication',
			'Affaires sociales et santé publique'
		]
	},
	{
		name: 'Nelly BAUDRY',
		role: 'Conseillère',
		commissions: [
			'Affaires scolaires',
			'Communication (vice-présidente)',
			'Sports, loisirs et culture'
		]
	},
	{
		name: 'Claude MARBOUTY',
		role: 'Conseiller',
		commissions: [
			'Finances (vice-président)',
			'Patrimoine, environnement et tourisme',
			"Appel d'offres"
		]
	},
	{
		name: 'Dominique BATAILLER',
		role: 'Conseiller',
		commissions: [
			'Travaux, aménagement et urbanisme',
			'Patrimoine, environnement et tourisme (vice-président)',
			"Appel d'offres"
		]
	}
];

function initials(name: string) {
	return name
		.split(/\s|-/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0])
		.join('')
		.toUpperCase();
}

function MemberCard({ elu }: { elu: Elu }) {
	return (
		<article className={`${CLASS_NAME}__member`}>
			<div className={`${CLASS_NAME}__member-avatar`}>
				{initials(elu.name)}
			</div>
			<div className={`${CLASS_NAME}__member-body`}>
				<h3 className={`${CLASS_NAME}__member-name`}>{elu.name}</h3>
				<p className={`${CLASS_NAME}__member-role`}>{elu.role}</p>
				{elu.note && (
					<p className={`${CLASS_NAME}__member-note`}>{elu.note}</p>
				)}
				{elu.commissions && elu.commissions.length > 0 && (
					<div className={`${CLASS_NAME}__member-commissions`}>
						<p
							className={`${CLASS_NAME}__member-commissions-label`}
						>
							En charge des commissions
						</p>
						<ul
							className={`${CLASS_NAME}__member-commissions-list`}
						>
							{elu.commissions.map((c) => (
								<li
									key={c}
									className={`${CLASS_NAME}__member-commission`}
								>
									<span
										className={`${CLASS_NAME}__member-commission-dot`}
									/>
									{c}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</article>
	);
}

function GroupHeader({ label }: { label: string }) {
	return (
		<div className={`${CLASS_NAME}__group-header`}>
			<h3 className={`${CLASS_NAME}__group-title`}>{label}</h3>
			<div className={`${CLASS_NAME}__group-line`} />
		</div>
	);
}

export default function ElusPage() {
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
						<Link href="/mairie">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Le maire &amp; les élus</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Users size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>
						Le maire &amp; les élus
					</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Le conseil municipal de Saint-Hilaire-Bonneval réunit le
						Maire, ses adjoints,
						<br />
						deux conseillers délégués et huit conseillers
						municipaux.
					</p>
				</div>
			</section>

			{/* Membres */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__section-header`}>
						<p className={`${CLASS_NAME}__section-eyebrow`}>
							Composition
						</p>
						<h2 className={`${CLASS_NAME}__section-title`}>
							Les membres du conseil
						</h2>
						<div className={`${CLASS_NAME}__section-divider`} />
					</div>

					{/* Maire */}
					<div className={`${CLASS_NAME}__maire`}>
						<div className={`${CLASS_NAME}__maire-avatar`}>
							{initials(maire.name)}
						</div>
						<div className={`${CLASS_NAME}__maire-body`}>
							<p className={`${CLASS_NAME}__maire-role`}>
								{maire.role}
							</p>
							<h3 className={`${CLASS_NAME}__maire-name`}>
								M. {maire.name}
							</h3>
							<p className={`${CLASS_NAME}__maire-note`}>
								{maire.note}
							</p>
						</div>
					</div>

					{/* Adjoints */}
					<GroupHeader label="Les adjoints" />
					<div className={`${CLASS_NAME}__grid`}>
						{adjoints.map((e) => (
							<MemberCard key={e.name} elu={e} />
						))}
					</div>

					{/* Délégués */}
					<GroupHeader label="Les conseillers délégués" />
					<div className={`${CLASS_NAME}__grid`}>
						{delegues.map((e) => (
							<MemberCard key={e.name} elu={e} />
						))}
					</div>

					{/* Conseillers */}
					<GroupHeader label="Les conseillers municipaux" />
					<div className={`${CLASS_NAME}__grid`}>
						{conseillers.map((e) => (
							<MemberCard key={e.name} elu={e} />
						))}
					</div>
				</div>
			</section>

			{/* Prochaine réunion */}
			<section className={`${CLASS_NAME}__meeting`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__meeting-card`}>
						<div className={`${CLASS_NAME}__meeting-icon`}>
							<Calendar size={20} aria-hidden="true" />
						</div>
						<div>
							<p className={`${CLASS_NAME}__meeting-eyebrow`}>
								Prochaine réunion
							</p>
							<h3 className={`${CLASS_NAME}__meeting-title`}>
								Conseil municipal — vendredi 21 février, 19 h
							</h3>
							<p className={`${CLASS_NAME}__meeting-desc`}>
								Les séances du conseil municipal sont publiques
								et ouvertes à tous les habitants.
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
