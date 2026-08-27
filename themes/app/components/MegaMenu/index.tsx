'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ChevronRight, Home, Building2, FileText, TreePine,
	Users, Clock, MapPin, Newspaper, Landmark,
	Footprints, BookOpen, HeartHandshake, Baby,
} from 'lucide-react';
import './style.scss';

type SubItem = { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; desc?: string };
type Entry  = { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; intro: string; items: SubItem[] };

const ENTRIES: Entry[] = [
	{
		label: 'Votre mairie',
		href: '/mairie/actualites',
		icon: Landmark,
		intro: 'Le conseil municipal, les publications et les actes officiels.',
		items: [
			{ label: 'Actualités',              href: '/mairie/actualites',  icon: Newspaper,  desc: 'Les nouvelles de la commune' },
			{ label: 'Le maire & les élus',     href: '/mairie/maire-elus',  icon: Users,      desc: 'Élus et commissions' },
			{ label: 'Documents & publications',href: '/mairie/publications', icon: BookOpen,   desc: 'Bulletins, comptes-rendus, budget' },
			{ label: 'Horaires & informations', href: '/mairie/horaires',    icon: Clock,      desc: 'Permanences et contacts' },
			{ label: 'Budget & projets',        href: '/mairie/budget-projets', icon: FileText, desc: 'Finances et investissements' },
		],
	},
	{
		label: 'Vivre à la commune',
		href: '/vivre/la-commune',
		icon: Home,
		intro: 'Le quotidien dans la commune : familles, associations, équipements.',
		items: [
			{ label: 'La commune',             href: '/vivre/la-commune',       icon: Landmark,       desc: 'Présentation et chiffres clés' },
			{ label: 'Services & vie pratique',href: '/commerces',              icon: Building2,      desc: 'Commerces et services locaux' },
			{ label: 'Enfance & jeunesse',     href: '/vivre/enfance-jeunesse', icon: Baby,           desc: 'École, périscolaire, accueil de loisirs' },
			{ label: 'Vie associative',        href: '/vivre/vie-associative',  icon: HeartHandshake, desc: 'Les associations du village' },
			{ label: 'Sports & loisirs',       href: '/vivre/sports-loisirs',  icon: Footprints,     desc: 'Équipements et activités' },
		],
	},
	{
		label: 'Tourisme & découvertes',
		href: '/tourisme/carte-interactive',
		icon: TreePine,
		intro: 'Découvrir le territoire, ses sentiers, ses étangs et son patrimoine.',
		items: [
			{ label: 'Histoire',          href: '/histoire',               icon: BookOpen, desc: 'Patrimoine et mémoire du village' },
			{ label: 'Carte interactive', href: '/tourisme/carte-interactive', icon: MapPin, desc: 'Tous les points d\'intérêt' },
		],
	},
	{
		label: 'Mes démarches',
		href: '/demarches',
		icon: FileText,
		intro: 'Effectuez vos démarches administratives en quelques clics.',
		items: [],
	},
];

export function MegaMenu() {
	const [open, setOpen]     = useState(false);
	const [active, setActive] = useState<number | null>(null);
	const rootRef             = useRef<HTMLDivElement>(null);
	const router              = useRouter();

	useEffect(() => {
		if (!open) return;
		const onKey   = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
		const onClick = (e: MouseEvent)    => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
		window.addEventListener('keydown', onKey);
		window.addEventListener('mousedown', onClick);
		return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
	}, [open]);

	useEffect(() => { if (!open) setActive(null); }, [open]);

	const current = active !== null ? ENTRIES[active] : null;

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
						{ENTRIES.map((entry, i) => {
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
									<p className="mega-menu__sub-intro">{current.intro}</p>
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
