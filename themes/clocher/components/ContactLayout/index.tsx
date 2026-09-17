'use client';

import Link from 'next/link';
import { ChevronRight, Mail, Send } from 'lucide-react';
import ContactCard, { type ContactItem, type IconVariant } from '@themes/clocher/components/ContactCard';
import './style.scss';

const CLASS_NAME = 'contact';

export type ContactCardData = {
	key: string;
	icon: string;
	iconVariant: IconVariant;
	category: string;
	name: string;
	description?: string;
	contacts: ContactItem[];
};

type Props = {
	cards: ContactCardData[];
	formulaireActif: boolean;
};

export default function ContactLayout({ cards, formulaireActif }: Props) {
	return (
		<>
			{/* Hero */}
			<section className={`${CLASS_NAME}__hero`}>
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--top`} />
				<div className={`${CLASS_NAME}__hero-blur ${CLASS_NAME}__hero-blur--bottom`} />
				<div className={`${CLASS_NAME}__hero-content`}>
					<nav className={`${CLASS_NAME}__breadcrumb`} aria-label="Fil d'Ariane">
						<Link href="/">Accueil</Link>
						<ChevronRight size={14} aria-hidden="true" />
						<span>Contact</span>
					</nav>
					<p className={`${CLASS_NAME}__eyebrow`}>
						<Mail size={14} aria-hidden="true" />
						L&rsquo;essentiel
					</p>
					<h1 className={`${CLASS_NAME}__title`}>Contact</h1>
					<div className={`${CLASS_NAME}__divider`} />
					<p className={`${CLASS_NAME}__subtitle`}>
						Une question, une démarche, une remarque ?<br />
						L&rsquo;équipe de la mairie vous répond.
					</p>
				</div>
			</section>

			<section className={`${CLASS_NAME}__section`}>
				<div className={`${CLASS_NAME}__inner container`}>
					{/* Infos pratiques */}
					<h2 className={`${CLASS_NAME}__infos-title`}>Nos coordonnées</h2>
					<div className={`${CLASS_NAME}__infos`}>
						{cards.map((card) => (
							<ContactCard
								key={card.key}
								icon={card.icon}
								iconVariant={card.iconVariant}
								category={card.category}
								name={card.name}
								description={card.description}
								contacts={card.contacts}
							/>
						))}
					</div>

					<p className={`${CLASS_NAME}__hours-link`}>
						Consultez le détail des{' '}
						<Link href="/mairie/horaires">horaires d&rsquo;ouverture &amp; informations</Link>.
					</p>

					<div className={`${CLASS_NAME}__divider-line`} />

					{/* Formulaire */}
					{formulaireActif && (
						<div className={`${CLASS_NAME}__form-block`}>
							<p className={`${CLASS_NAME}__block-eyebrow`}>Écrivez-nous</p>
							<h2 className={`${CLASS_NAME}__block-title`}>Envoyer un message</h2>
							<div className={`${CLASS_NAME}__block-divider`} />

							<form className={`${CLASS_NAME}__form`} onSubmit={(e) => e.preventDefault()}>
								<div className={`${CLASS_NAME}__field`}>
									<label htmlFor="contact-name" className={`${CLASS_NAME}__label`}>
										Nom
									</label>
									<input
										id="contact-name"
										name="name"
										autoComplete="name"
										className={`${CLASS_NAME}__input`}
										type="text"
										placeholder="Votre nom"
										required
									/>
								</div>
								<div className={`${CLASS_NAME}__field`}>
									<label htmlFor="contact-email" className={`${CLASS_NAME}__label`}>
										Email
									</label>
									<input
										id="contact-email"
										name="email"
										autoComplete="email"
										className={`${CLASS_NAME}__input`}
										type="email"
										placeholder="votre@email.fr"
										required
									/>
								</div>
								<div className={`${CLASS_NAME}__field ${CLASS_NAME}__field--full`}>
									<label htmlFor="contact-subject" className={`${CLASS_NAME}__label`}>
										Objet
									</label>
									<input
										id="contact-subject"
										name="subject"
										className={`${CLASS_NAME}__input`}
										type="text"
										placeholder="L'objet de votre message"
									/>
								</div>
								<div className={`${CLASS_NAME}__field ${CLASS_NAME}__field--full`}>
									<label htmlFor="contact-message" className={`${CLASS_NAME}__label`}>
										Message
									</label>
									<textarea
										id="contact-message"
										name="message"
										className={`${CLASS_NAME}__textarea`}
										rows={6}
										placeholder="Votre message..."
										required
									/>
								</div>
								<button type="submit" className={`${CLASS_NAME}__submit`}>
									<Send size={14} aria-hidden="true" />
									Envoyer le message
								</button>
							</form>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
