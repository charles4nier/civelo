// Décision 46 — masquer un titre de champ via CSS s'est révélé peu fiable
// (dépendant d'une hypothèse de structure HTML impossible à vérifier sans
// rendu réel). Ce composant ne rend rien : garanti, puisqu'on contrôle
// directement ce qui s'affiche plutôt que d'essayer de le cacher après coup.
// Utilisé sur le groupe racine de chaque gabarit ("Organisation de la
// page" retiré, "Informations générales" suffit comme repère).
export default function HiddenLabel() {
	return null;
}
