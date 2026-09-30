import Link from 'next/link';
import type { ResultatRecherche } from '@lib/payload';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}

// Décision 98 (§7, étape 4) — formulaire et résultats de la page
// `/recherche`, les mêmes dans les 4 thèmes. Pas de style ici : chaque thème
// habille les classes `recherche__*` via le mixin commun
// `shared/styles/_recherche.scss` (voir `themes/<thème>/components/RecherchePage`).
// Formulaire en GET classique : la page fonctionne sans JavaScript.
export default function ResultatsRecherche({ q, resultats }: { q: string; resultats: ResultatRecherche[] }) {
	return (
		<div className="recherche container">
			<form role="search" action="/recherche" method="get" className="recherche__form">
				<label htmlFor="recherche-q" className="recherche__label">
					Rechercher sur le site
				</label>
				<div className="recherche__champ">
					<input
						id="recherche-q"
						name="q"
						type="search"
						defaultValue={q}
						className="recherche__input"
						placeholder="Ex. carte d'identité, salle des fêtes…"
					/>
					<button type="submit" className="recherche__bouton">
						Rechercher
					</button>
				</div>
			</form>

			{q && (
				<p className="recherche__compte" role="status">
					{resultats.length === 0
						? `Aucun résultat pour « ${q} ». Essayez un autre mot, ou moins de mots.`
						: `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} pour « ${q} »`}
				</p>
			)}

			{resultats.length > 0 && (
				<ol className="recherche__liste">
					{resultats.map((r) => (
						<li key={r.href} className="recherche__resultat">
							<p className="recherche__rubrique">
								{r.rubrique}
								{r.date && ` · ${formatDate(r.date)}`}
							</p>
							<h2 className="recherche__titre">
								<Link href={r.href}>{r.titre}</Link>
							</h2>
							{r.extrait && <p className="recherche__extrait">{r.extrait}</p>}
						</li>
					))}
				</ol>
			)}
		</div>
	);
}
