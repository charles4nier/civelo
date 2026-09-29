import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Décision 98 (chantier « fiches », pilote Actualités) — les actualités
// quittent le tableau `liste.itemsActualites` de leur page pour devenir des
// fiches (collection `fiches`). Généré par `migrate:create`, puis retouché à
// la main en trois points :
//
// 1. Copie des données, entre la création des tables `fiches` et la
//    suppression des anciennes : chaque actualité devient une fiche publiée,
//    rattachée à sa page, via l'API locale (les hooks de `Fiches.ts`
//    calculent l'URL, le type et la commune — mêmes règles qu'une fiche
//    créée dans l'admin). L'ancien `extrait` devient le chapô ; le texte
//    complet est vide (il n'existait pas). Seules les actualités de la
//    version PUBLIÉE des pages sont reprises : un brouillon de page non
//    publié qui aurait ajouté des actualités (`_pages_v`) est perdu.
// 2. `fiches.tenant_id` en ON DELETE CASCADE, comme toutes les collections
//    rattachées à une commune depuis `20260914_181940_cascade_suppression_tenant`
//    (le générateur met toujours SET NULL).
// 3. `down` recopie les fiches Actualités publiées dans l'ancien tableau
//    avant de supprimer `fiches`, pour qu'un retour arrière ne perde pas les
//    actualités (texte complet, image et pièces jointes, eux, sont perdus :
//    l'ancien modèle ne les avait pas).

type AncienneActualite = {
  page_id: number
  tenant_id: number | null
  titre: string | null
  categorie_id: number | null
  date: string | null
  extrait: string | null
  epinglee: boolean | null
  lien_document_id: number | null
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_fiches_type" AS ENUM('actualites', 'agenda', 'demarches', 'annuaire', 'document', 'budget-projet');
  CREATE TYPE "public"."enum_fiches_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fiches_v_version_type" AS ENUM('actualites', 'agenda', 'demarches', 'annuaire', 'document', 'budget-projet');
  CREATE TYPE "public"."enum__fiches_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "fiches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"titre" varchar,
  	"chapo" varchar,
  	"page_id" integer,
  	"type" "enum_fiches_type",
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"categorie_id" integer,
  	"epinglee" boolean DEFAULT false,
  	"image_id" integer,
  	"contenu" jsonb,
  	"page_liee_id" integer,
  	"seo_titre" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_fiches_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "fiches_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer
  );
  
  CREATE TABLE "_fiches_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_titre" varchar,
  	"version_chapo" varchar,
  	"version_page_id" integer,
  	"version_type" "enum__fiches_v_version_type",
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_categorie_id" integer,
  	"version_epinglee" boolean DEFAULT false,
  	"version_image_id" integer,
  	"version_contenu" jsonb,
  	"version_page_liee_id" integer,
  	"version_seo_titre" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__fiches_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_fiches_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fiches_id" integer;
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_page_liee_id_pages_id_fk" FOREIGN KEY ("page_liee_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiches_rels" ADD CONSTRAINT "fiches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fiches_rels" ADD CONSTRAINT "fiches_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_parent_id_fiches_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fiches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_page_id_pages_id_fk" FOREIGN KEY ("version_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_categorie_id_categories_id_fk" FOREIGN KEY ("version_categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_page_liee_id_pages_id_fk" FOREIGN KEY ("version_page_liee_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v_rels" ADD CONSTRAINT "_fiches_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_fiches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fiches_v_rels" ADD CONSTRAINT "_fiches_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "fiches_tenant_idx" ON "fiches" USING btree ("tenant_id");
  CREATE INDEX "fiches_page_idx" ON "fiches" USING btree ("page_id");
  CREATE INDEX "fiches_slug_idx" ON "fiches" USING btree ("slug");
  CREATE INDEX "fiches_categorie_idx" ON "fiches" USING btree ("categorie_id");
  CREATE INDEX "fiches_image_idx" ON "fiches" USING btree ("image_id");
  CREATE INDEX "fiches_page_liee_idx" ON "fiches" USING btree ("page_liee_id");
  CREATE INDEX "fiches_updated_at_idx" ON "fiches" USING btree ("updated_at");
  CREATE INDEX "fiches_created_at_idx" ON "fiches" USING btree ("created_at");
  CREATE INDEX "fiches__status_idx" ON "fiches" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_page_slug_idx" ON "fiches" USING btree ("tenant_id","page_id","slug");
  CREATE INDEX "fiches_rels_order_idx" ON "fiches_rels" USING btree ("order");
  CREATE INDEX "fiches_rels_parent_idx" ON "fiches_rels" USING btree ("parent_id");
  CREATE INDEX "fiches_rels_path_idx" ON "fiches_rels" USING btree ("path");
  CREATE INDEX "fiches_rels_documents_id_idx" ON "fiches_rels" USING btree ("documents_id");
  CREATE INDEX "_fiches_v_parent_idx" ON "_fiches_v" USING btree ("parent_id");
  CREATE INDEX "_fiches_v_version_version_tenant_idx" ON "_fiches_v" USING btree ("version_tenant_id");
  CREATE INDEX "_fiches_v_version_version_page_idx" ON "_fiches_v" USING btree ("version_page_id");
  CREATE INDEX "_fiches_v_version_version_slug_idx" ON "_fiches_v" USING btree ("version_slug");
  CREATE INDEX "_fiches_v_version_version_categorie_idx" ON "_fiches_v" USING btree ("version_categorie_id");
  CREATE INDEX "_fiches_v_version_version_image_idx" ON "_fiches_v" USING btree ("version_image_id");
  CREATE INDEX "_fiches_v_version_version_page_liee_idx" ON "_fiches_v" USING btree ("version_page_liee_id");
  CREATE INDEX "_fiches_v_version_version_updated_at_idx" ON "_fiches_v" USING btree ("version_updated_at");
  CREATE INDEX "_fiches_v_version_version_created_at_idx" ON "_fiches_v" USING btree ("version_created_at");
  CREATE INDEX "_fiches_v_version_version__status_idx" ON "_fiches_v" USING btree ("version__status");
  CREATE INDEX "_fiches_v_created_at_idx" ON "_fiches_v" USING btree ("created_at");
  CREATE INDEX "_fiches_v_updated_at_idx" ON "_fiches_v" USING btree ("updated_at");
  CREATE INDEX "_fiches_v_latest_idx" ON "_fiches_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_page_version_slug_idx" ON "_fiches_v" USING btree ("version_tenant_id","version_page_id","version_slug");
  CREATE INDEX "_fiches_v_rels_order_idx" ON "_fiches_v_rels" USING btree ("order");
  CREATE INDEX "_fiches_v_rels_parent_idx" ON "_fiches_v_rels" USING btree ("parent_id");
  CREATE INDEX "_fiches_v_rels_path_idx" ON "_fiches_v_rels" USING btree ("path");
  CREATE INDEX "_fiches_v_rels_documents_id_idx" ON "_fiches_v_rels" USING btree ("documents_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fiches_fk" FOREIGN KEY ("fiches_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fiches_id_idx" ON "payload_locked_documents_rels" USING btree ("fiches_id");`)

  const { rows } = await db.execute(sql`
    SELECT a._parent_id AS page_id, p.tenant_id, a.titre, a.categorie_id, a.date, a.extrait, a.epinglee, a.lien_document_id
    FROM "pages_liste_items_actualites" a
    JOIN "pages" p ON p.id = a._parent_id
    WHERE p.gabarit = 'liste' AND p.liste_layout_type = 'actualites'
    ORDER BY a._parent_id, a.date ASC NULLS LAST, a._order ASC
  `)
  const actualites = rows as unknown as AncienneActualite[]

  let copiees = 0
  for (const a of actualites) {
    // `reprise` : les anciennes données sont reprises telles quelles, même si
    // elles ne remplissent pas les obligations d'une fiche créée dans l'admin
    // (catégorie supprimée depuis…), voir `estReprise` dans `Fiches.ts`.
    req.context = { ...req.context, reprise: true }
    await payload.create({
      collection: 'fiches',
      overrideAccess: true,
      req,
      data: {
        titre: a.titre || 'Actualité',
        chapo: a.extrait || a.titre || 'Actualité',
        page: a.page_id,
        ...(a.tenant_id ? { tenant: a.tenant_id } : {}),
        date: a.date ? new Date(a.date).toISOString() : new Date().toISOString(),
        ...(a.categorie_id ? { categorie: a.categorie_id } : {}),
        epinglee: Boolean(a.epinglee),
        ...(a.lien_document_id ? { pageLiee: a.lien_document_id } : {}),
        _status: 'published'
      } as never
    })
    copiees++
  }

  const { rows: ignorees } = await db.execute(sql`
    SELECT count(*)::int AS n FROM "pages_liste_items_actualites" a
    JOIN "pages" p ON p.id = a._parent_id
    WHERE NOT (p.gabarit = 'liste' AND p.liste_layout_type = 'actualites')
  `)
  payload.logger.info(
    `[fiches_actualites] ${copiees} actualité(s) copiée(s) en fiches ; ${(ignorees[0] as { n: number }).n} ligne(s) ignorée(s) (page qui n'est plus une liste Actualités).`
  )

  await db.execute(sql`
  ALTER TABLE "pages_liste_items_actualites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_actualites" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_liste_items_actualites" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_actualites" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_liste_items_actualites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"date" timestamp(3) with time zone,
  	"extrait" varchar,
  	"epinglee" boolean DEFAULT false,
  	"lien_document_id" integer
  );
  
  CREATE TABLE "_pages_v_version_liste_items_actualites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"date" timestamp(3) with time zone,
  	"extrait" varchar,
  	"epinglee" boolean DEFAULT false,
  	"lien_document_id" integer,
  	"_uuid" varchar
  );
  
`)

  // Retour arrière : les fiches Actualités publiées redeviennent des lignes
  // du tableau de leur page (chapô → extrait, page liée → lien document).
  await db.execute(sql`
  INSERT INTO "pages_liste_items_actualites" ("_order", "_parent_id", "id", "titre", "categorie_id", "date", "extrait", "epinglee", "lien_document_id")
  SELECT
    row_number() OVER (PARTITION BY f.page_id ORDER BY f.date DESC NULLS LAST, f.id)::int,
    f.page_id,
    md5(f.id::text || clock_timestamp()::text || random()::text),
    f.titre,
    f.categorie_id,
    f.date,
    f.chapo,
    f.epinglee,
    f.page_liee_id
  FROM "fiches" f
  WHERE f.type = 'actualites' AND f._status = 'published' AND f.page_id IS NOT NULL;
  `)

  await db.execute(sql`
  ALTER TABLE "fiches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fiches_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fiches_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fiches_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fiches" CASCADE;
  DROP TABLE "fiches_rels" CASCADE;
  DROP TABLE "_fiches_v" CASCADE;
  DROP TABLE "_fiches_v_rels" CASCADE;
  -- IF EXISTS (retouche) : le DROP TABLE "fiches" CASCADE ci-dessus emporte
  -- déjà cette contrainte, le DROP généré échouait sur un retour arrière réel.
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_fiches_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_fiches_id_idx";
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_lien_document_id_pages_id_fk" FOREIGN KEY ("lien_document_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_lien_document_id_pages_id_fk" FOREIGN KEY ("lien_document_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_liste_items_actualites_order_idx" ON "pages_liste_items_actualites" USING btree ("_order");
  CREATE INDEX "pages_liste_items_actualites_parent_id_idx" ON "pages_liste_items_actualites" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_actualites_categorie_idx" ON "pages_liste_items_actualites" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_actualites_lien_document_idx" ON "pages_liste_items_actualites" USING btree ("lien_document_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_order_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_actualites_parent_id_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_categorie_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_lien_document_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("lien_document_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fiches_id";
  DROP TYPE "public"."enum_fiches_type";
  DROP TYPE "public"."enum_fiches_status";
  DROP TYPE "public"."enum__fiches_v_version_type";
  DROP TYPE "public"."enum__fiches_v_version_status";`)
}
