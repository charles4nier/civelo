import type { ServerProps } from 'payload';
import { isTenantLocked } from '../lib/getSelectedTenantId';
import './style.scss';

// Demande du 2026-09-16 — un super-admin qui navigue dans le back-office
// verrouillé d'une commune (via le sélecteur de tenant sur `admin.civelo.fr`,
// ou directement sur le domaine d'une commune) doit toujours pouvoir revenir
// à la console super-admin en un clic, sans avoir à retaper l'URL.
// `isTenantLocked()` est déjà utilisé pour l'inverse dans
// `admin/CreateTenantButton` — vrai sur tout domaine verrouillé, jamais sur
// `SUPER_ADMIN_DOMAIN` (voir son commentaire).
export default async function SuperAdminReturnButton({ user }: ServerProps) {
	const superAdminDomain = process.env.SUPER_ADMIN_DOMAIN;
	// Mode mono-tenant (archive livrable) : pas de console super-admin à
	// laquelle revenir, `isTenantLocked()` y renvoie toujours `true` sans
	// rapport avec un vrai verrouillage de domaine.
	if (!superAdminDomain || process.env.SINGLE_TENANT_SLUG) return null;
	if (user?.role !== 'super-admin') return null;
	if (!(await isTenantLocked())) return null;

	return (
		<a href={`https://${superAdminDomain}/admin`} className="super-admin-return">
			← admin.civelo.fr
		</a>
	);
}
