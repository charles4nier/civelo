import type { GlobalConfig } from 'payload';
import { isLoggedIn } from '../collections/access';
import { boutonFields } from '../collections/Pages';

// Décision 61 — le bouton d'action de l'en-tête ("Location de salles" par
// défaut, mais peut pointer vers n'importe quelle page — "ça peut être
// location de salle, mais aussi autre chose"). Séparé de `Identite` : c'est
// un choix de contenu que le client peut vouloir changer souvent (quelle
// page mettre en avant), pas une donnée de marque fixée une fois. Réutilise
// exactement le même pattern que le bouton de la Section d'introduction
// (décision 52) : texte + lien vers une page du site.
export const BoutonEntete: GlobalConfig = {
	slug: 'bouton-entete',
	label: "Bouton d'en-tête",
	access: {
		read: () => true,
		// Éditeur normal, pas verrouillé super-admin — le client doit pouvoir
		// changer le texte et la page cible librement.
		update: isLoggedIn
	},
	fields: boutonFields('bouton', "Bouton d'en-tête")
};
