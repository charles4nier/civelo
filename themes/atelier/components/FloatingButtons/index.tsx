'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Map, X, Mail, MapPin, Send, Search } from 'lucide-react';
import './style.scss';

const CLASS_NAME = 'floating';

type Modal = 'contact' | 'bot' | 'search' | 'newsletter' | null;

type ModalProps = {
	onClose: () => void;
	closing: boolean;
	titleId: string;
	closeButtonRef: React.RefObject<HTMLButtonElement | null>;
	modalRef: React.RefObject<HTMLDivElement | null>;
};

// Close button comes first in the JSX — and so first in DOM/focus order —
// then repositioned to the right visually via CSS `order`, so it's the
// natural first stop when focus enters the dialog.
function ContactModal({ onClose, closing, titleId, closeButtonRef, modalRef }: ModalProps) {
	return (
		<div
			ref={modalRef}
			className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			// Still present for the exit transition to play out, but pulled out
			// of the accessibility tree the instant closing starts — it must
			// never be both in the DOM and "live" at the same time.
			aria-hidden={closing || undefined}
		>
			<div className={`${CLASS_NAME}__modal-header`}>
				<button
					ref={closeButtonRef}
					className={`${CLASS_NAME}__modal-close`}
					onClick={onClose}
					aria-label="Fermer"
				>
					<X size={18} aria-hidden="true" />
				</button>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div
						className={`${CLASS_NAME}__modal-icon ${CLASS_NAME}__modal-icon--leaf`}
					>
						<Phone size={16} aria-hidden="true" />
					</div>
					<h2 id={titleId} className={`${CLASS_NAME}__modal-title`}>
						Nous contacter
					</h2>
				</div>
			</div>

			<div className={`${CLASS_NAME}__modal-body`}>
				<div className={`${CLASS_NAME}__contact-infos`}>
					<div className={`${CLASS_NAME}__contact-info`}>
						<Phone
							size={15}
							className={`${CLASS_NAME}__contact-info-icon`}
							aria-hidden="true"
						/>
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>
								Téléphone
							</p>
							<a
								href="tel:0555006200"
								className={`${CLASS_NAME}__contact-info-value`}
							>
								05 XX XX 62 00
							</a>
						</div>
					</div>
					<div className={`${CLASS_NAME}__contact-info`}>
						<Mail
							size={15}
							className={`${CLASS_NAME}__contact-info-icon`}
							aria-hidden="true"
						/>
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>
								Email
							</p>
							<a
								href="mailto:mairie@saint-martin.fr"
								className={`${CLASS_NAME}__contact-info-value`}
							>
								mairie@saint-martin.fr
							</a>
						</div>
					</div>
					<div className={`${CLASS_NAME}__contact-info`}>
						<MapPin
							size={15}
							className={`${CLASS_NAME}__contact-info-icon`}
							aria-hidden="true"
						/>
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>
								Adresse
							</p>
							<p className={`${CLASS_NAME}__contact-info-value`}>
								Le Bourg
								<br />
								87000 Saint-Martin
							</p>
						</div>
					</div>
				</div>

				<div className={`${CLASS_NAME}__divider`} />

				<form
					className={`${CLASS_NAME}__form`}
					onSubmit={(e) => e.preventDefault()}
				>
					<p className={`${CLASS_NAME}__form-title`}>
						Envoyer un message
					</p>
					<div className={`${CLASS_NAME}__field`}>
						<label
							htmlFor="floating-contact-name"
							className={`${CLASS_NAME}__label`}
						>
							Nom
						</label>
						<input
							id="floating-contact-name"
							name="name"
							autoComplete="name"
							className={`${CLASS_NAME}__input`}
							type="text"
							placeholder="Votre nom"
						/>
					</div>
					<div className={`${CLASS_NAME}__field`}>
						<label
							htmlFor="floating-contact-email"
							className={`${CLASS_NAME}__label`}
						>
							Email
						</label>
						<input
							id="floating-contact-email"
							name="email"
							autoComplete="email"
							className={`${CLASS_NAME}__input`}
							type="email"
							placeholder="votre@email.fr"
						/>
					</div>
					<div className={`${CLASS_NAME}__field`}>
						<label
							htmlFor="floating-contact-message"
							className={`${CLASS_NAME}__label`}
						>
							Message
						</label>
						<textarea
							id="floating-contact-message"
							name="message"
							className={`${CLASS_NAME}__textarea`}
							rows={4}
							placeholder="Votre message..."
						/>
					</div>
					<button type="submit" className={`${CLASS_NAME}__submit`}>
						<Send size={14} aria-hidden="true" />
						Envoyer
					</button>
				</form>
			</div>
		</div>
	);
}

type ResultatPopin = { titre: string; extrait?: string; href: string; rubrique?: string };

// Popin « Rechercher » (item en tête de `L'essentiel en un clic`, voir
// `QuickAccess`). Décision 98 — branchée sur la vraie recherche : résultats
// au fil de la frappe (`/api/recherche`, 8 au plus), Entrée ouvre la page
// complète `/recherche?q=…` (formulaire GET : fonctionne aussi sans JS).
function SearchModal({ onClose, closing, titleId, closeButtonRef, modalRef }: ModalProps) {
	const [q, setQ] = useState('');
	const [resultats, setResultats] = useState<ResultatPopin[] | null>(null);
	const [chargement, setChargement] = useState(false);

	useEffect(() => {
		const terme = q.trim();
		if (terme.length < 2) {
			setResultats(null);
			return;
		}
		const controleur = new AbortController();
		const minuterie = setTimeout(() => {
			setChargement(true);
			fetch(`/api/recherche?q=${encodeURIComponent(terme)}`, { signal: controleur.signal })
				.then((r) => (r.ok ? r.json() : { resultats: [] }))
				.then((data: { resultats: ResultatPopin[] }) => setResultats(data.resultats))
				.catch(() => {})
				.finally(() => setChargement(false));
		}, 250);
		return () => {
			clearTimeout(minuterie);
			controleur.abort();
		};
	}, [q]);

	return (
		<div
			ref={modalRef}
			className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-hidden={closing || undefined}
		>
			<div className={`${CLASS_NAME}__modal-header`}>
				<button
					ref={closeButtonRef}
					className={`${CLASS_NAME}__modal-close`}
					onClick={onClose}
					aria-label="Fermer"
				>
					<X size={18} aria-hidden="true" />
				</button>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div className={`${CLASS_NAME}__modal-icon ${CLASS_NAME}__modal-icon--primary`}>
						<Search size={16} aria-hidden="true" />
					</div>
					<h2 id={titleId} className={`${CLASS_NAME}__modal-title`}>
						Rechercher
					</h2>
				</div>
			</div>

			<div className={`${CLASS_NAME}__modal-body`}>
				<form role="search" className={`${CLASS_NAME}__form`} action="/recherche" method="get">
					<div className={`${CLASS_NAME}__field`}>
						<label htmlFor="floating-search-input" className={`${CLASS_NAME}__label`}>
							Rechercher sur le site
						</label>
						<input
							id="floating-search-input"
							name="q"
							className={`${CLASS_NAME}__input`}
							type="search"
							placeholder="Comment pouvons-nous vous aider ?"
							autoComplete="off"
							value={q}
							onChange={(e) => setQ(e.target.value)}
						/>
					</div>
					<button type="submit" className={`${CLASS_NAME}__submit`}>
						<Search size={14} aria-hidden="true" />
						Voir tous les résultats
					</button>
				</form>

				<p className={`${CLASS_NAME}__search-status`} role="status">
					{chargement
						? 'Recherche…'
						: resultats === null
							? ''
							: resultats.length === 0
								? 'Aucun résultat.'
								: `${resultats.length} résultat${resultats.length > 1 ? 's' : ''}`}
				</p>
				{resultats && resultats.length > 0 && (
					<ul className={`${CLASS_NAME}__search-results`}>
						{resultats.map((r) => (
							<li key={r.href}>
								<Link href={r.href} className={`${CLASS_NAME}__search-result`} onClick={onClose}>
									<span className={`${CLASS_NAME}__search-result-title`}>{r.titre}</span>
									{r.rubrique && <span className={`${CLASS_NAME}__search-result-meta`}>{r.rubrique}</span>}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

// Décision 98 (§7, étape 5) — inscription à la lettre d'information
// (bouton du bloc Agenda de l'accueil). Consentement explicite obligatoire ;
// champ piège `site` masqué contre les robots ; message de résultat annoncé
// aux lecteurs d'écran (`role="status"`, ou `alert` en cas d'erreur).
function NewsletterModal({ onClose, closing, titleId, closeButtonRef, modalRef }: ModalProps) {
	const [etat, setEtat] = useState<{ ok: boolean; message: string } | null>(null);
	const [envoi, setEnvoi] = useState(false);

	const envoyer = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setEnvoi(true);
		setEtat(null);
		try {
			const r = await fetch('/api/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: form.get('email'),
					consentement: form.get('consentement') === 'oui',
					site: form.get('site')
				})
			});
			const data = (await r.json().catch(() => ({}))) as { ok?: boolean; message?: string };
			setEtat({
				ok: Boolean(data.ok),
				message: data.message ?? (data.ok ? 'Merci, votre inscription est bien enregistrée.' : 'Une erreur est survenue, réessayez.')
			});
		} catch {
			setEtat({ ok: false, message: 'Une erreur est survenue, réessayez.' });
		} finally {
			setEnvoi(false);
		}
	};

	return (
		<div
			ref={modalRef}
			className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-hidden={closing || undefined}
		>
			<div className={`${CLASS_NAME}__modal-header`}>
				<button ref={closeButtonRef} className={`${CLASS_NAME}__modal-close`} onClick={onClose} aria-label="Fermer">
					<X size={18} aria-hidden="true" />
				</button>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div className={`${CLASS_NAME}__modal-icon ${CLASS_NAME}__modal-icon--leaf`}>
						<Mail size={16} aria-hidden="true" />
					</div>
					<h2 id={titleId} className={`${CLASS_NAME}__modal-title`}>
						Lettre d'information
					</h2>
				</div>
			</div>

			<div className={`${CLASS_NAME}__modal-body`}>
				{etat?.ok ? (
					<p className={`${CLASS_NAME}__newsletter-message`} role="status">
						{etat.message}
					</p>
				) : (
					<form className={`${CLASS_NAME}__form`} onSubmit={envoyer}>
						<p className={`${CLASS_NAME}__form-title`}>Recevez les nouvelles de la commune par e-mail.</p>
						<div className={`${CLASS_NAME}__field`}>
							<label htmlFor="floating-newsletter-email" className={`${CLASS_NAME}__label`}>
								Adresse e-mail (obligatoire)
							</label>
							<input
								id="floating-newsletter-email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className={`${CLASS_NAME}__input`}
								placeholder="votre@email.fr"
							/>
						</div>
						{/* Piège à robots : invisible et hors du parcours clavier. */}
						<div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
							<label htmlFor="floating-newsletter-site">Ne pas remplir</label>
							<input id="floating-newsletter-site" name="site" type="text" tabIndex={-1} autoComplete="off" />
						</div>
						<div className={`${CLASS_NAME}__consent`}>
							<input id="floating-newsletter-consentement" name="consentement" type="checkbox" value="oui" required />
							<label htmlFor="floating-newsletter-consentement">
								J'accepte de recevoir la lettre d'information de la commune. Mon adresse ne sert qu'à cet envoi ; je peux
								me désinscrire à tout moment.
							</label>
						</div>
						{etat && !etat.ok && (
							<p className={`${CLASS_NAME}__newsletter-erreur`} role="alert">
								{etat.message}
							</p>
						)}
						<button type="submit" className={`${CLASS_NAME}__submit`} disabled={envoi}>
							<Send size={14} aria-hidden="true" />
							{envoi ? 'Inscription…' : "M'inscrire"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}

const suggestions = [
	'Démarches administratives',
	'Horaires de la mairie',
	'Location de salle',
	'Randonnées',
	'Médecins',
	'Commerces & artisans'
];

function BotModal({ onClose, closing, titleId, closeButtonRef, modalRef }: ModalProps) {
	const [messages, setMessages] = useState<
		{ from: 'user' | 'bot'; text: string }[]
	>([{ from: 'bot', text: 'Bonjour 👋 Que recherchez-vous ?' }]);
	const [input, setInput] = useState('');

	const handleSend = () => {
		if (!input.trim()) return;
		setMessages((m) => [...m, { from: 'user', text: input }]);
		setInput('');
		setTimeout(() => {
			setMessages((m) => [
				...m,
				{
					from: 'bot',
					text: 'Je travaille encore sur ma base de connaissances — revenez bientôt !'
				}
			]);
		}, 600);
	};

	return (
		<div
			ref={modalRef}
			className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-hidden={closing || undefined}
		>
			<div className={`${CLASS_NAME}__modal-header`}>
				<button
					ref={closeButtonRef}
					className={`${CLASS_NAME}__modal-close`}
					onClick={onClose}
					aria-label="Fermer"
				>
					<X size={18} aria-hidden="true" />
				</button>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div
						className={`${CLASS_NAME}__modal-icon ${CLASS_NAME}__modal-icon--coral`}
					>
						<MessageCircle size={16} aria-hidden="true" />
					</div>
					<h2 id={titleId} className={`${CLASS_NAME}__modal-title`}>
						Assistant municipal
					</h2>
				</div>
			</div>

			<div
				className={`${CLASS_NAME}__modal-body ${CLASS_NAME}__modal-body--bot`}
			>
				<div className={`${CLASS_NAME}__chat`} aria-live="polite">
					{messages.map((m, i) => (
						<div
							key={i}
							className={`${CLASS_NAME}__message ${CLASS_NAME}__message--${m.from}`}
						>
							{m.text}
						</div>
					))}
				</div>

				<div className={`${CLASS_NAME}__suggestions`}>
					{suggestions.map((s) => (
						<button
							key={s}
							className={`${CLASS_NAME}__suggestion`}
							onClick={() => setInput(s)}
						>
							{s}
						</button>
					))}
				</div>

				<div className={`${CLASS_NAME}__chat-input`}>
					<input
						className={`${CLASS_NAME}__input`}
						type="text"
						placeholder="Posez votre question..."
						aria-label="Votre question"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSend()}
					/>
					<button
						className={`${CLASS_NAME}__send`}
						onClick={handleSend}
						aria-label="Envoyer le message"
					>
						<Send size={15} aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
	);
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FloatingButtons() {
	const [activeModal, setActiveModal] = useState<Modal>(null);
	const [isClosing, setIsClosing] = useState(false);
	const pathname = usePathname();
	const isOnMap = pathname === '/tourisme/carte-interactive';

	const contactBtnRef = useRef<HTMLButtonElement>(null);
	const botBtnRef = useRef<HTMLButtonElement>(null);
	// Jamais attaché à un vrai bouton — ce composant n'a pas de bouton flottant
	// "Recherche" (déclenchée depuis `QuickAccess`, voir l'écouteur plus bas).
	// Le focus ne revient donc nulle part de précis à la fermeture, comme déjà
	// le cas pour Contact quand il est ouvert depuis `QuickAccess` plutôt que
	// depuis son propre bouton flottant.
	const searchBtnRef = useRef<HTMLButtonElement>(null);
	const closeBtnRef = useRef<HTMLButtonElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const buttonsRowRef = useRef<HTMLDivElement>(null);
	// Whichever trigger opened the current modal — focus comes back here on close.
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	// Masqués (en desktop, voir `style.scss`) tant que `L'essentiel en un
	// clic` (QuickAccess, `#demarches`) est visible à l'écran — ses
	// raccourcis Contact/Carte interactive font déjà doublon. Toujours
	// présent en haut de chaque page (`home/index.tsx`, toutes variantes et
	// tous gabarits), donc l'élément à observer existe dès le premier rendu.
	const [hideForQuickAccess, setHideForQuickAccess] = useState(false);
	useEffect(() => {
		const target = document.getElementById('demarches');
		if (!target) return;

		const observer = new IntersectionObserver(([entry]) => setHideForQuickAccess(entry.isIntersecting), {
			threshold: 0
		});
		observer.observe(target);
		return () => observer.disconnect();
	}, []);

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			setActiveModal(null);
			setIsClosing(false);
		}, 280);
	};

	const toggle = (modal: Modal, btnRef: React.RefObject<HTMLButtonElement | null>) => {
		if (activeModal === modal) {
			handleClose();
		} else {
			setIsClosing(false);
			setActiveModal(modal);
			triggerRef.current = btnRef.current;
		}
	};

	// D'autres endroits de la page (ex. `L'essentiel en un clic`, voir
	// `QuickAccess/index.tsx`) déclenchent la popin Contact via cet événement
	// plutôt que de dupliquer sa logique (focus trap, `inert`, Échap...). Nom
	// littéral partagé par convention — pas d'import direct depuis `shared`
	// vers une feature de page.
	useEffect(() => {
		const onOpenModal = (e: Event) => {
			const detail = (e as CustomEvent<Modal>).detail;
			if (detail === 'contact') toggle('contact', contactBtnRef);
			if (detail === 'search') toggle('search', searchBtnRef);
			// Le bouton qui a ouvert la popin (bloc Agenda) récupère le focus à
			// la fermeture.
			if (detail === 'newsletter') toggle('newsletter', { current: document.activeElement as HTMLButtonElement | null });
		};
		window.addEventListener('quick-access:open-modal', onOpenModal);
		return () => window.removeEventListener('quick-access:open-modal', onOpenModal);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeModal]);

	// True only while the modal is the actual live/focused surface — false
	// during the 280ms closing fade, once focus has already left it. Inert
	// and the focus trap are tied to this, not to `activeModal` alone:
	// otherwise the background (including the trigger button focus lands on
	// when closing) would still be inert at the exact moment we try to focus
	// it, and the .focus() call would silently no-op.
	const modalIsLive = activeModal !== null && !isClosing;

	// Lock body scroll for the modal's whole lifetime, closing animation
	// included — purely visual, no focus/accessibility stake in the timing.
	useEffect(() => {
		if (!activeModal) return;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, [activeModal]);

	// While the modal is live: focus its close button, and make everything
	// else in the page (header, main, footer, the trigger buttons themselves)
	// inert — unreachable by Tab *and* by a screen reader's own browse-mode
	// cursor, not just visually dimmed behind the backdrop.
	//
	// The trigger's focus() call lives in this same effect's cleanup — not in
	// handleClose — specifically so it runs *after* the inert attribute below
	// has actually been removed from the DOM. Effects (and their cleanups)
	// commit asynchronously; calling focus() on the trigger from handleClose
	// directly would fire while it's still marked inert from the render
	// that's only just now being torn down, and inert elements silently
	// refuse focus.
	useEffect(() => {
		if (!modalIsLive) return;

		closeBtnRef.current?.focus();

		const inertTargets = [
			document.querySelector('header'),
			document.querySelector('main'),
			document.querySelector('footer'),
			buttonsRowRef.current
		];
		inertTargets.forEach((el) => el?.setAttribute('inert', ''));

		return () => {
			inertTargets.forEach((el) => el?.removeAttribute('inert'));
			triggerRef.current?.focus();
		};
	}, [modalIsLive]);

	// Escape closes; Tab/Shift+Tab stay trapped among the dialog's own
	// focusable elements instead of escaping to the (inert, but belt-and-
	// suspenders) rest of the page. Only while live — once closing has
	// started, focus already sits outside the modal and there's nothing left
	// to trap.
	useEffect(() => {
		if (!modalIsLive) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleClose();
				return;
			}
			if (e.key !== 'Tab' || !modalRef.current) return;

			const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalIsLive]);

	return (
		<>
			{activeModal && (
				<div
					className={`${CLASS_NAME}__backdrop ${isClosing ? `${CLASS_NAME}__backdrop--closing` : ''}`}
					onClick={handleClose}
				/>
			)}

			{activeModal === 'contact' && (
				<ContactModal
					onClose={handleClose}
					closing={isClosing}
					titleId="floating-contact-title"
					closeButtonRef={closeBtnRef}
					modalRef={modalRef}
				/>
			)}
			{activeModal === 'bot' && (
				<BotModal
					onClose={handleClose}
					closing={isClosing}
					titleId="floating-bot-title"
					closeButtonRef={closeBtnRef}
					modalRef={modalRef}
				/>
			)}
			{activeModal === 'search' && (
				<SearchModal
					onClose={handleClose}
					closing={isClosing}
					titleId="floating-search-title"
					closeButtonRef={closeBtnRef}
					modalRef={modalRef}
				/>
			)}
			{activeModal === 'newsletter' && (
				<NewsletterModal
					onClose={handleClose}
					closing={isClosing}
					titleId="floating-newsletter-title"
					closeButtonRef={closeBtnRef}
					modalRef={modalRef}
				/>
			)}

			<div
				className={`${CLASS_NAME}__buttons ${hideForQuickAccess ? `${CLASS_NAME}__buttons--hidden` : ''}`}
				ref={buttonsRowRef}
				id="actions-rapides"
				tabIndex={-1}
			>
				{!isOnMap && (
					<Link
						href="/tourisme/carte-interactive"
						className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--sunshine`}
						title="Carte interactive"
						aria-label="Carte interactive"
						aria-hidden={hideForQuickAccess || undefined}
						tabIndex={hideForQuickAccess ? -1 : undefined}
					>
						<Map size={20} aria-hidden="true" />
					</Link>
				)}
				<button
					ref={botBtnRef}
					className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--coral`}
					onClick={() => toggle('bot', botBtnRef)}
					title="Assistant"
					aria-label="Assistant"
					aria-hidden={hideForQuickAccess || undefined}
					tabIndex={hideForQuickAccess ? -1 : undefined}
				>
					<MessageCircle size={20} aria-hidden="true" />
				</button>
				<button
					ref={contactBtnRef}
					className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--leaf`}
					onClick={() => toggle('contact', contactBtnRef)}
					title="Contact"
					aria-label="Contact"
					aria-hidden={hideForQuickAccess || undefined}
					tabIndex={hideForQuickAccess ? -1 : undefined}
				>
					<Phone size={20} aria-hidden="true" />
				</button>
			</div>
		</>
	);
}
