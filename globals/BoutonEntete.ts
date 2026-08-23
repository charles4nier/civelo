import type { CollectionConfig } from 'payload';
import { isLoggedIn } from '../collections/access';
import { boutonFields } from '../collections/Pages';

// Décision 61 — le bouton d'action de l'en-tête ("Location de salles" par
// défaut, mais peut pointer vers n'importe quelle page — "ça peut être
// location de salle, mais aussi autre chose"). Séparé de `Identite` : c'est
// un choix de contenu que le client peut vouloir changer souvent (quelle
// page mettre en avant), pas une donnée de marque fixée une fois. Réutilise
// exactement le même pattern que le bouton de la Section d'introduction
// (décision 52) : texte + lien vers une page du site.
//
// Étape 5 du plan multi-tenant — converti de `Global` (singleton en base)
// en collection classique, `isGlobal: true` côté plugin. Voir `Identite.ts`
// pour le détail du pourquoi.
export const BoutonEntete: CollectionConfig = {
	slug: 'bouton-entete',
	labels: { singular: "Bouton d'en-tête", plural: "Bouton d'en-tête" },
	access: {
		read: () => true,
		// Éditeur normal, pas verrouillé super-admin — le client doit pouvoir
		// changer le texte et la page cible librement.
		update: isLoggedIn
	},
	fields: boutonFields('bouton', "Bouton d'en-tête")
};
