import type { Access, FieldAccess } from 'payload';

// Décision 13 amendée, puis étape 9 du plan multi-tenant — 3 niveaux,
// partagés par toutes les communes sur une même appli (l'inverse de la
// décision 20 d'origine, qui supposait "chaque déploiement a ses propres
// comptes" — devenu faux depuis le passage au multi-tenant) :
// - super-admin : l'équipe vendeuse, transversal à toutes les communes
//                 (pleins pouvoirs, structure + comptes)
// - admin       : côté mairie (ex. le maire) — gère les comptes éditeur de
//                 SA (ses) commune(s) uniquement (voir `Users.ts`, scopé
//                 par tenant), ne touche jamais à la structure (décision
//                 10) : ni pages, ni catégories, ni gabarits
// - editeur     : contenu quotidien uniquement, sur sa (ses) commune(s)
//
// Ces 4 fonctions restent de simples portes par rôle — le scoping par
// tenant vient se poser par-dessus, soit automatiquement via le plugin
// multi-tenant (collections listées dans sa config), soit explicitement
// (voir `Users.ts`, qui ne peut pas être scopé par le plugin de la même
// façon puisque c'est LUI qui porte le champ `tenants`).

export const isSuperAdmin: Access = ({ req }) => req.user?.role === 'super-admin';

export const isAdminOrAbove: Access = ({ req }) =>
	req.user?.role === 'super-admin' || req.user?.role === 'admin';

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

export const isSuperAdminField: FieldAccess = ({ req }) => req.user?.role === 'super-admin';
