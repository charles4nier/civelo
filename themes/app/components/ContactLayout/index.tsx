'use client';

import Link from 'next/link';
import { Send } from 'lucide-react';
import PageHeader from '@themes/app/components/PageHeader';
import ContactCard, { type ContactItem, type IconVariant } from '@themes/app/components/ContactCard';
import { LucideIconByName } from '@shared/lib/icons';
import './style.scss';

const B = 'contact-layout';

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
			<PageHeader
				breadcrumb="Contact"
				eyebrowIcon={(p) => <LucideIconByName name="Mail" {...p} />}
				eyebrow="L'essentiel"
				title="Contact"
				subtitle={<>Une question, une démarche, une remarque ?<br />L'équipe de la mairie vous répond.</>}
			/>

			<section className={`${B}__section`}>
				<div className={`${B}__inner container`}>
					{cards.length > 0 && (
						<>
							<h2 className={`${B}__infos-title`}>Nos coordonnées</h2>
							<div className={`${B}__infos`}>
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
						</>
					)}

					<p className={`${B}__hours-link`}>
						Consultez le détail des <Link href="/mairie/horaires">horaires d&rsquo;ouverture &amp; informations</Link>.
					</p>

					{formulaireActif && (
						<div className={`${B}__form-block`}>
							<p className={`${B}__block-eyebrow`}>Écrivez-nous</p>
							<h2 className={`${B}__block-title`}>Envoyer un message</h2>
							<div className={`${B}__block-divider`} />

							<form className={`${B}__form`} onSubmit={(e) => e.preventDefault()}>
								<div className={`${B}__field`}>
									<label htmlFor="contact-name" className={`${B}__label`}>
										Nom
									</label>
									<input id="contact-name" name="name" autoComplete="name" className={`${B}__input`} type="text" placeholder="Votre nom" required />
								</div>
								<div className={`${B}__field`}>
									<label htmlFor="contact-email" className={`${B}__label`}>
										Email
									</label>
									<input id="contact-email" name="email" autoComplete="email" className={`${B}__input`} type="email" placeholder="votre@email.fr" required />
								</div>
								<div className={`${B}__field ${B}__field--full`}>
									<label htmlFor="contact-subject" className={`${B}__label`}>
										Objet
									</label>
									<input id="contact-subject" name="subject" className={`${B}__input`} type="text" placeholder="L'objet de votre message" />
								</div>
								<div className={`${B}__field ${B}__field--full`}>
									<label htmlFor="contact-message" className={`${B}__label`}>
										Message
									</label>
									<textarea id="contact-message" name="message" className={`${B}__textarea`} rows={6} placeholder="Votre message..." required />
								</div>
								<button type="submit" className={`${B}__submit btn-primary`}>
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
