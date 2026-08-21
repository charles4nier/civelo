// Décision 74 — "je ne veux plus voir l'icône Payload dans le fil d'ariane,
// mais 'Mon tableau de bord'". `admin.components.graphics.Icon` (pas
// `Logo`, réservé à l'écran de connexion, décision 68) contrôle le premier
// maillon du fil d'ariane (`StepNav`, `.step-nav__home`) — remplace le
// logo Payload par défaut par du texte. Le style (largeur auto, pas de
// troncature, couleur corail) est géré dans `admin/Nav/global-overrides.scss`
// puisque ce composant est rendu à l'intérieur d'un `<span>` déjà fourni
// par Payload, pas contrôlable depuis ce fichier.
export default function BreadcrumbHome() {
	return <span className="breadcrumb-home">Mon tableau de bord</span>;
}
