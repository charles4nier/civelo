import TrombinoscopeLayout, { type TrombinoscopeMemberData } from '@themes/style-edito/components/TrombinoscopeLayout';
import { getTrombinoscopeData } from '@lib/payload';
import { maire, adjoints, delegues, conseillers } from './data';

const fallbackMembers: TrombinoscopeMemberData[] = [
	{ key: 'maire', nom: maire.name, fonction: maire.role, role: 'maire', note: maire.note },
	...adjoints.map((e, i) => ({
		key: `adjoint-${i}`,
		nom: e.name,
		fonction: e.role,
		role: 'adjoint' as const,
		commissions: e.commissions
	})),
	...delegues.map((e, i) => ({
		key: `delegue-${i}`,
		nom: e.name,
		fonction: e.role,
		role: 'delegue' as const,
		commissions: e.commissions
	})),
	...conseillers.map((e, i) => ({
		key: `conseiller-${i}`,
		nom: e.name,
		fonction: e.role,
		role: 'conseiller' as const,
		commissions: e.commissions
	}))
];

export default async function ElusPage() {
	const data = await getTrombinoscopeData('mairie/maire-elus');

	return (
		<TrombinoscopeLayout
			members={data?.members ?? fallbackMembers}
			meetingInfo={data?.meetingInfo}
		/>
	);
}
