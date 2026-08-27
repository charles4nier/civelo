'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link, useAuth, useConfig } from '@payloadcms/ui';
import {
	FileText,
	Plus,
	Tags,
	Shapes,
	FileStack,
	Users,
	Building2,
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
				<span className="admin-nav__subgroup-label">{item.label}</span>
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
				<span className="admin-nav__group-label">{section.label}</span>
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

type Props = { pages: NavPage[]; siteName: string };

// Décision — sigle affiché dans le badge de marque (ex. "Saint-Hilaire-
// Bonneval" → "SB") : 2 premières initiales des mots du nom, ou les 2
// premières lettres s'il n'y a qu'un seul mot.
function brandMark(name: string): string {
	const words = name.split(/[\s-]+/).filter(Boolean);
	if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
	return name.slice(0, 2).toUpperCase();
}

export default function AdminNavClient({ pages, siteName }: Props) {
	const pathname = usePathname();
	const base = useAdminBase();
	const { user, logOut } = useAuth();
	// `useAuth` peuple `photo` (relation `media`) par défaut (profondeur REST
	// par défaut) — objet {url} si renseignée, sinon absente/non peuplée.
	const photo = (user as { photo?: { url?: string } | string } | undefined)?.photo;
	const photoUrl = typeof photo === 'object' ? photo?.url : undefined;

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
					{ kind: 'link', label: 'Identité du site', href: '/collections/identite', icon: Fingerprint },
					{ kind: 'link', label: "Bouton d'en-tête", href: '/collections/bouton-entete', icon: PanelTop },
					{ kind: 'link', label: 'Pied de page', href: '/collections/footer', icon: PanelBottom }
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

	// Décision — "Communes" (collection `tenants`) réservé au super-admin :
	// nom/domaine/thème/statut du contrat sont des leviers commerciaux, pas
	// des réglages qu'un admin/éditeur de commune doit voir ou toucher (accès
	// déjà verrouillé côté champ dans `collections/Tenants.ts`, ce lien
	// n'ajoute qu'un raccourci de navigation cohérent avec ce même rôle).
	const isSuperAdmin = user?.role === 'super-admin';

	const parametres: NavSection = {
		label: 'Paramètres',
		items: [
			{ kind: 'link', label: 'Catégories', href: '/collections/categories', icon: Tags },
			{ kind: 'link', label: 'Icônes', href: '/collections/icones', icon: Shapes },
			{ kind: 'link', label: 'Médias', href: '/collections/media', icon: Images },
			{ kind: 'link', label: 'Documents', href: '/collections/documents', icon: FileStack },
			{ kind: 'link', label: 'Utilisateurs', href: '/collections/users', icon: Users },
			...(isSuperAdmin
				? [{ kind: 'link' as const, label: 'Communes', href: '/collections/tenants', icon: Building2 }]
				: [])
		]
	};

	return (
		<nav className="admin-nav">
			<div className="admin-nav__brand">
				<span className="admin-nav__brand-mark">{brandMark(siteName)}</span>
				<span className="admin-nav__brand-name">{siteName}</span>
			</div>

			<div className="admin-nav__body">
				<NavGroup section={monSite} base={base} pathname={pathname} />
				<NavGroup section={parametres} base={base} pathname={pathname} />
			</div>

			{user && (
				<div className="admin-nav__footer">
					<div className="admin-nav__user">
						{/* Décision 74 — photo si renseignée (Users.photo), repli sur
						    l'initiale de l'email sinon, comme avant. */}
						{photoUrl ? (
							<Image
								src={photoUrl}
								alt=""
								width={28}
								height={28}
								className="admin-nav__user-photo"
							/>
						) : (
							<span className="admin-nav__user-avatar">
								{(user.email as string)?.charAt(0).toUpperCase()}
							</span>
						)}
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
