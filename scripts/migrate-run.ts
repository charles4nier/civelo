// Même contournement que `_migrate-create.ts` — le binaire CLI officiel
// `payload migrate` plante sur ce Node avec ERR_REQUIRE_ASYNC_MODULE.
// Appelle directement `payload.db.migrate()`, la fonction que le CLI
// officiel invoque lui-même.
import { getPayload } from 'payload';
import config from '../payload.config';

const payload = await getPayload({ config });
await payload.db.migrate();
process.exit(0);
