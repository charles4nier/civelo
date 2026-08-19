import type { ServerProps } from 'payload';
import { Newspaper, CalendarDays, FileStack, Phone, ArrowRight, CircleAlert } from 'lucide-react';
import './style.scss';

// Décision 69 — "le tableau de bord ne doit pas être des collections, je
// veux une page qui me dit Bonjour avec le nom de l'utilisateur." Remplace
// entièrement l'accueil par défaut de Payload (liste de collections en
// grille de cartes) via `admin.components.views.dashboard`.
//
// Décision 70 — deux ajouts discutés avec le client plutôt que des
// statistiques décoratives : des raccourcis vers les actions les plus
// fréquentes (actualité, agenda), et un état "reste à compléter" qui
// interroge la base en direct pour lister le contenu encore vide repéré
// lors des audits des décisions 62-65 — pas une liste figée, elle se vide
// au fur et à mesure que le client remplit les choses.

const SHORTCUT_SLUGS = ['mairie/actualites', 'agenda', 'mairie/publications', 'numeros-utiles'] as const;
const CHECKLIST_SLUGS = ['histoire', 'vivre/la-commune', 'contact', 'mairie/horaires'] as const;

type TodoItem = { label: string; href: string };

const TODAY_FORMAT = new Intl.DateTimeFormat('fr-FR', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});

export default async function Dashboard({ payload, user }: ServerProps) {
	const prenom = typeof user?.prenom === 'string' && user.prenom ? user.prenom : undefined;
	const today = TODAY_FORMAT.format(new Date());

	const { docs: pages } = await payload.find({
		collection: 'pages',
		where: { slug: { in: [...SHORTCUT_SLUGS, ...CHECKLIST_SLUGS] } },
		limit: 0,
		pagination: false,
		depth: 0
	});
	const bySlug = new Map(pages.map((p: any) => [p.slug, p]));

	const actualites = bySlug.get('mairie/actualites');
	const agenda = bySlug.get('agenda');
	const publications = bySlug.get('mairie/publications');
	const numerosUtiles = bySlug.get('numeros-utiles');
	const histoire = bySlug.get('histoire');
	const commune = bySlug.get('vivre/la-commune');
	const contact = bySlug.get('contact');
	const horaires = bySlug.get('mairie/horaires');

	const identite = (await payload.findGlobal({ slug: 'identite', depth: 0 }).catch(() => null)) as any;
	const footer = (await payload.findGlobal({ slug: 'footer', depth: 0 }).catch(() => null)) as any;

	const todos: TodoItem[] = [];

	if (!histoire?.editorial?.sections?.length) {
		todos.push({ label: 'La page "Histoire" est vide', href: histoire ? `/collections/pages/${histoire.id}` : '/collections/pages' });
	}
	if (!commune?.editorial?.sections?.length) {
		todos.push({ label: 'La page "La commune" est vide', href: commune ? `/collections/pages/${commune.id}` : '/collections/pages' });
	}
	if (contact && !contact.contact?.telephone && !contact.contact?.email && !contact.contact?.adresse) {
		todos.push({ label: 'La page "Contact" n\'a aucune coordonnée', href: `/collections/pages/${contact.id}` });
	}
	if (horaires) {
		const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
		const auMoinsUnJour = jours.some((j) => horaires.horaires?.[j]?.matin || horaires.horaires?.[j]?.apresMidi);
		if (!auMoinsUnJour) {
			todos.push({ label: "La page \"Horaires\" n'a aucun horaire renseigné", href: `/collections/pages/${horaires.id}` });
		}
	}
	if (identite && !identite.logo) {
		todos.push({ label: "Le logo du site n'est pas encore mis en ligne", href: '/globals/identite' });
	}
	if (footer && !footer.telephone && !footer.email) {
		todos.push({ label: 'Le pied de page n\'a ni téléphone ni email', href: '/globals/footer' });
	}

	return (
		<div className="dashboard-home">
			<h1 className="dashboard-home__greeting">Bonjour{prenom ? ` ${prenom}` : ''}</h1>
			<p className="dashboard-home__date">{today}</p>
			{!prenom && (
				<p className="dashboard-home__hint">
					Renseignez votre prénom dans votre profil (menu en haut à droite) pour le voir ici.
				</p>
			)}

			<div className="dashboard-home__shortcuts">
				{actualites && (
					<a className="dashboard-home__shortcut" href={`/admin/collections/pages/${actualites.id}`}>
						<span className="dashboard-home__shortcut-icon">
							<Newspaper size={22} aria-hidden="true" />
						</span>
						<span className="dashboard-home__shortcut-text">
							<span className="dashboard-home__shortcut-title">Nouvelle actualité</span>
							<span className="dashboard-home__shortcut-desc">Publier une actu sur le site</span>
						</span>
						<ArrowRight size={18} className="dashboard-home__shortcut-arrow" aria-hidden="true" />
					</a>
				)}
				{agenda && (
					<a className="dashboard-home__shortcut" href={`/admin/collections/pages/${agenda.id}`}>
						<span className="dashboard-home__shortcut-icon">
							<CalendarDays size={22} aria-hidden="true" />
						</span>
						<span className="dashboard-home__shortcut-text">
							<span className="dashboard-home__shortcut-title">Nouvel évènement</span>
							<span className="dashboard-home__shortcut-desc">Ajouter une date à l'agenda</span>
						</span>
						<ArrowRight size={18} className="dashboard-home__shortcut-arrow" aria-hidden="true" />
					</a>
				)}
				{publications && (
					<a className="dashboard-home__shortcut" href={`/admin/collections/pages/${publications.id}`}>
						<span className="dashboard-home__shortcut-icon">
							<FileStack size={22} aria-hidden="true" />
						</span>
						<span className="dashboard-home__shortcut-text">
							<span className="dashboard-home__shortcut-title">Nouvelle publication</span>
							<span className="dashboard-home__shortcut-desc">Ajouter un document à télécharger</span>
						</span>
						<ArrowRight size={18} className="dashboard-home__shortcut-arrow" aria-hidden="true" />
					</a>
				)}
				{numerosUtiles && (
					<a className="dashboard-home__shortcut" href={`/admin/collections/pages/${numerosUtiles.id}`}>
						<span className="dashboard-home__shortcut-icon">
							<Phone size={22} aria-hidden="true" />
						</span>
						<span className="dashboard-home__shortcut-text">
							<span className="dashboard-home__shortcut-title">Nouveau numéro utile</span>
							<span className="dashboard-home__shortcut-desc">Ajouter un contact pratique</span>
						</span>
						<ArrowRight size={18} className="dashboard-home__shortcut-arrow" aria-hidden="true" />
					</a>
				)}
			</div>

			{todos.length > 0 && (
				<div className="dashboard-home__todo">
					<h2 className="dashboard-home__todo-title">Reste à compléter</h2>
					<ul className="dashboard-home__todo-list">
						{todos.map((t) => (
							<li key={t.href + t.label}>
								<a href={`/admin${t.href}`} className="dashboard-home__todo-item">
									<CircleAlert size={16} aria-hidden="true" />
									<span>{t.label}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
