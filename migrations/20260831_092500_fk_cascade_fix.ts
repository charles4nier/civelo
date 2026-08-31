import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Écrite à la main, pas générée par `migrate:create` — le générateur de
// Payload ne propose aucune option côté config pour choisir le comportement
// `ON DELETE` d'une relation, il produit toujours `SET NULL` par défaut pour
// `tenantsArrayField` (voir `@payloadcms/plugin-multi-tenant/dist/fields/
// tenantsArrayField/index.js`). Ce défaut est incohérent avec la colonne
// `tenant_id` déclarée `NOT NULL` (le sous-champ `tenant` est `required:
// true`) : supprimer un tenant encore référencé par un utilisateur faisait
// échouer la suppression en base (`null value in column "tenant_id" ...
// violates not-null constraint`) — panne réelle en prod, corrigée
// manuellement le 2026-08-30, capturée ici pour que toute base recréée
// depuis les migrations (nouvel environnement, restauration) ait le même
// correctif sans intervention manuelle.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_tenants" DROP CONSTRAINT IF EXISTS "users_tenants_tenant_id_tenants_id_fk";
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_tenants" DROP CONSTRAINT IF EXISTS "users_tenants_tenant_id_tenants_id_fk";
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;`)
}
