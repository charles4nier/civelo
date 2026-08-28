import type { ServerProps } from 'payload';
import { Newspaper, CalendarDays, FileStack, Phone, ArrowRight, CircleAlert } from 'lucide-react';
import { getSelectedTenantId, isTenantLocked } from '../lib/getSelectedTenantId';
import MesSitesClient from '../MesSites/Client';
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
//
// 2026-08-28 — "Mes sites" n'a finalement plus sa propre route (`/mes-sites`
// supprimée) : sur la console super-admin, LE tableau de bord EST "Mes
// sites" (voir `middleware.ts`, qui redirige tout vers `/admin` — jamais
// vers une route dédiée). Ce composant devient donc à deux visages : la
// grille de sites pour un super-admin sur la console dédiée, le "Bonjour"
// habituel pour tout le reste (éditeur/admin d'une commune, ou super-admin
// verrouillé sur le domaine d'une commune via le sélecteur).

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
	const isSuperAdminConsole = user?.role === 'super-admin' && !(await isTenantLocked());

	if (isSuperAdminConsole) {
		const { docs } = await payload.find({
			collection: 'tenants',
			limit: 0,
			pagination: false,
			sort: 'nom',
			depth: 0,
			overrideAccess: true
		});
		const tenants = (docs as any[]).map((t) => ({
			id: String(t.id),
			nom: t.nom as string,
			domaine: t.domaine as string,
			theme: t.theme as string,
			statutContrat: t.statutContrat as string,
			createdAt: t.createdAt as string
		}));
		return <MesSitesClient tenants={tenants} />;
	}

	const prenom = typeof user?.prenom === 'string' && user.prenom ? user.prenom : undefined;
	const today = TODAY_FORMAT.format(new Date());

	// Bug réel du 27/08/2026 — corrigé : sans ce filtre, `bySlug.get(...)`
	// pouvait résoudre la page d'une AUTRE commune (même slug, tenant
	// différent) — un raccourci "Nouvelle actualité" pouvait alors pointer
	// vers le contenu d'un tenant qui n'est pas celui affiché (voir
	// `getSelectedTenantId`).
	const tenantId = await getSelectedTenantId();
	const slugFilter = { slug: { in: [...SHORTCUT_SLUGS, ...CHECKLIST_SLUGS] } };
	const { docs: pages } = await payload.find({
		collection: 'pages',
		where: tenantId ? { and: [slugFilter, { tenant: { equals: tenantId } }] } : slugFilter,
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

	// Étape 5 du plan multi-tenant — `identite`/`footer` étaient des Globals
	// Payload, convertis en collections tenant-scopées. Correction du
	// 27/08/2026 : l'hypothèse initiale ("le filtrage par tenant du plugin
	// s'applique normalement à ce contexte") était FAUSSE — un appel Local
	// API direct comme celui-ci n'est jamais filtré automatiquement, quel
	// que soit le contexte d'où il part (voir `getSelectedTenantId`). Sans
	// le `where` ci-dessous, `docs[0]` pouvait être la fiche identité/pied
	// de page d'une AUTRE commune.
	const tenantWhere = tenantId ? { where: { tenant: { equals: tenantId } } } : {};
	const identite = (await payload
		.find({ collection: 'identite', depth: 0, limit: 1, ...tenantWhere })
		.then((r) => r.docs[0] ?? null)
		.catch(() => null)) as any;
	const footer = (await payload
		.find({ collection: 'footer', depth: 0, limit: 1, ...tenantWhere })
		.then((r) => r.docs[0] ?? null)
		.catch(() => null)) as any;

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
