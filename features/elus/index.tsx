import TrombinoscopeLayout, { type TrombinoscopeMemberData } from '@shared/components/TrombinoscopeLayout';
import { getTrombinoscopeData } from '../../lib/payload';

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
		commissions: ['Finances', 'Sports, loisirs et culture (vice-présidente)', 'Affaires sociales et santé publique']
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
		commissions: ['Travaux, aménagement et urbanisme (vice-président)', 'Sports, loisirs et culture']
	}
];

export const delegues: Elu[] = [
	{
		name: 'Marie-Josée LEJEUNE',
		role: 'Conseillère déléguée',
		commissions: ['Communication', 'Affaires sociales et santé publique', "Appel d'offres"]
	},
	{
		name: 'Jean-Michel BRUN',
		role: 'Conseiller délégué',
		commissions: ['Affaires scolaires', 'Patrimoine, environnement et tourisme']
	}
];

export const conseillers: Elu[] = [
	{
		name: 'Mireille DEMAR-LAGE',
		role: 'Conseillère',
		commissions: ['Affaires scolaires', 'Affaires sociales et santé publique']
	},
	{
		name: 'Marie-Cécile LECOMTE',
		role: 'Conseillère',
		commissions: ['Affaires scolaires', 'Communication', 'Sports, loisirs et culture']
	},
	{
		name: 'Bertrand DESBORDES',
		role: 'Conseiller',
		commissions: ['Communication', 'Sports, loisirs et culture', 'Patrimoine, environnement et tourisme']
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
		commissions: ['Travaux, aménagement et urbanisme', 'Communication', 'Affaires sociales et santé publique']
	},
	{
		name: 'Nelly BAUDRY',
		role: 'Conseillère',
		commissions: ['Affaires scolaires', 'Communication (vice-présidente)', 'Sports, loisirs et culture']
	},
	{
		name: 'Claude MARBOUTY',
		role: 'Conseiller',
		commissions: ['Finances (vice-président)', 'Patrimoine, environnement et tourisme', "Appel d'offres"]
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
