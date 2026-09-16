import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tenants_variante" AS ENUM('defaut', 'tourisme');
  CREATE TABLE "pages_accueil_slideshow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"etiquette" varchar,
  	"titre" varchar,
  	"description" varchar,
  	"badge_nombre" varchar,
  	"badge_libelle" varchar,
  	"bouton_label" varchar,
  	"lien_id" integer
  );
  
  CREATE TABLE "_pages_v_version_accueil_slideshow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"etiquette" varchar,
  	"titre" varchar,
  	"description" varchar,
  	"badge_nombre" varchar,
  	"badge_libelle" varchar,
  	"bouton_label" varchar,
  	"lien_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "tenants" ADD COLUMN "variante" "enum_tenants_variante" DEFAULT 'defaut' NOT NULL;
  ALTER TABLE "pages_accueil_slideshow" ADD CONSTRAINT "pages_accueil_slideshow_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_slideshow" ADD CONSTRAINT "pages_accueil_slideshow_lien_id_pages_id_fk" FOREIGN KEY ("lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_slideshow" ADD CONSTRAINT "pages_accueil_slideshow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_slideshow" ADD CONSTRAINT "_pages_v_version_accueil_slideshow_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_slideshow" ADD CONSTRAINT "_pages_v_version_accueil_slideshow_lien_id_pages_id_fk" FOREIGN KEY ("lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_slideshow" ADD CONSTRAINT "_pages_v_version_accueil_slideshow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_accueil_slideshow_order_idx" ON "pages_accueil_slideshow" USING btree ("_order");
  CREATE INDEX "pages_accueil_slideshow_parent_id_idx" ON "pages_accueil_slideshow" USING btree ("_parent_id");
  CREATE INDEX "pages_accueil_slideshow_image_idx" ON "pages_accueil_slideshow" USING btree ("image_id");
  CREATE INDEX "pages_accueil_slideshow_lien_idx" ON "pages_accueil_slideshow" USING btree ("lien_id");
  CREATE INDEX "_pages_v_version_accueil_slideshow_order_idx" ON "_pages_v_version_accueil_slideshow" USING btree ("_order");
  CREATE INDEX "_pages_v_version_accueil_slideshow_parent_id_idx" ON "_pages_v_version_accueil_slideshow" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_accueil_slideshow_image_idx" ON "_pages_v_version_accueil_slideshow" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_accueil_slideshow_lien_idx" ON "_pages_v_version_accueil_slideshow" USING btree ("lien_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_accueil_slideshow" CASCADE;
  DROP TABLE "_pages_v_version_accueil_slideshow" CASCADE;
  ALTER TABLE "tenants" DROP COLUMN "variante";
  DROP TYPE "public"."enum_tenants_variante";`)
}
