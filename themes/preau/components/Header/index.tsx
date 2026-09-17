'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Search, Globe, ChevronDown, ChevronRight, ArrowRight, Menu } from 'lucide-react';
import { MegaMenu, type NavLink } from '@themes/preau/components/MegaMenu';
import './style.scss';

const CLASS_NAME = 'header';

type SubLink = { label: string; href: string };

type Props = {
	navLinks: NavLink[];
	identite: { titre: string; sousTitre?: string; logoUrl: string };
	bouton: { label: string; href: string };
};

function DropdownItem({ link }: { link: NavLink }) {
	if (!link.children) {
		return (
			<Link href={link.href} className={`${CLASS_NAME}__nav-link`}>
				{link.label}
			</Link>
		);
	}
	return (
		<div className={`${CLASS_NAME}__dropdown`}>
			<button className={`${CLASS_NAME}__nav-link ${CLASS_NAME}__nav-link--has-children`}>
				{link.label}
				<ChevronDown size={13} className={`${CLASS_NAME}__chevron`} />
			</button>
			<div className={`${CLASS_NAME}__submenu`}>
				{link.children.map((child) => (
					<Link key={child.href} href={child.href} className={`${CLASS_NAME}__submenu-link`}>
						{child.label}
					</Link>
				))}
			</div>
		</div>
	);
}

function MobileNavItem({ link, onClose }: { link: NavLink; onClose: () => void }) {
	const [open, setOpen] = useState(false);

	if (!link.children) {
		return (
			<div className={`${CLASS_NAME}__mobile-group`}>
				<Link href={link.href} className={`${CLASS_NAME}__mobile-link`} onClick={onClose}>
					{link.label}
					<ChevronRight size={16} />
				</Link>
			</div>
		);
	}
	return (
		<div className={`${CLASS_NAME}__mobile-group`}>
			<button
				className={`${CLASS_NAME}__mobile-link ${CLASS_NAME}__mobile-link--parent`}
				onClick={() => setOpen((o) => !o)}
			>
				{link.label}
				<ChevronDown size={16} className={`${CLASS_NAME}__mobile-chevron ${open ? `${CLASS_NAME}__mobile-chevron--open` : ''}`} />
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
	const [isOpen, setIsOpen]   = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	}, [isOpen]);

	return (
		<>
			<header className={CLASS_NAME}>
				<div className={`${CLASS_NAME}__inner container`}>

					{/* Gauche : MegaMenu + Search */}
					<div className={`${CLASS_NAME}__left`}>
						<MegaMenu navLinks={navLinks} />
						<button className={`${CLASS_NAME}__icon-btn`} aria-label="Rechercher">
							<Search size={16} />
						</button>
						<button className={`${CLASS_NAME}__lang-btn`} aria-label="Langue">
							<Globe size={14} /> FR
						</button>
					</div>

					{/* Centre : logo */}
					<Link href="/" className={`${CLASS_NAME}__logo`}>
						<span className={`${CLASS_NAME}__logo-name`}>{identite.titre}</span>
						{identite.sousTitre && <span className={`${CLASS_NAME}__logo-sub`}>{identite.sousTitre}</span>}
					</Link>

					{/* Droite : CTA + burger mobile */}
					<div className={`${CLASS_NAME}__right`}>
						<Link href={bouton.href} className={`${CLASS_NAME}__cta`}>
							{bouton.label}
							<ArrowRight size={16} />
						</Link>
						<button
							className={`${CLASS_NAME}__burger`}
							onClick={() => setIsOpen(true)}
							aria-label="Ouvrir le menu"
						>
							<Menu size={22} />
						</button>
					</div>
				</div>
			</header>

			{mounted && createPortal(
				<>
					<div
						className={`${CLASS_NAME}__overlay ${isOpen ? `${CLASS_NAME}__overlay--visible` : ''}`}
						onClick={() => setIsOpen(false)}
					/>
					<nav className={`${CLASS_NAME}__drawer ${isOpen ? `${CLASS_NAME}__drawer--open` : ''}`}>
						<div className={`${CLASS_NAME}__drawer-header`}>
							<Link href="/" className={`${CLASS_NAME}__drawer-logo`} onClick={() => setIsOpen(false)}>
								<span className={`${CLASS_NAME}__drawer-logo-name`}>{identite.titre}</span>
								{identite.sousTitre && <span className={`${CLASS_NAME}__drawer-logo-sub`}>{identite.sousTitre}</span>}
							</Link>
							<button className={`${CLASS_NAME}__drawer-close`} onClick={() => setIsOpen(false)} aria-label="Fermer">
								<X size={20} />
							</button>
						</div>
						<div className={`${CLASS_NAME}__drawer-body`}>
							{navLinks.map((link) => (
								<MobileNavItem key={link.label} link={link} onClose={() => setIsOpen(false)} />
							))}
						</div>
						<div className={`${CLASS_NAME}__drawer-footer`}>
							<Link href={bouton.href} className={`${CLASS_NAME}__drawer-cta`} onClick={() => setIsOpen(false)}>
								{bouton.label}
								<ArrowRight size={16} />
							</Link>
						</div>
					</nav>
				</>,
				document.body
			)}
		</>
	);
}
