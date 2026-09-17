import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Suite du renommage produit des 4 modeles (voir 20260911_101156 et
// 20260914_153219) : classique -> Le Clocher, accueillant -> Le Belvedere,
// moderne -> Le Preau, edito -> L'Atelier. Meme motif que la precedente
// (app -> moderne) : `RENAME VALUE` preserve les lignes tenants existantes,
// contrairement a la migration auto-generee par `migrate:create` (DROP TYPE
// + recreation), qui echoue sur toute ligne dont le theme n'est pas dans le
// nouvel enum (verifie en local : `invalid input value for enum
// enum_tenants_theme`).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'classique' TO 'clocher';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'accueillant' TO 'belvedere';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'moderne' TO 'preau';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'edito' TO 'atelier';`)
  await db.execute(sql`
   ALTER TABLE "tenants" ALTER COLUMN "theme" SET DEFAULT 'atelier'::"public"."enum_tenants_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" ALTER COLUMN "theme" SET DEFAULT 'edito'::"public"."enum_tenants_theme";`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'atelier' TO 'edito';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'preau' TO 'moderne';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'belvedere' TO 'accueillant';`)
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" RENAME VALUE 'clocher' TO 'classique';`)
}
