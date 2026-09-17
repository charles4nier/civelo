'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Map, X, Mail, MapPin, Send } from 'lucide-react';
import { commune } from '@themes/preau/config/commune';
import './style.scss';

const CLASS_NAME = 'floating';

type Modal = 'contact' | 'bot' | null;

const suggestions = [
	'Démarches administratives',
	'Horaires de la mairie',
	'Location de salle',
	'Randonnées',
	'Commerces & artisans',
];

function ContactModal({ onClose, closing }: { onClose: () => void; closing: boolean }) {
	return (
		<div className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}>
			<div className={`${CLASS_NAME}__modal-header`}>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div className={`${CLASS_NAME}__modal-icon`}><Phone size={16} /></div>
					<h2 className={`${CLASS_NAME}__modal-title`}>Nous contacter</h2>
				</div>
				<button className={`${CLASS_NAME}__modal-close`} onClick={onClose} aria-label="Fermer">
					<X size={18} />
				</button>
			</div>
			<div className={`${CLASS_NAME}__modal-body`}>
				<div className={`${CLASS_NAME}__contact-infos`}>
					<div className={`${CLASS_NAME}__contact-info`}>
						<Phone size={15} />
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>Téléphone</p>
							<a href={`tel:${commune.telephone.replace(/\s/g, '')}`} className={`${CLASS_NAME}__contact-info-value`}>{commune.telephone}</a>
						</div>
					</div>
					<div className={`${CLASS_NAME}__contact-info`}>
						<Mail size={15} />
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>Email</p>
							<a href={`mailto:${commune.email}`} className={`${CLASS_NAME}__contact-info-value`}>{commune.email}</a>
						</div>
					</div>
					<div className={`${CLASS_NAME}__contact-info`}>
						<MapPin size={15} />
						<div>
							<p className={`${CLASS_NAME}__contact-info-label`}>Adresse</p>
							<p className={`${CLASS_NAME}__contact-info-value`}>{commune.adresse}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function BotModal({ onClose, closing }: { onClose: () => void; closing: boolean }) {
	const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
		{ from: 'bot', text: 'Bonjour ! Que recherchez-vous ?' },
	]);
	const [input, setInput] = useState('');

	const handleSend = () => {
		if (!input.trim()) return;
		setMessages((m) => [...m, { from: 'user', text: input }]);
		setInput('');
		setTimeout(() => {
			setMessages((m) => [...m, { from: 'bot', text: 'Je travaille encore sur ma base de connaissances — revenez bientôt !' }]);
		}, 600);
	};

	return (
		<div className={`${CLASS_NAME}__modal ${closing ? `${CLASS_NAME}__modal--closing` : ''}`}>
			<div className={`${CLASS_NAME}__modal-header`}>
				<div className={`${CLASS_NAME}__modal-title-group`}>
					<div className={`${CLASS_NAME}__modal-icon ${CLASS_NAME}__modal-icon--accent`}><MessageCircle size={16} /></div>
					<h2 className={`${CLASS_NAME}__modal-title`}>Assistant municipal</h2>
				</div>
				<button className={`${CLASS_NAME}__modal-close`} onClick={onClose} aria-label="Fermer"><X size={18} /></button>
			</div>
			<div className={`${CLASS_NAME}__modal-body ${CLASS_NAME}__modal-body--bot`}>
				<div className={`${CLASS_NAME}__chat`}>
					{messages.map((m, i) => (
						<div key={i} className={`${CLASS_NAME}__message ${CLASS_NAME}__message--${m.from}`}>{m.text}</div>
					))}
				</div>
				<div className={`${CLASS_NAME}__suggestions`}>
					{suggestions.map((s) => (
						<button key={s} className={`${CLASS_NAME}__suggestion`} onClick={() => setInput(s)}>{s}</button>
					))}
				</div>
				<div className={`${CLASS_NAME}__chat-input`}>
					<input
						className={`${CLASS_NAME}__input`}
						type="text"
						placeholder="Posez votre question..."
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSend()}
					/>
					<button className={`${CLASS_NAME}__send`} onClick={handleSend}><Send size={15} /></button>
				</div>
			</div>
		</div>
	);
}

export default function FloatingButtons() {
	const [activeModal, setActiveModal] = useState<Modal>(null);
	const [isClosing, setIsClosing]     = useState(false);
	const pathname  = usePathname();
	const isOnMap   = pathname === '/tourisme/carte-interactive';

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => { setActiveModal(null); setIsClosing(false); }, 280);
	};

	const toggle = (modal: Modal) => {
		if (activeModal === modal) { handleClose(); }
		else { setIsClosing(false); setActiveModal(modal); }
	};

	return (
		<>
			{activeModal && (
				<div
					className={`${CLASS_NAME}__backdrop ${isClosing ? `${CLASS_NAME}__backdrop--closing` : ''}`}
					onClick={handleClose}
				/>
			)}
			{activeModal === 'contact' && <ContactModal onClose={handleClose} closing={isClosing} />}
			{activeModal === 'bot'     && <BotModal     onClose={handleClose} closing={isClosing} />}

			<div className={`${CLASS_NAME}__buttons`}>
				{!isOnMap && (
					<Link href="/tourisme/carte-interactive" className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--ochre`} title="Carte">
						<Map size={20} />
					</Link>
				)}
				<button className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--accent`} onClick={() => toggle('bot')} title="Assistant">
					<MessageCircle size={20} />
				</button>
				<button className={`${CLASS_NAME}__btn ${CLASS_NAME}__btn--forest`} onClick={() => toggle('contact')} title="Contact">
					<Phone size={20} />
				</button>
			</div>
		</>
	);
}
