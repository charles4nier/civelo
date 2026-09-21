import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_liste_items_annuaire" ADD COLUMN "image_id" integer;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_liste_items_annuaire_image_idx" ON "pages_liste_items_annuaire" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_image_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_liste_items_annuaire" DROP CONSTRAINT "pages_liste_items_annuaire_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_version_liste_items_annuaire" DROP CONSTRAINT "_pages_v_version_liste_items_annuaire_image_id_media_id_fk";
  
  DROP INDEX "pages_liste_items_annuaire_image_idx";
  DROP INDEX "_pages_v_version_liste_items_annuaire_image_idx";
  ALTER TABLE "pages_liste_items_annuaire" DROP COLUMN "image_id";
  ALTER TABLE "_pages_v_version_liste_items_annuaire" DROP COLUMN "image_id";`)
}
