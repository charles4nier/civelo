import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "accueil_afficher_slideshow" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_accueil_afficher_slideshow" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "accueil_afficher_slideshow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_accueil_afficher_slideshow";`)
}
