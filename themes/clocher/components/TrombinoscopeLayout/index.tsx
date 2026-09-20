import Link from 'next/link';
import { ChevronRight, Users, Calendar } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'elus';

export type TrombinoscopeMemberData = {
	key: string;
	nom: string;
	fonction: string;
	role: 'maire' | 'adjoint' | 'delegue' | 'conseiller';
	commissions?: string[];
	note?: string;
};

type Props = {
	members: TrombinoscopeMemberData[];
	meetingInfo?: string;
};

function initials(name: string) {
	return name
		.split(/\s|-/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0])
		.join('')
		.toUpperCase();
}

function MemberCard({ member }: { member: TrombinoscopeMemberData }) {
	return (
		<article className={`${CLASS_NAME}__member`}>
			<div className={`${CLASS_NAME}__member-avatar`}>{initials(member.nom)}</div>
			<div className={`${CLASS_NAME}__member-body`}>
				<h3 className={`${CLASS_NAME}__member-name`}>{member.nom}</h3>
				<p className={`${CLASS_NAME}__member-role`}>{member.fonction}</p>
				{member.note && <p className={`${CLASS_NAME}__member-note`}>{member.note}</p>}
				{member.commissions && member.commissions.length > 0 && (
					<div className={`${CLASS_NAME}__member-commissions`}>
						<p className={`${CLASS_NAME}__member-commissions-label`}>En charge des commissions</p>
						<ul className={`${CLASS_NAME}__member-commissions-list`}>
							{member.commissions.map((c) => (
								<li key={c} className={`${CLASS_NAME}__member-commission`}>
									<span className={`${CLASS_NAME}__member-commission-dot`} />
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

const GROUPS: { role: TrombinoscopeMemberData['role']; label: string }[] = [
	{ role: 'adjoint', label: 'Les adjoints' },
	{ role: 'delegue', label: 'Les conseillers délégués' },
	{ role: 'conseiller', label: 'Les conseillers municipaux' }
];

export default function TrombinoscopeLayout({ members, meetingInfo }: Props) {
	const maire = members.find((m) => m.role === 'maire');

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
						<Link href="/mairie">Votre mairie</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Le maire &amp; les élus</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Users size={14} aria-hidden="true" />
						Votre mairie
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Le maire &amp; les élus</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Le conseil municipal de Saint-Martin réunit le Maire, ses adjoints,
						<br />
						deux conseillers délégués et huit conseillers municipaux.
					</p>
				</div>
			</section>

			{/* Membres */}
			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__section-header`}>
						<p className={`${CLASS_NAME}__section-eyebrow`}>Composition</p>
						<h2 className={`${CLASS_NAME}__section-title`}>Les membres du conseil</h2>
						<div className={`${CLASS_NAME}__section-divider`} />
					</div>

					{/* Maire */}
					{maire && (
						<div className={`${CLASS_NAME}__maire`}>
							<div className={`${CLASS_NAME}__maire-avatar`}>{initials(maire.nom)}</div>
							<div className={`${CLASS_NAME}__maire-body`}>
								<p className={`${CLASS_NAME}__maire-role`}>{maire.fonction}</p>
								<h3 className={`${CLASS_NAME}__maire-name`}>M. {maire.nom}</h3>
								{maire.note && <p className={`${CLASS_NAME}__maire-note`}>{maire.note}</p>}
							</div>
						</div>
					)}

					{GROUPS.map((group) => {
						const groupMembers = members.filter((m) => m.role === group.role);
						if (groupMembers.length === 0) return null;
						return (
							<div key={group.role}>
								<GroupHeader label={group.label} />
								<div className={`${CLASS_NAME}__grid`}>
									{groupMembers.map((m) => (
										<MemberCard key={m.key} member={m} />
									))}
								</div>
							</div>
						);
					})}
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
							<p className={`${CLASS_NAME}__meeting-eyebrow`}>Prochaine réunion</p>
							<h3 className={`${CLASS_NAME}__meeting-title`}>
								{meetingInfo ?? 'Conseil municipal — vendredi 21 février, 19 h'}
							</h3>
							<p className={`${CLASS_NAME}__meeting-desc`}>
								Les séances du conseil municipal sont publiques et ouvertes à tous les
								habitants.
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
