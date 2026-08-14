'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'header';

type SubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: SubLink[] };

type Props = {
	// Décisions 1-5 — construit dynamiquement depuis la collection `pages`
	// (voir lib/payload.ts, getNavLinks), passé par app/layout.tsx (Server
	// Component) : ce composant reste client (interactions clavier/focus du
	// menu), il ne peut pas interroger Payload lui-même.
	navLinks: NavLink[];
};

// Disclosure pattern (WAI-ARIA APG), not the Menu/Menubar pattern: the APG
// explicitly advises against role="menu"/menuitem + arrow-key navigation for
// site nav — that's reserved for application menus. A native <button> with
// aria-expanded, toggling a plain link list, is the recommended shape here;
// Enter/Space already work for free because it's a real <button>.
function DropdownItem({ link }: { link: NavLink }) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const submenuId = useId();

	useEffect(() => {
		if (!open) return;

		// Escape closes and returns focus to the trigger — standard dismissal
		// behavior for a transient popup, keeps keyboard users oriented.
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
				buttonRef.current?.focus();
			}
		};
		// Tabbing (or clicking) anywhere outside this dropdown closes it —
		// otherwise it would stay open and visually stack over content the
		// user has already moved on from.
		const onFocusOut = (e: FocusEvent) => {
			if (!containerRef.current?.contains(e.relatedTarget as Node)) {
				setOpen(false);
			}
		};
		const onClickOutside = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('click', onClickOutside);
		const node = containerRef.current;
		node?.addEventListener('focusout', onFocusOut);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('click', onClickOutside);
			node?.removeEventListener('focusout', onFocusOut);
		};
	}, [open]);

	if (!link.children) {
		return (
			<Link href={link.href} className={`${CLASS_NAME}__nav-link`}>
				{link.label}
			</Link>
		);
	}

	return (
		<div
			className={`${CLASS_NAME}__dropdown${open ? ` ${CLASS_NAME}__dropdown--open` : ''}`}
			ref={containerRef}
		>
			<button
				ref={buttonRef}
				className={`${CLASS_NAME}__nav-link ${CLASS_NAME}__nav-link--has-children`}
				aria-expanded={open}
				aria-controls={submenuId}
				onClick={() => setOpen((o) => !o)}
			>
				{link.label}
				<ChevronDown
					size={13}
					className={`${CLASS_NAME}__chevron`}
					aria-hidden="true"
				/>
			</button>
			<div id={submenuId} className={`${CLASS_NAME}__submenu`}>
				{link.children.map((child) => (
					<Link
						key={child.href}
						href={child.href}
						className={`${CLASS_NAME}__submenu-link`}
						onClick={() => setOpen(false)}
					>
						{child.label}
					</Link>
				))}
			</div>
		</div>
	);
}

function MobileNavItem({
	link,
	onClose
}: {
	link: NavLink;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(false);

	if (!link.children) {
		return (
			<Link
				href={link.href}
				className={`${CLASS_NAME}__mobile-link`}
				onClick={onClose}
			>
				{link.label}
				<ChevronRight
					size={16}
					className={`${CLASS_NAME}__mobile-arrow`}
					aria-hidden="true"
				/>
			</Link>
		);
	}

	return (
		<div className={`${CLASS_NAME}__mobile-group`}>
			<button
				className={`${CLASS_NAME}__mobile-link ${CLASS_NAME}__mobile-link--parent`}
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
			>
				{link.label}
				<ChevronDown
					size={16}
					className={`${CLASS_NAME}__mobile-chevron ${open ? `${CLASS_NAME}__mobile-chevron--open` : ''}`}
					aria-hidden="true"
				/>
			</button>
			<div
				className={`${CLASS_NAME}__mobile-sub ${open ? `${CLASS_NAME}__mobile-sub--open` : ''}`}
			>
				<div className={`${CLASS_NAME}__mobile-sub-inner`}>
					{link.children.map((child) => (
						<Link
							key={child.href}
							href={child.href}
							className={`${CLASS_NAME}__mobile-sublink`}
							onClick={onClose}
						>
							<span
								className={`${CLASS_NAME}__mobile-sublink-dot`}
							/>
							{child.label}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

export default function Header({ navLinks }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false);
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [isOpen]);

	return (
		<>
			<header className={`${CLASS_NAME} scrolled`}>
				<div className={`${CLASS_NAME}__inner container`}>
					<Link href="/" className={`${CLASS_NAME}__logo`}>
						<div className={`${CLASS_NAME}__logo-badge`}>
							<Image
								src="/saint-hilaire-bonneval-logo.png"
								alt="Blason de Saint-Hilaire-Bonneval"
								width={36}
								height={36}
							/>
						</div>
						<div className={`${CLASS_NAME}__logo-text`}>
							<span className={`${CLASS_NAME}__logo-name`}>
								Saint-Hilaire-Bonneval
							</span>
							<span className={`${CLASS_NAME}__logo-sub`}>
								Haute-Vienne · 87260
							</span>
						</div>
					</Link>

					<nav className={`${CLASS_NAME}__nav`} aria-label="Menu principal">
						{navLinks.map((link) => (
							<DropdownItem key={link.label} link={link} />
						))}
					</nav>

					<div className={`${CLASS_NAME}__actions`}>
						<Link
							href="/location-salle"
							className={`${CLASS_NAME}__cta`}
						>
							Location de salles
						</Link>
						<button
							className={`${CLASS_NAME}__burger`}
							onClick={() => setIsOpen(!isOpen)}
							aria-label={
								isOpen ? 'Fermer le menu' : 'Ouvrir le menu'
							}
							aria-expanded={isOpen}
						>
							{isOpen ? (
								<X size={22} aria-hidden="true" />
							) : (
								<Menu size={22} aria-hidden="true" />
							)}
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
						<nav
							className={`${CLASS_NAME}__drawer ${isOpen ? `${CLASS_NAME}__drawer--open` : ''}`}
							aria-label="Menu principal (mobile)"
						>
							<div className={`${CLASS_NAME}__drawer-header`}>
								<Link
									href="/"
									className={`${CLASS_NAME}__drawer-logo`}
									onClick={() => setIsOpen(false)}
								>
									<span
										className={`${CLASS_NAME}__drawer-logo-name`}
									>
										Saint-Hilaire-Bonneval
									</span>
									<span
										className={`${CLASS_NAME}__drawer-logo-sub`}
									>
										Haute-Vienne · 87260
									</span>
								</Link>
								<button
									className={`${CLASS_NAME}__drawer-close`}
									onClick={() => setIsOpen(false)}
									aria-label="Fermer le menu"
								>
									<X size={20} aria-hidden="true" />
								</button>
							</div>
							<div className={`${CLASS_NAME}__drawer-body`}>
								{navLinks.map((link) => (
									<MobileNavItem
										key={link.label}
										link={link}
										onClose={() => setIsOpen(false)}
									/>
								))}
							</div>
							<div className={`${CLASS_NAME}__drawer-footer`}>
								<Link
									href="/location-salle"
									className={`${CLASS_NAME}__drawer-cta`}
									onClick={() => setIsOpen(false)}
								>
									Location de salles
								</Link>
							</div>
						</nav>
					</>,
					document.body
				)}
		</>
	);
}
