import { Users, Calendar } from 'lucide-react';
import PageHeader from '@themes/preau/components/PageHeader';
import { getTrombinoscopeData } from '@lib/payload';
import './style.scss';

const CLASS_NAME = 'elus';

type Elu = { name: string; role: string; commissions?: string[]; note?: string };

const fallbackMaire: Elu = { name: 'Prénom NOM', role: 'Maire', note: 'Président de toutes les commissions' };

const fallbackAdjoints: Elu[] = [
	{ name: 'Prénom NOM', role: '1er Adjoint', commissions: ['Finances', 'Sports, loisirs et culture'] },
	{ name: 'Prénom NOM', role: '2ème Adjointe', commissions: ['Finances', 'Affaires sociales et santé publique'] },
];

const fallbackDelegues: Elu[] = [
	{ name: 'Prénom NOM', role: 'Conseiller·e délégué·e', commissions: ['Communication', "Appel d'offres"] },
];

const fallbackConseillers: Elu[] = [
	{ name: 'Prénom NOM', role: 'Conseiller·e', commissions: ['Affaires scolaires', 'Affaires sociales et santé publique'] },
	{ name: 'Prénom NOM', role: 'Conseiller·e', commissions: ['Communication', 'Sports, loisirs et culture'] },
];

function initials(name: string) {
	return name.split(/\s|-/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function MemberCard({ elu }: { elu: Elu }) {
	return (
		<article className={`${CLASS_NAME}__member`}>
			<div className={`${CLASS_NAME}__member-avatar`}>{initials(elu.name)}</div>
			<div className={`${CLASS_NAME}__member-body`}>
				<h3 className={`${CLASS_NAME}__member-name`}>{elu.name}</h3>
				<p className={`${CLASS_NAME}__member-role`}>{elu.role}</p>
				{elu.note && <p className={`${CLASS_NAME}__member-note`}>{elu.note}</p>}
				{elu.commissions && elu.commissions.length > 0 && (
					<div className={`${CLASS_NAME}__member-commissions`}>
						<p className={`${CLASS_NAME}__member-commissions-label`}>En charge des commissions</p>
						<ul className={`${CLASS_NAME}__member-commissions-list`}>
							{elu.commissions.map((c) => (
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

export default async function ElusPage() {
	const data = await getTrombinoscopeData('mairie/maire-elus');

	let maire: Elu = fallbackMaire;
	let adjoints: Elu[] = fallbackAdjoints;
	let delegues: Elu[] = fallbackDelegues;
	let conseillers: Elu[] = fallbackConseillers;
	let meetingInfo: string | undefined;

	if (data?.members.length) {
		const toElu = (m: (typeof data.members)[number]): Elu => ({
			name: m.nom,
			role: m.fonction,
			commissions: m.commissions,
			note: m.note
		});
		const byRole = data.members.reduce<Record<string, typeof data.members>>((acc, m) => {
			(acc[m.role] ??= []).push(m);
			return acc;
		}, {});
		maire = byRole.maire?.[0] ? toElu(byRole.maire[0]) : fallbackMaire;
		adjoints = (byRole.adjoint ?? []).map(toElu);
		delegues = (byRole.delegue ?? []).map(toElu);
		conseillers = (byRole.conseiller ?? []).map(toElu);
		meetingInfo = data.meetingInfo;
	}

	return (
		<>
			<PageHeader
				breadcrumb="Le maire & les élus"
				eyebrowIcon={Users}
				eyebrow="Votre mairie"
				title="Le maire &amp; les élus"
				subtitle="Le conseil municipal réunit le Maire, ses adjoints, des conseillers délégués et les conseillers municipaux."
			/>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>

					<div className={`${CLASS_NAME}__section-header`}>
						<p className={`${CLASS_NAME}__section-eyebrow`}>Composition</p>
						<h2 className={`${CLASS_NAME}__section-title`}>Les membres du conseil</h2>
						<div className={`${CLASS_NAME}__section-divider`} />
					</div>

					<div className={`${CLASS_NAME}__maire`}>
						<div className={`${CLASS_NAME}__maire-avatar`}>{initials(maire.name)}</div>
						<div className={`${CLASS_NAME}__maire-body`}>
							<p className={`${CLASS_NAME}__maire-role`}>Maire</p>
							<h3 className={`${CLASS_NAME}__maire-name`}>M. {maire.name}</h3>
							{maire.note && <p className={`${CLASS_NAME}__maire-note`}>{maire.note}</p>}
						</div>
					</div>

					{adjoints.length > 0 && (
						<>
							<GroupHeader label="Les adjoints" />
							<div className={`${CLASS_NAME}__grid`}>{adjoints.map((e) => <MemberCard key={e.name + e.role} elu={e} />)}</div>
						</>
					)}

					{delegues.length > 0 && (
						<>
							<GroupHeader label="Les conseillers délégués" />
							<div className={`${CLASS_NAME}__grid`}>{delegues.map((e) => <MemberCard key={e.name + e.role} elu={e} />)}</div>
						</>
					)}

					{conseillers.length > 0 && (
						<>
							<GroupHeader label="Les conseillers municipaux" />
							<div className={`${CLASS_NAME}__grid`}>{conseillers.map((e) => <MemberCard key={e.name + e.role} elu={e} />)}</div>
						</>
					)}
				</div>
			</section>

			<section className={`${CLASS_NAME}__meeting`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<div className={`${CLASS_NAME}__meeting-card`}>
						<div className={`${CLASS_NAME}__meeting-icon`}><Calendar size={20} /></div>
						<div>
							<p className={`${CLASS_NAME}__meeting-eyebrow`}>Prochaine réunion</p>
							<h3 className={`${CLASS_NAME}__meeting-title`}>Conseil municipal — date à définir</h3>
							<p className={`${CLASS_NAME}__meeting-desc`}>
								{meetingInfo || 'Les séances du conseil municipal sont publiques et ouvertes à tous les habitants.'}
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
