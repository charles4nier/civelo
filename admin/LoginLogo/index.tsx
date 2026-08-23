import './style.scss';

// Décision 68 — "je ne veux plus le logo Payload, mais mon espace
// administrateur" : remplace le logo par défaut de Payload sur l'écran de
// connexion (`admin.components.graphics.Logo`).
//
// Étape 5 du plan multi-tenant — reprenait le titre saisi dans "Identité du
// site" (alors un `Global`, une seule ligne pour tout le site). Devenu une
// collection tenant-scopée : plus aucune commune "la" bonne à lire avant
// authentification (domaine admin partagé, décidé avec le client — pas de
// sous-domaine par commune). Reste sur le libellé générique, volontairement
// — deviner un tenant à cet écran serait faux la plupart du temps.
export default function LoginLogo() {
	return (
		<div className="login-logo">
			<span className="login-logo__mark">EA</span>
			<div className="login-logo__text">
				<span className="login-logo__titre">Espace administrateur</span>
			</div>
		</div>
	);
}
