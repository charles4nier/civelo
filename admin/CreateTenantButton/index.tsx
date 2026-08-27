import CreateTenantButtonClient from './Client';
import { isTenantLocked } from '../lib/getSelectedTenantId';

// Server Component wrapper — seule façon de lire le cookie de verrouillage
// de domaine (`isTenantLocked`, posé par `middleware.ts`) avant de décider
// si ce bouton doit s'afficher. Voir Client.tsx pour le pourquoi.
export default async function CreateTenantButton() {
	const isSuperAdminConsole = !(await isTenantLocked());

	return <CreateTenantButtonClient isSuperAdminConsole={isSuperAdminConsole} />;
}
