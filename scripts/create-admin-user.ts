/**
 * Crée un premier utilisateur super-admin directement via la Local API
 * (contourne le contrôle d'accès custom sur `Users`, qui bloque toute
 * création tant qu'aucun utilisateur n'est déjà connecté — poule et œuf,
 * trouvé en testant l'admin réel). Nécessaire une fois par base fraîche.
 *
 * Usage : node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs scripts/create-admin-user.ts <email> <password> [prénom] [nom]
 */

import { getPayload } from 'payload';
import config from '../payload.config';

async function main() {
	const [email, password, prenom, nom] = process.argv.slice(2);
	if (!email || !password) {
		console.error('Usage : node scripts/create-admin-user.ts <email> <password> [prénom] [nom]');
		process.exit(1);
	}

	const payload = await getPayload({ config });
	const user = await payload.create({
		collection: 'users',
		data: { email, password, role: 'super-admin', prenom: prenom || 'Admin', nom: nom || 'Site' }
	});

	console.log(`Utilisateur super-admin créé : ${user.email}`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
