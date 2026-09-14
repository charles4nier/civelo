import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Le générateur de migrations de Payload ne permet pas de choisir le
// comportement ON DELETE d'une relation (toujours SET NULL par défaut,
// jamais CASCADE) — migration écrite à la main, comme
// 20260831_092500_fk_cascade_fix.ts qui avait déjà corrigé ce même défaut
// sur users_tenants.
//
// Sans ce correctif, supprimer un tenant de test laisse ses pages,
// médias, documents, POI, sentiers et catégories orphelins en base
// (tenant_id mis à NULL) pour toujours, sans aucun nettoyage automatique —
// constaté concrètement le 2026-09-14 : 92 pages orphelines accumulées
// par plusieurs tenants de test supprimés au fil des mois, impossibles à
// distinguer les unes des autres a posteriori.
const TABLES = ['pages', 'media', 'documents', 'pois', 'sentiers', 'categories', 'identite', 'footer', 'bouton_entete']

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(sql.raw(`
      ALTER TABLE "${table}" DROP CONSTRAINT "${table}_tenant_id_tenants_id_fk";
      ALTER TABLE "${table}" ADD CONSTRAINT "${table}_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `))
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    await db.execute(sql.raw(`
      ALTER TABLE "${table}" DROP CONSTRAINT "${table}_tenant_id_tenants_id_fk";
      ALTER TABLE "${table}" ADD CONSTRAINT "${table}_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `))
  }
}
