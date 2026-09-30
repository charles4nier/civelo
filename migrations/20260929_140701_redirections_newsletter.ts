import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Décision 98 (chantier « fiches », §5 et §7) — collections `redirections`
// (anciennes adresses → pages/fiches, 301) et `abonnes-newsletter` (inscrits
// à la lettre d'information). Générée par `migrate:create`, retouchée :
// `tenant_id` en ON DELETE CASCADE comme toutes les collections rattachées à
// une commune (`20260914_181940_cascade_suppression_tenant`), et
// `IF EXISTS` dans `down` (le DROP TABLE … CASCADE emporte déjà les
// contraintes, cf. `20260929_094633_fiches_actualites`).

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_redirections_origine" AS ENUM('manuelle', 'renommage');
  CREATE TYPE "public"."enum_abonnes_newsletter_statut" AS ENUM('actif', 'desinscrit');
  CREATE TABLE "redirections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"de" varchar NOT NULL,
  	"origine" "enum_redirections_origine" DEFAULT 'manuelle',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"fiches_id" integer
  );
  
  CREATE TABLE "abonnes_newsletter" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"email" varchar NOT NULL,
  	"statut" "enum_abonnes_newsletter_statut" DEFAULT 'actif' NOT NULL,
  	"consentement_le" timestamp(3) with time zone,
  	"desinscrit_le" timestamp(3) with time zone,
  	"jeton" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "abonnes_newsletter_id" integer;
  ALTER TABLE "redirections" ADD CONSTRAINT "redirections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirections_rels" ADD CONSTRAINT "redirections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirections_rels" ADD CONSTRAINT "redirections_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirections_rels" ADD CONSTRAINT "redirections_rels_fiches_fk" FOREIGN KEY ("fiches_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "abonnes_newsletter" ADD CONSTRAINT "abonnes_newsletter_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "redirections_tenant_idx" ON "redirections" USING btree ("tenant_id");
  CREATE INDEX "redirections_updated_at_idx" ON "redirections" USING btree ("updated_at");
  CREATE INDEX "redirections_created_at_idx" ON "redirections" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_de_idx" ON "redirections" USING btree ("tenant_id","de");
  CREATE INDEX "redirections_rels_order_idx" ON "redirections_rels" USING btree ("order");
  CREATE INDEX "redirections_rels_parent_idx" ON "redirections_rels" USING btree ("parent_id");
  CREATE INDEX "redirections_rels_path_idx" ON "redirections_rels" USING btree ("path");
  CREATE INDEX "redirections_rels_pages_id_idx" ON "redirections_rels" USING btree ("pages_id");
  CREATE INDEX "redirections_rels_fiches_id_idx" ON "redirections_rels" USING btree ("fiches_id");
  CREATE INDEX "abonnes_newsletter_tenant_idx" ON "abonnes_newsletter" USING btree ("tenant_id");
  CREATE INDEX "abonnes_newsletter_jeton_idx" ON "abonnes_newsletter" USING btree ("jeton");
  CREATE INDEX "abonnes_newsletter_updated_at_idx" ON "abonnes_newsletter" USING btree ("updated_at");
  CREATE INDEX "abonnes_newsletter_created_at_idx" ON "abonnes_newsletter" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_email_idx" ON "abonnes_newsletter" USING btree ("tenant_id","email");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirections_fk" FOREIGN KEY ("redirections_id") REFERENCES "public"."redirections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abonnes_newsletter_fk" FOREIGN KEY ("abonnes_newsletter_id") REFERENCES "public"."abonnes_newsletter"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_redirections_id_idx" ON "payload_locked_documents_rels" USING btree ("redirections_id");
  CREATE INDEX "payload_locked_documents_rels_abonnes_newsletter_id_idx" ON "payload_locked_documents_rels" USING btree ("abonnes_newsletter_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "redirections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirections_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "abonnes_newsletter" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "redirections" CASCADE;
  DROP TABLE "redirections_rels" CASCADE;
  DROP TABLE "abonnes_newsletter" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_redirections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_abonnes_newsletter_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_redirections_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_abonnes_newsletter_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "abonnes_newsletter_id";
  DROP TYPE "public"."enum_redirections_origine";
  DROP TYPE "public"."enum_abonnes_newsletter_statut";`)
}
