import type { ServerProps } from 'payload';

import './style.scss';

// Décision 68 — "je ne veux plus le logo Payload, mais mon espace
// administrateur" : remplace le logo par défaut de Payload sur l'écran de
// connexion (`admin.components.graphics.Logo`). Réutilise le titre déjà
// saisi dans "Identité du site" (décision 61) plutôt qu'un texte en dur —
// une seule source, cohérent avec le reste de l'admin.
export default async function LoginLogo({ payload }: ServerProps) {
	let titre = 'Espace administrateur';
	try {
		const identite = (await payload.findGlobal({ slug: 'identite' })) as unknown as { titre?: string };
		if (identite?.titre) titre = identite.titre;
	} catch {
		// Repli sur le texte générique si le global n'est pas encore renseigné.
	}

	return (
		<div className="login-logo">
			<span className="login-logo__mark">
				{titre
					.split(/[\s-]+/)
					.filter(Boolean)
					.map((w) => w[0])
					.join('')
					.slice(0, 2)
					.toUpperCase()}
			</span>
			<div className="login-logo__text">
				<span className="login-logo__eyebrow">Espace administrateur</span>
				<span className="login-logo__titre">{titre}</span>
			</div>
		</div>
	);
}
