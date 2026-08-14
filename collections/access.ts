import type { Access, FieldAccess } from 'payload';

// Décision 13 amendée — 3 niveaux, par instance/commune (décision 20 : pas
// de super-admin transversal, chaque déploiement a ses propres comptes) :
// - super-admin : vous + associé, pleins pouvoirs (structure + comptes)
// - admin       : côté mairie (ex. secrétaire général) — gère les comptes
//                 éditeur de sa commune, ne touche jamais à la structure
//                 (décision 10) : ni pages, ni catégories, ni gabarits
// - editeur     : contenu quotidien uniquement

export const isSuperAdmin: Access = ({ req }) => req.user?.role === 'super-admin';

export const isAdminOrAbove: Access = ({ req }) =>
	req.user?.role === 'super-admin' || req.user?.role === 'admin';

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

export const isSuperAdminField: FieldAccess = ({ req }) => req.user?.role === 'super-admin';
