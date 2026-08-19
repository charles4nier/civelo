'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useAuth, useConfig } from '@payloadcms/ui';
import {
	FileText,
	Plus,
	Tags,
	Shapes,
	FileStack,
	Users,
	MapPinned,
	Waypoints,
	ChevronDown,
	LogOut,
	Fingerprint,
	PanelTop,
	PanelBottom,
	Images
} from 'lucide-react';
import './style.scss';
import './global-overrides.scss';

// Décision 46 — retour d'expérience direct : plutôt que deviner quelles
// pages méritent un raccourci (tentative décision 44 avec Actualités/Agenda
// en dur), la sidebar liste maintenant TOUTES les pages existantes sous
// "Mon site", plus un lien "Nouvelle page" — un clic vers n'importe quelle
// page, sans avoir à deviner où elle se trouve.

type NavPage = { id: string; title: string };

type NavLinkItem = {
	kind: 'link';
	label: string;
	href: string;
	icon: React.ElementType;
};

// Décision 67 — "Mes pages" / "En-tête & pied de page" / "Lieux & sentiers"
// deviennent des sous-groupes repliables à part entière (fermés par défaut,
// comme "Mon site"/"Paramètres" mais un cran en dessous), plutôt qu'un
// simple séparateur visuel suivi d'items toujours affichés.
type NavSubgroupItem = {
	kind: 'subgroup';
	label: string;
	items: NavLinkItem[];
};

type NavEntry = NavLinkItem | NavSubgroupItem;

type NavSection = {
	label: string;
	items: NavEntry[];
};

function useAdminBase() {
	const { config } = useConfig();
	return config.routes?.admin ?? '/admin';
}

function NavLink({
	item,
	base,
	pathname
}: {
	item: NavLinkItem;
	base: string;
	pathname: string;
}) {
	const href = `${base}${item.href}`;
	const active = pathname === href || pathname.startsWith(`${href}/`);
	const Icon = item.icon;

	return (
		<Link href={href} className={`admin-nav__link${active ? ' admin-nav__link--active' : ''}`}>
			<Icon size={17} strokeWidth={1.75} aria-hidden="true" />
			<span>{item.label}</span>
		</Link>
	);
}

function NavSubgroup({ item, base, pathname }: { item: NavSubgroupItem; base: string; pathname: string }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="admin-nav__subgroup">
			<button
				type="button"
				className="admin-nav__subgroup-header"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
			>
				<span>{item.label}</span>
				<ChevronDown
					size={12}
					className={`admin-nav__subgroup-chevron${open ? ' admin-nav__subgroup-chevron--open' : ''}`}
					aria-hidden="true"
				/>
			</button>
			{open && (
				<div className="admin-nav__subgroup-items">
					{item.items.map((entry) => (
						<NavLink key={entry.href} item={entry} base={base} pathname={pathname} />
					))}
				</div>
			)}
		</div>
	);
}

function NavGroup({ section, base, pathname }: { section: NavSection; base: string; pathname: string }) {
	const [open, setOpen] = useState(true);

	return (
		<div className="admin-nav__group">
			<button
				type="button"
				className="admin-nav__group-header"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
			>
				<span>{section.label}</span>
				<ChevronDown
					size={13}
					className={`admin-nav__group-chevron${open ? ' admin-nav__group-chevron--open' : ''}`}
					aria-hidden="true"
				/>
			</button>
			{open && (
				<div className="admin-nav__group-items">
					{section.items.map((entry, i) =>
						entry.kind === 'subgroup' ? (
							<NavSubgroup key={`${entry.label}-${i}`} item={entry} base={base} pathname={pathname} />
						) : (
							<NavLink key={entry.href} item={entry} base={base} pathname={pathname} />
						)
					)}
				</div>
			)}
		</div>
	);
}

type Props = { pages: NavPage[] };

export default function AdminNavClient({ pages }: Props) {
	const pathname = usePathname();
	const base = useAdminBase();
	const { user, logOut } = useAuth();

	const monSite: NavSection = {
		label: 'Mon site',
		items: [
			// Décision 60 — "Mes pages" en sous-catégorie explicite. Décision 67 —
			// devient un sous-groupe repliable (fermé par défaut), comme les 2
			// autres ci-dessous, plutôt qu'un simple séparateur toujours ouvert.
			{
				kind: 'subgroup',
				label: 'Mes pages',
				items: [
					{ kind: 'link', label: 'Nouvelle page', href: '/collections/pages/create', icon: Plus },
					...pages.map(
						(p): NavLinkItem => ({
							kind: 'link',
							label: p.title,
							href: `/collections/pages/${p.id}`,
							icon: FileText
						})
					)
				]
			},
			// Décision 61 — en-tête et pied de page du site, jusqu'ici en dur.
			// Restent sous "Mon site" (pas "Paramètres") : ce sont des choses que
			// le client édite (logo, bouton, coordonnées), pas des réglages
			// structurels comme Catégories/Icônes.
			{
				kind: 'subgroup',
				label: 'En-tête & pied de page',
				items: [
					{ kind: 'link', label: 'Identité du site', href: '/globals/identite', icon: Fingerprint },
					{ kind: 'link', label: "Bouton d'en-tête", href: '/globals/bouton-entete', icon: PanelTop },
					{ kind: 'link', label: 'Pied de page', href: '/globals/footer', icon: PanelBottom }
				]
			},
			// Sous-groupe plutôt qu'une section à part (ancienne "Carte
			// interactive", renommée puis regroupée ici) — POI/Sentiers restent
			// des collections séparées (relation depuis "Découvrir" sur
			// l'Accueil, décision 14/23), mais rattachées visuellement à la page
			// "Carte interactive" juste au-dessus plutôt qu'isolées en bas.
			{
				kind: 'subgroup',
				label: 'Lieux & sentiers',
				items: [
					{ kind: 'link', label: 'Lieux (POI)', href: '/collections/pois', icon: MapPinned },
					{ kind: 'link', label: 'Sentiers', href: '/collections/sentiers', icon: Waypoints }
				]
			}
		]
	};

	const parametres: NavSection = {
		label: 'Paramètres',
		items: [
			{ kind: 'link', label: 'Catégories', href: '/collections/categories', icon: Tags },
			{ kind: 'link', label: 'Icônes', href: '/collections/icones', icon: Shapes },
			{ kind: 'link', label: 'Médias', href: '/collections/media', icon: Images },
			{ kind: 'link', label: 'Documents', href: '/collections/documents', icon: FileStack },
			{ kind: 'link', label: 'Utilisateurs', href: '/collections/users', icon: Users }
		]
	};

	return (
		<nav className="admin-nav">
			<div className="admin-nav__brand">
				<span className="admin-nav__brand-mark">SH</span>
				<span className="admin-nav__brand-name">Saint-Hilaire</span>
			</div>

			<div className="admin-nav__body">
				<NavGroup section={monSite} base={base} pathname={pathname} />
				<NavGroup section={parametres} base={base} pathname={pathname} />
			</div>

			{user && (
				<div className="admin-nav__footer">
					<div className="admin-nav__user">
						<span className="admin-nav__user-avatar">
							{(user.email as string)?.charAt(0).toUpperCase()}
						</span>
						<span className="admin-nav__user-email">{user.email as string}</span>
					</div>
					<button type="button" className="admin-nav__logout" onClick={() => logOut()}>
						<LogOut size={15} aria-hidden="true" />
					</button>
				</div>
			)}
		</nav>
	);
}
