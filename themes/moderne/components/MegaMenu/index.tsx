'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ChevronRight, Home, Building2, FileText, TreePine,
	Users, Clock, MapPin, Newspaper, Landmark,
	Footprints, BookOpen, HeartHandshake, Baby, Phone, CalendarDays, Mail,
} from 'lucide-react';
import './style.scss';

type SubLink = { label: string; href: string };
export type NavLink = { label: string; href: string; children?: SubLink[] };

type SubItem = { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; desc?: string };
type Entry  = { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; intro: string; items: SubItem[] };

// Icône + description par page — la collection `pages` de Payload n'a pas
// de champ "icône de menu"/"description de menu" (les entrées du menu
// viennent de `getNavLinks()`, label + lien uniquement), donc pas de vraie
// donnée dynamique possible ici sans étendre ce schéma. Table par slug pour
// les 18 gabarits du catalogue produit — une page dont le slug n'y figure
// pas (renommée, ou propre à une commune) retombe sur une icône/absence de
// description génériques plutôt que de planter.
const PAGE_META: Record<string, { icon: SubItem['icon']; desc?: string }> = {
	'mairie/actualites': { icon: Newspaper, desc: 'Les nouvelles de la commune' },
	'mairie/maire-elus': { icon: Users, desc: 'Élus et commissions' },
	'mairie/publications': { icon: BookOpen, desc: 'Bulletins, comptes-rendus, budget' },
	'mairie/horaires': { icon: Clock, desc: 'Permanences et contacts' },
	'mairie/budget-projets': { icon: FileText, desc: 'Finances et investissements' },
	'vivre/la-commune': { icon: Landmark, desc: 'Présentation et chiffres clés' },
	commerces: { icon: Building2, desc: 'Commerces et services locaux' },
	'vivre/enfance-jeunesse': { icon: Baby, desc: 'École, périscolaire, accueil de loisirs' },
	'vivre/vie-associative': { icon: HeartHandshake, desc: 'Les associations de la commune' },
	'vivre/sports-loisirs': { icon: Footprints, desc: 'Équipements et activités' },
	histoire: { icon: BookOpen, desc: 'Patrimoine et mémoire de la commune' },
	'tourisme/carte-interactive': { icon: MapPin, desc: "Tous les points d'intérêt" },
	demarches: { icon: FileText, desc: 'Vos démarches administratives' },
	contact: { icon: Mail, desc: 'Nous contacter' },
	'numeros-utiles': { icon: Phone, desc: 'Urgences et contacts pratiques' },
	agenda: { icon: CalendarDays, desc: 'Les rendez-vous à venir' },
	'location-salle': { icon: Home, desc: 'Réserver une salle communale' },
	accueil: { icon: Home }
};

const SECTION_ICONS: Record<string, SubItem['icon']> = {
	"L'essentiel": FileText,
	'Votre mairie': Landmark,
	'Ma commune': Home,
	'Tourisme & découverte': TreePine
};

const SECTION_INTROS: Record<string, string> = {
	"L'essentiel": 'Les démarches et informations les plus utiles au quotidien.',
	'Votre mairie': 'Le conseil municipal, les publications et les actes officiels.',
	'Ma commune': 'Le quotidien dans la commune : familles, associations, équipements.',
	'Tourisme & découverte': 'Découvrir le territoire, ses sentiers, ses étangs et son patrimoine.'
};

function toEntries(navLinks: NavLink[]): Entry[] {
	return navLinks.map((link) => ({
		label: link.label,
		href: link.children?.[0]?.href ?? link.href,
		icon: SECTION_ICONS[link.label] ?? FileText,
		intro: SECTION_INTROS[link.label] ?? '',
		items: (link.children ?? []).map((child) => {
			const slug = child.href.replace(/^\//, '');
			const meta = PAGE_META[slug];
			return { label: child.label, href: child.href, icon: meta?.icon ?? FileText, desc: meta?.desc };
		})
	}));
}

export function MegaMenu({ navLinks }: { navLinks: NavLink[] }) {
	const [open, setOpen]     = useState(false);
	const [active, setActive] = useState<number | null>(null);
	const rootRef             = useRef<HTMLDivElement>(null);
	const router              = useRouter();
	const entries = toEntries(navLinks);

	useEffect(() => {
		if (!open) return;
		const onKey   = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
		const onClick = (e: MouseEvent)    => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
		window.addEventListener('keydown', onKey);
		window.addEventListener('mousedown', onClick);
		return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
	}, [open]);

	useEffect(() => { if (!open) setActive(null); }, [open]);

	const current = active !== null ? entries[active] : null;

	return (
		<div ref={rootRef} className="mega-menu">
			<button
				className={`mega-menu__trigger${open ? ' mega-menu__trigger--open' : ''}`}
				aria-label="Menu"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				Menu
				<span className="mega-menu__hamburger">
					<span className="mega-menu__bar mega-menu__bar--1" />
					<span className="mega-menu__bar mega-menu__bar--2" />
					<span className="mega-menu__bar mega-menu__bar--3" />
				</span>
			</button>

			<div className={`mega-menu__panel${open ? ' mega-menu__panel--open' : ''}`}>
				<div className="mega-menu__frame">
					{/* Gauche */}
					<ul className="mega-menu__left">
						{entries.map((entry, i) => {
							const Icon = entry.icon;
							const isActive = active === i;
							return (
								<li key={entry.label}>
									<button
										type="button"
										className={`mega-menu__entry${isActive ? ' mega-menu__entry--active' : ''}`}
										onMouseEnter={() => entry.items.length > 0 ? setActive(i) : setActive(null)}
										onFocus={() => entry.items.length > 0 ? setActive(i) : setActive(null)}
										onClick={() => { setOpen(false); router.push(entry.href); }}
									>
										<span className={`mega-menu__entry-icon${isActive ? ' mega-menu__entry-icon--active' : ''}`}>
											<Icon size={16} />
										</span>
										<span className="mega-menu__entry-label">{entry.label}</span>
										<ChevronRight size={16} className={`mega-menu__entry-chevron${isActive ? ' mega-menu__entry-chevron--active' : ''}`} />
									</button>
								</li>
							);
						})}
					</ul>

					{/* Droite */}
					<div className={`mega-menu__right${current ? ' mega-menu__right--open' : ''}`} aria-hidden={!current}>
						{current && (
							<div className="mega-menu__sub">
								<div className="mega-menu__sub-header">
									<div className="mega-menu__sub-eyebrow">
										<span className="mega-menu__sub-dot" />
										{current.label}
									</div>
									{current.intro && <p className="mega-menu__sub-intro">{current.intro}</p>}
								</div>
								<div className="mega-menu__sub-items">
									{current.items.map((item) => {
										const Icon = item.icon;
										return (
											<Link key={item.label} href={item.href} className="mega-menu__item" onClick={() => setOpen(false)}>
												<span className="mega-menu__item-icon"><Icon size={16} /></span>
												<span className="mega-menu__item-body">
													<span className="mega-menu__item-label">{item.label}</span>
													{item.desc && <span className="mega-menu__item-desc">{item.desc}</span>}
												</span>
												<ChevronRight size={16} className="mega-menu__item-arrow" />
											</Link>
										);
									})}
							</div>
						</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
