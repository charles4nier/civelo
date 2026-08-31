// Remplace `payload migrate:create` (le binaire CLI officiel) — celui-ci
// plante sur ce Node (22.21.1) avec ERR_REQUIRE_ASYNC_MODULE en chargeant
// `payload.config.ts` (interaction CJS/ESM avec le top-level await de
// `@payloadcms/richtext-lexical`), indépendant de notre propre chargeur
// (`_resolve-ts.mjs`, qui lui fonctionne sans souci sur tous les autres
// scripts de ce dossier). Appelle directement la fonction sous-jacente que
// le CLI officiel invoque lui-même (`payload.db.createMigration`), avec
// exactement les mêmes arguments — mêmes fichiers générés, seul le point
// d'entrée change. À réévaluer si une future version de Node/tsx corrige
// l'incompatibilité.
//
// Usage : npm run migrate:create -- <nom-de-la-migration>
import { getPayload } from 'payload';
import config from '../payload.config';

const migrationName = process.argv[2] || 'baseline';

const payload = await getPayload({ config });
// `skipEmpty` : pas d'invite interactive possible ici (pas de TTY en CI) —
// si aucun changement de schéma n'est détecté, on préfère ne rien générer
// plutôt que de créer silencieusement un fichier de migration vide.
await payload.db.createMigration({ payload, migrationName, skipEmpty: true });
process.exit(0);
