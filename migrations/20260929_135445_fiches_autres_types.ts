import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'
import { generateNKeysBetween } from 'payload/shared'

// Décision 98 (chantier « fiches ») — après les actualités
// (`20260929_094633_fiches_actualites`), les 5 autres types de liste
// deviennent des fiches : annuaire, démarches, documents, budget/projet,
// agenda. Généré par `migrate:create`, retouché à la main :
//
// 1. Ordre : `fiches` devient réordonnable (`orderable`, champ `_order`).
//    Les fiches déjà en base (actualités) reçoivent une clé d'ordre.
// 2. Copie des données entre l'ajout des colonnes et la suppression des
//    anciens tableaux : chaque ligne devient une fiche publiée, via l'API
//    locale (mêmes hooks que l'admin, contexte `reprise` : les anciennes
//    données ne remplissent pas toutes les obligations d'une fiche neuve).
//    Correspondances : nom → titre (annuaire) ; description / résumé →
//    chapô (à défaut le titre) ; `contenu` des démarches → texte ; `type` d'un
//    document → catégorie ; `fichier` d'un document ou d'un budget → première
//    pièce jointe. L'ordre manuel des tableaux (annuaire, démarches) est
//    conservé. Seule la version PUBLIÉE des pages est reprise.
// 3. `down` recopie les fiches publiées de ces 5 types dans les anciens
//    tableaux avant de retirer les colonnes (texte complet, image et
//    pièces jointes au-delà de la première sont alors perdus).

type Ligne = Record<string, unknown> & { page_id: number; tenant_id: number | null }

const TYPES: { type: string; table: string; colonnes: string }[] = [
  { type: 'annuaire', table: 'pages_liste_items_annuaire', colonnes: 'a.nom, a.image_id, a.categorie_id, a.badge, a.description, a.adresse, a.telephone, a.email, a.site_web' },
  { type: 'demarches', table: 'pages_liste_items_demarches', colonnes: 'a.titre, a.categorie_id, a.icone_id, a.resume, a.contenu' },
  { type: 'document', table: 'pages_liste_items_document', colonnes: 'a.titre, a.type_id, a.date, a.fichier_id' },
  { type: 'budget-projet', table: 'pages_liste_items_budget_projet', colonnes: 'a.nature::text AS nature, a.titre, a.date, a.fichier_id, a.statut::text AS statut, a.description' },
  { type: 'agenda', table: 'pages_liste_items_agenda', colonnes: 'a.titre, a.categorie_id, a.date, a.horaire, a.lieu, a.description' }
]

const texte = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)
const date = (v: unknown) => (v ? new Date(String(v)).toISOString() : undefined)
const id = (v: unknown) => (v === null || v === undefined ? undefined : v)

function donnees(type: string, a: Ligne): Record<string, unknown> {
  switch (type) {
    case 'annuaire':
      return {
        titre: texte(a.nom) ?? 'Fiche',
        chapo: texte(a.description) ?? texte(a.nom) ?? 'Fiche',
        image: id(a.image_id),
        categorie: id(a.categorie_id),
        badge: texte(a.badge),
        adresse: texte(a.adresse),
        telephone: texte(a.telephone),
        email: texte(a.email),
        siteWeb: texte(a.site_web)
      }
    case 'demarches':
      return {
        titre: texte(a.titre) ?? 'Démarche',
        chapo: texte(a.resume) ?? texte(a.titre) ?? 'Démarche',
        categorie: id(a.categorie_id),
        icone: id(a.icone_id),
        contenu: a.contenu ?? undefined
      }
    case 'document':
      return {
        titre: texte(a.titre) ?? 'Document',
        chapo: texte(a.titre) ?? 'Document',
        categorie: id(a.type_id),
        date: date(a.date),
        piecesJointes: a.fichier_id ? [a.fichier_id] : []
      }
    case 'budget-projet':
      return {
        titre: texte(a.titre) ?? 'Entrée',
        chapo: texte(a.description) ?? texte(a.titre) ?? 'Entrée',
        nature: texte(a.nature) ?? 'projet',
        statut: a.nature === 'projet' ? texte(a.statut) : undefined,
        date: date(a.date),
        piecesJointes: a.fichier_id ? [a.fichier_id] : []
      }
    default:
      return {
        titre: texte(a.titre) ?? 'Événement',
        chapo: texte(a.description) ?? texte(a.titre) ?? 'Événement',
        categorie: id(a.categorie_id),
        date: date(a.date),
        horaire: texte(a.horaire),
        lieu: texte(a.lieu)
      }
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_fiches_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum_fiches_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  CREATE TYPE "public"."enum__fiches_v_version_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum__fiches_v_version_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  ALTER TABLE "fiches" ADD COLUMN "_order" varchar;
  ALTER TABLE "fiches" ADD COLUMN "horaire" varchar;
  ALTER TABLE "fiches" ADD COLUMN "lieu" varchar;
  ALTER TABLE "fiches" ADD COLUMN "badge" varchar;
  ALTER TABLE "fiches" ADD COLUMN "adresse" varchar;
  ALTER TABLE "fiches" ADD COLUMN "telephone" varchar;
  ALTER TABLE "fiches" ADD COLUMN "email" varchar;
  ALTER TABLE "fiches" ADD COLUMN "site_web" varchar;
  ALTER TABLE "fiches" ADD COLUMN "icone_id" integer;
  ALTER TABLE "fiches" ADD COLUMN "nature" "enum_fiches_nature";
  ALTER TABLE "fiches" ADD COLUMN "statut" "enum_fiches_statut";
  ALTER TABLE "_fiches_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_horaire" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_lieu" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_badge" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_adresse" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_telephone" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_email" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_site_web" varchar;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_icone_id" integer;
  ALTER TABLE "_fiches_v" ADD COLUMN "version_nature" "enum__fiches_v_version_nature";
  ALTER TABLE "_fiches_v" ADD COLUMN "version_statut" "enum__fiches_v_version_statut";
  ALTER TABLE "fiches" ADD CONSTRAINT "fiches_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fiches_v" ADD CONSTRAINT "_fiches_v_version_icone_id_icones_id_fk" FOREIGN KEY ("version_icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "fiches__order_idx" ON "fiches" USING btree ("_order");
  CREATE INDEX "fiches_icone_idx" ON "fiches" USING btree ("icone_id");
  CREATE INDEX "_fiches_v_version_version__order_idx" ON "_fiches_v" USING btree ("version__order");
  CREATE INDEX "_fiches_v_version_version_icone_idx" ON "_fiches_v" USING btree ("version_icone_id");`)

  // 1. Clés d'ordre des fiches existantes (actualités), par page puis date.
  const { rows: existantes } = await db.execute(sql`SELECT id FROM "fiches" ORDER BY page_id, date DESC NULLS LAST, id`)
  const cles = generateNKeysBetween(null, null, existantes.length)
  for (let i = 0; i < existantes.length; i++) {
    await db.execute(sql`UPDATE "fiches" SET "_order" = ${cles[i]} WHERE id = ${(existantes[i] as { id: number }).id}`)
  }

  // 2. Copie des 5 types.
  req.context = { ...req.context, reprise: true }
  for (const { type, table, colonnes } of TYPES) {
    const { rows } = await db.execute(sql.raw(`
      SELECT a._parent_id AS page_id, p.tenant_id, ${colonnes}
      FROM "${table}" a
      JOIN "pages" p ON p.id = a._parent_id
      WHERE p.gabarit = 'liste' AND p.liste_layout_type = '${type}'
      ORDER BY a._parent_id, a._order ASC
    `))
    for (const a of rows as unknown as Ligne[]) {
      const data = Object.fromEntries(Object.entries(donnees(type, a)).filter(([, v]) => v !== undefined))
      await payload.create({
        collection: 'fiches',
        overrideAccess: true,
        req,
        data: { ...data, page: a.page_id, ...(a.tenant_id ? { tenant: a.tenant_id } : {}), _status: 'published' } as never
      })
    }
    payload.logger.info(`[fiches_autres_types] ${type} : ${rows.length} ligne(s) copiée(s) en fiches.`)
  }

  await db.execute(sql`
  ALTER TABLE "pages_liste_items_annuaire" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_liste_items_demarches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_liste_items_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_liste_items_budget_projet" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_liste_items_agenda" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_demarches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_agenda" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_liste_items_annuaire" CASCADE;
  DROP TABLE "pages_liste_items_demarches" CASCADE;
  DROP TABLE "pages_liste_items_document" CASCADE;
  DROP TABLE "pages_liste_items_budget_projet" CASCADE;
  DROP TABLE "pages_liste_items_agenda" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_annuaire" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_demarches" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_document" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_budget_projet" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_agenda" CASCADE;
  DROP TYPE "public"."enum_pages_liste_items_budget_projet_nature";
  DROP TYPE "public"."enum_pages_liste_items_budget_projet_statut";
  DROP TYPE "public"."enum__pages_v_version_liste_items_budget_projet_nature";
  DROP TYPE "public"."enum__pages_v_version_liste_items_budget_projet_statut";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_liste_items_budget_projet_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum_pages_liste_items_budget_projet_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  CREATE TYPE "public"."enum__pages_v_version_liste_items_budget_projet_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum__pages_v_version_liste_items_budget_projet_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  CREATE TABLE "pages_liste_items_annuaire" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"image_id" integer,
  	"categorie_id" integer,
  	"badge" varchar,
  	"description" varchar,
  	"adresse" varchar,
  	"telephone" varchar,
  	"email" varchar,
  	"site_web" varchar
  );
  
  CREATE TABLE "pages_liste_items_demarches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"icone_id" integer,
  	"resume" varchar,
  	"contenu" jsonb
  );
  
  CREATE TABLE "pages_liste_items_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"type_id" integer,
  	"date" timestamp(3) with time zone,
  	"fichier_id" integer
  );
  
  CREATE TABLE "pages_liste_items_budget_projet" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nature" "enum_pages_liste_items_budget_projet_nature",
  	"titre" varchar,
  	"date" timestamp(3) with time zone,
  	"fichier_id" integer,
  	"statut" "enum_pages_liste_items_budget_projet_statut",
  	"description" varchar
  );
  
  CREATE TABLE "pages_liste_items_agenda" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"date" timestamp(3) with time zone,
  	"horaire" varchar,
  	"lieu" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "_pages_v_version_liste_items_annuaire" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"image_id" integer,
  	"categorie_id" integer,
  	"badge" varchar,
  	"description" varchar,
  	"adresse" varchar,
  	"telephone" varchar,
  	"email" varchar,
  	"site_web" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_liste_items_demarches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"icone_id" integer,
  	"resume" varchar,
  	"contenu" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_liste_items_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"type_id" integer,
  	"date" timestamp(3) with time zone,
  	"fichier_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_liste_items_budget_projet" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nature" "enum__pages_v_version_liste_items_budget_projet_nature",
  	"titre" varchar,
  	"date" timestamp(3) with time zone,
  	"fichier_id" integer,
  	"statut" "enum__pages_v_version_liste_items_budget_projet_statut",
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_liste_items_agenda" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar,
  	"categorie_id" integer,
  	"date" timestamp(3) with time zone,
  	"horaire" varchar,
  	"lieu" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "fiches" DROP CONSTRAINT "fiches_icone_id_icones_id_fk";
  
  ALTER TABLE "_fiches_v" DROP CONSTRAINT "_fiches_v_version_icone_id_icones_id_fk";
  
  DROP INDEX "fiches__order_idx";
  DROP INDEX "fiches_icone_idx";
  DROP INDEX "_fiches_v_version_version__order_idx";
  DROP INDEX "_fiches_v_version_version_icone_idx";
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_type_id_categories_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_budget_projet" ADD CONSTRAINT "pages_liste_items_budget_projet_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_budget_projet" ADD CONSTRAINT "pages_liste_items_budget_projet_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_agenda" ADD CONSTRAINT "pages_liste_items_agenda_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_agenda" ADD CONSTRAINT "pages_liste_items_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_type_id_categories_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" ADD CONSTRAINT "_pages_v_version_liste_items_budget_projet_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" ADD CONSTRAINT "_pages_v_version_liste_items_budget_projet_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_agenda" ADD CONSTRAINT "_pages_v_version_liste_items_agenda_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_agenda" ADD CONSTRAINT "_pages_v_version_liste_items_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_liste_items_annuaire_order_idx" ON "pages_liste_items_annuaire" USING btree ("_order");
  CREATE INDEX "pages_liste_items_annuaire_parent_id_idx" ON "pages_liste_items_annuaire" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_annuaire_image_idx" ON "pages_liste_items_annuaire" USING btree ("image_id");
  CREATE INDEX "pages_liste_items_annuaire_categorie_idx" ON "pages_liste_items_annuaire" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_demarches_order_idx" ON "pages_liste_items_demarches" USING btree ("_order");
  CREATE INDEX "pages_liste_items_demarches_parent_id_idx" ON "pages_liste_items_demarches" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_demarches_categorie_idx" ON "pages_liste_items_demarches" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_demarches_icone_idx" ON "pages_liste_items_demarches" USING btree ("icone_id");
  CREATE INDEX "pages_liste_items_document_order_idx" ON "pages_liste_items_document" USING btree ("_order");
  CREATE INDEX "pages_liste_items_document_parent_id_idx" ON "pages_liste_items_document" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_document_type_idx" ON "pages_liste_items_document" USING btree ("type_id");
  CREATE INDEX "pages_liste_items_document_fichier_idx" ON "pages_liste_items_document" USING btree ("fichier_id");
  CREATE INDEX "pages_liste_items_budget_projet_order_idx" ON "pages_liste_items_budget_projet" USING btree ("_order");
  CREATE INDEX "pages_liste_items_budget_projet_parent_id_idx" ON "pages_liste_items_budget_projet" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_budget_projet_fichier_idx" ON "pages_liste_items_budget_projet" USING btree ("fichier_id");
  CREATE INDEX "pages_liste_items_agenda_order_idx" ON "pages_liste_items_agenda" USING btree ("_order");
  CREATE INDEX "pages_liste_items_agenda_parent_id_idx" ON "pages_liste_items_agenda" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_agenda_categorie_idx" ON "pages_liste_items_agenda" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_order_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_parent_id_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_image_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_categorie_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_order_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_demarches_parent_id_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_categorie_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_icone_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("icone_id");
  CREATE INDEX "_pages_v_version_liste_items_document_order_idx" ON "_pages_v_version_liste_items_document" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_document_parent_id_idx" ON "_pages_v_version_liste_items_document" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_document_type_idx" ON "_pages_v_version_liste_items_document" USING btree ("type_id");
  CREATE INDEX "_pages_v_version_liste_items_document_fichier_idx" ON "_pages_v_version_liste_items_document" USING btree ("fichier_id");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_order_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_parent_id_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_fichier_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("fichier_id");
  CREATE INDEX "_pages_v_version_liste_items_agenda_order_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_agenda_parent_id_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_agenda_categorie_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("categorie_id");`)

  // Retour arrière : les fiches publiées de ces 5 types redeviennent des
  // lignes du tableau de leur page (texte complet, image et pièces jointes
  // au-delà de la première sont perdus : l'ancien modèle ne les avait pas).
  await db.execute(sql`
  INSERT INTO "pages_liste_items_annuaire" ("_order", "_parent_id", "id", "nom", "image_id", "categorie_id", "badge", "description", "adresse", "telephone", "email", "site_web")
  SELECT row_number() OVER (PARTITION BY f.page_id ORDER BY f._order, f.id)::int, f.page_id, md5(f.id::text || clock_timestamp()::text || random()::text),
    f.titre, f.image_id, f.categorie_id, f.badge, f.chapo, f.adresse, f.telephone, f.email, f.site_web
  FROM "fiches" f WHERE f.type = 'annuaire' AND f._status = 'published' AND f.page_id IS NOT NULL;

  INSERT INTO "pages_liste_items_demarches" ("_order", "_parent_id", "id", "titre", "categorie_id", "icone_id", "resume", "contenu")
  SELECT row_number() OVER (PARTITION BY f.page_id ORDER BY f._order, f.id)::int, f.page_id, md5(f.id::text || clock_timestamp()::text || random()::text),
    f.titre, f.categorie_id, f.icone_id, f.chapo, f.contenu
  FROM "fiches" f WHERE f.type = 'demarches' AND f._status = 'published' AND f.page_id IS NOT NULL;

  INSERT INTO "pages_liste_items_document" ("_order", "_parent_id", "id", "titre", "type_id", "date", "fichier_id")
  SELECT row_number() OVER (PARTITION BY f.page_id ORDER BY f.date DESC NULLS LAST, f.id)::int, f.page_id, md5(f.id::text || clock_timestamp()::text || random()::text),
    f.titre, f.categorie_id, f.date,
    (SELECT r.documents_id FROM "fiches_rels" r WHERE r.parent_id = f.id AND r.path = 'piecesJointes' ORDER BY r."order" LIMIT 1)
  FROM "fiches" f WHERE f.type = 'document' AND f._status = 'published' AND f.page_id IS NOT NULL;

  INSERT INTO "pages_liste_items_budget_projet" ("_order", "_parent_id", "id", "nature", "titre", "date", "fichier_id", "statut", "description")
  SELECT row_number() OVER (PARTITION BY f.page_id ORDER BY f.date DESC NULLS LAST, f.id)::int, f.page_id, md5(f.id::text || clock_timestamp()::text || random()::text),
    COALESCE(f.nature::text, 'projet')::"enum_pages_liste_items_budget_projet_nature", f.titre, f.date,
    (SELECT r.documents_id FROM "fiches_rels" r WHERE r.parent_id = f.id AND r.path = 'piecesJointes' ORDER BY r."order" LIMIT 1),
    f.statut::text::"enum_pages_liste_items_budget_projet_statut", f.chapo
  FROM "fiches" f WHERE f.type = 'budget-projet' AND f._status = 'published' AND f.page_id IS NOT NULL;

  INSERT INTO "pages_liste_items_agenda" ("_order", "_parent_id", "id", "titre", "categorie_id", "date", "horaire", "lieu", "description")
  SELECT row_number() OVER (PARTITION BY f.page_id ORDER BY f.date DESC NULLS LAST, f.id)::int, f.page_id, md5(f.id::text || clock_timestamp()::text || random()::text),
    f.titre, f.categorie_id, f.date, f.horaire, f.lieu, f.chapo
  FROM "fiches" f WHERE f.type = 'agenda' AND f._status = 'published' AND f.page_id IS NOT NULL;

  DELETE FROM "fiches" WHERE type IN ('annuaire', 'demarches', 'document', 'budget-projet', 'agenda');
  `)

  await db.execute(sql`  ALTER TABLE "fiches" DROP COLUMN "_order";
  ALTER TABLE "fiches" DROP COLUMN "horaire";
  ALTER TABLE "fiches" DROP COLUMN "lieu";
  ALTER TABLE "fiches" DROP COLUMN "badge";
  ALTER TABLE "fiches" DROP COLUMN "adresse";
  ALTER TABLE "fiches" DROP COLUMN "telephone";
  ALTER TABLE "fiches" DROP COLUMN "email";
  ALTER TABLE "fiches" DROP COLUMN "site_web";
  ALTER TABLE "fiches" DROP COLUMN "icone_id";
  ALTER TABLE "fiches" DROP COLUMN "nature";
  ALTER TABLE "fiches" DROP COLUMN "statut";
  ALTER TABLE "_fiches_v" DROP COLUMN "version__order";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_horaire";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_lieu";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_badge";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_adresse";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_telephone";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_email";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_site_web";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_icone_id";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_nature";
  ALTER TABLE "_fiches_v" DROP COLUMN "version_statut";
  DROP TYPE "public"."enum_fiches_nature";
  DROP TYPE "public"."enum_fiches_statut";
  DROP TYPE "public"."enum__fiches_v_version_nature";
  DROP TYPE "public"."enum__fiches_v_version_statut";`)
}
