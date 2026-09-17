'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'header';

type SubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: SubLink[] };

// Modificateur de couleur par section — purement décoratif (voir style.scss,
// `__nav-dot--{mod}`), pas une donnée que `getNavLinks()` fournit (label +
// lien uniquement). Attribué par position plutôt que par label : reste
// stable même si une commune renomme une entrée de menu.
const MODS = ['sun', 'coral', 'sky', 'leaf'];

type Props = {
	navLinks: NavLink[];
	identite: { titre: string; sousTitre?: string; logoUrl: string };
	bouton: { label: string; href: string };
};

function DropdownItem({ link, mod }: { link: NavLink; mod: string }) {
	if (!link.children) {
		return (
			<Link href={link.href} className={`${CLASS_NAME}__nav-link`}>
				<span className={`${CLASS_NAME}__nav-dot ${CLASS_NAME}__nav-dot--${mod}`} />
				{link.label}
			</Link>
		);
	}

	return (
		<div className={`${CLASS_NAME}__dropdown`}>
			<button className={`${CLASS_NAME}__nav-link`}>
				<span className={`${CLASS_NAME}__nav-dot ${CLASS_NAME}__nav-dot--${mod}`} />
				{link.label}
			</button>
			<div className={`${CLASS_NAME}__panel ${CLASS_NAME}__panel--${mod}`}>
				<div className={`${CLASS_NAME}__panel-inner`}>
					<div className={`${CLASS_NAME}__panel-title`}>
						<span className={`${CLASS_NAME}__panel-title-dot`} />
						{link.label}
					</div>
					<ul className={`${CLASS_NAME}__panel-list`}>
						{link.children.map((child) => (
							<li key={child.href}>
								<Link href={child.href} className={`${CLASS_NAME}__panel-link`}>
									{child.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

function MobileNavItem({ link, onClose }: { link: NavLink; onClose: () => void }) {
	const [open, setOpen] = useState(false);

	if (!link.children) {
		return (
			<Link href={link.href} className={`${CLASS_NAME}__mobile-link`} onClick={onClose}>
				{link.label}
				<ChevronRight size={16} className={`${CLASS_NAME}__mobile-arrow`} />
			</Link>
		);
	}

	return (
		<div className={`${CLASS_NAME}__mobile-group`}>
			<button
				className={`${CLASS_NAME}__mobile-link ${CLASS_NAME}__mobile-link--parent`}
				onClick={() => setOpen((o) => !o)}
			>
				{link.label}
				<ChevronDown
					size={16}
					className={`${CLASS_NAME}__mobile-chevron ${open ? `${CLASS_NAME}__mobile-chevron--open` : ''}`}
				/>
			</button>
			<div className={`${CLASS_NAME}__mobile-sub ${open ? `${CLASS_NAME}__mobile-sub--open` : ''}`}>
				<div className={`${CLASS_NAME}__mobile-sub-inner`}>
					{link.children.map((child) => (
						<Link
							key={child.href}
							href={child.href}
							className={`${CLASS_NAME}__mobile-sublink`}
							onClick={onClose}
						>
							<span className={`${CLASS_NAME}__mobile-sublink-dot`} />
							{child.label}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

export default function Header({ navLinks, identite, bouton }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	return (
		<>
			<header className={CLASS_NAME}>
				<div className={`${CLASS_NAME}__inner container`}>
					<Link href="/" className={`${CLASS_NAME}__logo`}>
						<span className={`${CLASS_NAME}__logo-name`}>{identite.titre}</span>
					</Link>

					<nav className={`${CLASS_NAME}__nav`}>
						{navLinks.map((link, i) => (
							<DropdownItem key={link.label} link={link} mod={MODS[i % MODS.length]} />
						))}
					</nav>

					<div className={`${CLASS_NAME}__actions`}>
						<Link href={bouton.href} className={`${CLASS_NAME}__cta`}>
							{bouton.label}
						</Link>
						<button
							className={`${CLASS_NAME}__burger`}
							onClick={() => setIsOpen(!isOpen)}
							aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
						>
							{isOpen ? <X size={22} /> : <Menu size={22} />}
						</button>
					</div>
				</div>
			</header>

			{mounted &&
				createPortal(
					<>
						<div
							className={`${CLASS_NAME}__overlay ${isOpen ? `${CLASS_NAME}__overlay--visible` : ''}`}
							onClick={() => setIsOpen(false)}
						/>
						<nav className={`${CLASS_NAME}__drawer ${isOpen ? `${CLASS_NAME}__drawer--open` : ''}`}>
							<div className={`${CLASS_NAME}__drawer-header`}>
								<Link href="/" className={`${CLASS_NAME}__drawer-logo`} onClick={() => setIsOpen(false)}>
									{identite.titre}
								</Link>
								<button
									className={`${CLASS_NAME}__drawer-close`}
									onClick={() => setIsOpen(false)}
									aria-label="Fermer le menu"
								>
									<X size={20} />
								</button>
							</div>
							<div className={`${CLASS_NAME}__drawer-body`}>
								{navLinks.map((link) => (
									<MobileNavItem key={link.label} link={link} onClose={() => setIsOpen(false)} />
								))}
							</div>
							<div className={`${CLASS_NAME}__drawer-footer`}>
								<Link
									href={bouton.href}
									className={`${CLASS_NAME}__drawer-cta`}
									onClick={() => setIsOpen(false)}
								>
									{bouton.label}
								</Link>
							</div>
						</nav>
					</>,
					document.body
				)}
		</>
	);
}
