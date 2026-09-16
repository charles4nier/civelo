import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

// Migration générée par `npm run migrate:create` (mode brouillon/preview,
// roadmap 2026-09-14), avec 2 lignes corrigées à la main : le générateur
// met toujours les FK `_pages_v.parent_id` → `pages` et
// `_pages_v.version_tenant_id` → `tenants` en `SET NULL` — même défaut déjà
// corrigé sur `pages`, `media`, etc. dans
// `20260914_181940_cascade_suppression_tenant.ts`. Sans ce correctif, cette
// nouvelle table d'historique de versions aurait recréé exactement le même
// problème de lignes orphelines à la suppression d'un tenant/d'une page de
// test.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_liste_items_budget_projet_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum__pages_v_version_liste_items_budget_projet_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  CREATE TYPE "public"."enum__pages_v_blocks_intro_position_images" AS ENUM('droite', 'gauche');
  CREATE TYPE "public"."enum__pages_v_version_trombinoscope_membres_role" AS ENUM('maire', 'adjoint', 'delegue', 'conseiller');
  CREATE TYPE "public"."enum__pages_v_version_catalogue_lieux_salles_notes_type" AS ENUM('info', 'condition');
  CREATE TYPE "public"."enum__pages_v_version_numeros_utiles_urgences_couleur" AS ENUM('red', 'blue', 'muted');
  CREATE TYPE "public"."enum__pages_v_version_menu" AS ENUM('essentiel', 'mairie', 'commune', 'tourisme');
  CREATE TYPE "public"."enum__pages_v_version_gabarit" AS ENUM('liste', 'editorial', 'trombinoscope', 'catalogue-lieux', 'contact', 'numeros-utiles', 'accueil', 'horaires', 'carte-interactive');
  CREATE TYPE "public"."enum__pages_v_version_liste_layout_type" AS ENUM('annuaire', 'demarches', 'actualites', 'document', 'budget-projet', 'agenda');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_pages_v_version_liste_items_annuaire" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"position_images" "enum__pages_v_blocks_intro_position_images" DEFAULT 'droite',
  	"eyebrow" varchar,
  	"titre" varchar,
  	"corps" jsonb,
  	"image_principale_id" integer,
  	"image_secondaire1_id" integer,
  	"image_secondaire2_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_texte_centre" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"titre" varchar,
  	"corps" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_titre_colonnes_tuiles_tuiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"valeur" varchar,
  	"suffixe" varchar,
  	"libelle" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_titre_colonnes_tuiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"titre" varchar,
  	"colonne_gauche" jsonb,
  	"colonne_droite" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_pleine_largeur" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_desktop_id" integer,
  	"image_mobile_id" integer,
  	"legende" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_grille_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image1_id" integer,
  	"image2_id" integer,
  	"image3_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_trombinoscope_membres_commissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_trombinoscope_membres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"fonction" varchar,
  	"role" "enum__pages_v_version_trombinoscope_membres_role",
  	"note" varchar,
  	"photo_id" integer,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"public" varchar,
  	"prix" varchar,
  	"caution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_catalogue_lieux_salles_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texte" varchar,
  	"type" "enum__pages_v_version_catalogue_lieux_salles_notes_type" DEFAULT 'info',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_catalogue_lieux_salles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"description" varchar,
  	"capacite" varchar,
  	"icone_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_numeros_utiles_urgences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"numero" varchar,
  	"label" varchar,
  	"description" varchar,
  	"couleur" "enum__pages_v_version_numeros_utiles_urgences_couleur",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_numeros_utiles_contacts_locaux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"telephone" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_accueil_quick_access_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icone_id" integer,
  	"titre" varchar,
  	"description" varchar,
  	"lien_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_accueil_discover_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"etiquette" varchar,
  	"titre" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"lien_poi_id" integer,
  	"lien_sentier_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_horaires_fermetures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"libelle" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_horaires_contacts_pratiques" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icone_id" integer,
  	"label" varchar,
  	"nom" varchar,
  	"description" varchar,
  	"adresse" varchar,
  	"telephone" varchar,
  	"email" varchar,
  	"site_web" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_menu" "enum__pages_v_version_menu",
  	"version_gabarit" "enum__pages_v_version_gabarit",
  	"version_liste_layout_type" "enum__pages_v_version_liste_layout_type",
  	"version_liste_cta_actif" boolean DEFAULT false,
  	"version_liste_cta_eyebrow" varchar,
  	"version_liste_cta_titre" varchar,
  	"version_liste_cta_description" varchar,
  	"version_liste_cta_email" varchar,
  	"version_editorial_eyebrow_text" varchar,
  	"version_editorial_sous_titre" varchar,
  	"version_trombinoscope_intro" jsonb,
  	"version_trombinoscope_infos_reunion" varchar,
  	"version_contact_description" varchar,
  	"version_contact_adresse" varchar,
  	"version_contact_telephone" varchar,
  	"version_contact_email" varchar,
  	"version_contact_site_web" varchar,
  	"version_contact_precision" varchar,
  	"version_contact_formulaire_actif" boolean DEFAULT true,
  	"version_accueil_hero_image_id" integer,
  	"version_accueil_hero_titre" varchar,
  	"version_accueil_hero_description" varchar,
  	"version_accueil_hero_bouton_principal_label" varchar,
  	"version_accueil_hero_bouton_principal_lien_id" integer,
  	"version_accueil_hero_bouton_secondaire_label" varchar,
  	"version_accueil_hero_bouton_secondaire_lien_id" integer,
  	"version_accueil_mayor_word_image_id" integer,
  	"version_accueil_mayor_word_citation" varchar,
  	"version_accueil_mayor_word_nom_signataire" varchar,
  	"version_accueil_mayor_word_stat_nombre" varchar,
  	"version_accueil_mayor_word_stat_libelle" varchar,
  	"version_accueil_cta_titre" varchar,
  	"version_accueil_cta_description" varchar,
  	"version_accueil_cta_bouton_label" varchar,
  	"version_accueil_cta_adresse" varchar,
  	"version_accueil_cta_telephone" varchar,
  	"version_accueil_cta_email" varchar,
  	"version_accueil_cta_site_web" varchar,
  	"version_horaires_lundi_matin" varchar,
  	"version_horaires_lundi_apres_midi" varchar,
  	"version_horaires_mardi_matin" varchar,
  	"version_horaires_mardi_apres_midi" varchar,
  	"version_horaires_mercredi_matin" varchar,
  	"version_horaires_mercredi_apres_midi" varchar,
  	"version_horaires_jeudi_matin" varchar,
  	"version_horaires_jeudi_apres_midi" varchar,
  	"version_horaires_vendredi_matin" varchar,
  	"version_horaires_vendredi_apres_midi" varchar,
  	"version_horaires_samedi_matin" varchar,
  	"version_horaires_samedi_apres_midi" varchar,
  	"version_horaires_dimanche_matin" varchar,
  	"version_horaires_dimanche_apres_midi" varchar,
  	"version_carte_interactive_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "pages" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "menu" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_annuaire" ADD CONSTRAINT "_pages_v_version_liste_items_annuaire_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_demarches" ADD CONSTRAINT "_pages_v_version_liste_items_demarches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_lien_document_id_pages_id_fk" FOREIGN KEY ("lien_document_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_actualites" ADD CONSTRAINT "_pages_v_version_liste_items_actualites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_type_id_categories_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_document" ADD CONSTRAINT "_pages_v_version_liste_items_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" ADD CONSTRAINT "_pages_v_version_liste_items_budget_projet_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" ADD CONSTRAINT "_pages_v_version_liste_items_budget_projet_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_agenda" ADD CONSTRAINT "_pages_v_version_liste_items_agenda_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_liste_items_agenda" ADD CONSTRAINT "_pages_v_version_liste_items_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_image_principale_id_media_id_fk" FOREIGN KEY ("image_principale_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_image_secondaire1_id_media_id_fk" FOREIGN KEY ("image_secondaire1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_image_secondaire2_id_media_id_fk" FOREIGN KEY ("image_secondaire2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro" ADD CONSTRAINT "_pages_v_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_texte_centre" ADD CONSTRAINT "_pages_v_blocks_texte_centre_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_titre_colonnes_tuiles_tuiles" ADD CONSTRAINT "_pages_v_blocks_titre_colonnes_tuiles_tuiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_titre_colonnes_tuiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_titre_colonnes_tuiles" ADD CONSTRAINT "_pages_v_blocks_titre_colonnes_tuiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pleine_largeur" ADD CONSTRAINT "_pages_v_blocks_image_pleine_largeur_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pleine_largeur" ADD CONSTRAINT "_pages_v_blocks_image_pleine_largeur_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pleine_largeur" ADD CONSTRAINT "_pages_v_blocks_image_pleine_largeur_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_grille_images" ADD CONSTRAINT "_pages_v_blocks_grille_images_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_grille_images" ADD CONSTRAINT "_pages_v_blocks_grille_images_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_grille_images" ADD CONSTRAINT "_pages_v_blocks_grille_images_image3_id_media_id_fk" FOREIGN KEY ("image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_grille_images" ADD CONSTRAINT "_pages_v_blocks_grille_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_trombinoscope_membres_commissions" ADD CONSTRAINT "_pages_v_version_trombinoscope_membres_commissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_trombinoscope_membres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_trombinoscope_membres" ADD CONSTRAINT "_pages_v_version_trombinoscope_membres_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_trombinoscope_membres" ADD CONSTRAINT "_pages_v_version_trombinoscope_membres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" ADD CONSTRAINT "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_catalogue_lieux_salles_groupes_tarifs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" ADD CONSTRAINT "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_catalogue_lieux_salles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_notes" ADD CONSTRAINT "_pages_v_version_catalogue_lieux_salles_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_catalogue_lieux_salles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles" ADD CONSTRAINT "_pages_v_version_catalogue_lieux_salles_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles" ADD CONSTRAINT "_pages_v_version_catalogue_lieux_salles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_numeros_utiles_urgences" ADD CONSTRAINT "_pages_v_version_numeros_utiles_urgences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_numeros_utiles_contacts_locaux" ADD CONSTRAINT "_pages_v_version_numeros_utiles_contacts_locaux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_quick_access_items" ADD CONSTRAINT "_pages_v_version_accueil_quick_access_items_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_quick_access_items" ADD CONSTRAINT "_pages_v_version_accueil_quick_access_items_lien_id_pages_id_fk" FOREIGN KEY ("lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_quick_access_items" ADD CONSTRAINT "_pages_v_version_accueil_quick_access_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_discover_cards" ADD CONSTRAINT "_pages_v_version_accueil_discover_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_discover_cards" ADD CONSTRAINT "_pages_v_version_accueil_discover_cards_lien_poi_id_pois_id_fk" FOREIGN KEY ("lien_poi_id") REFERENCES "public"."pois"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_discover_cards" ADD CONSTRAINT "_pages_v_version_accueil_discover_cards_lien_sentier_id_sentiers_id_fk" FOREIGN KEY ("lien_sentier_id") REFERENCES "public"."sentiers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_accueil_discover_cards" ADD CONSTRAINT "_pages_v_version_accueil_discover_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_horaires_fermetures" ADD CONSTRAINT "_pages_v_version_horaires_fermetures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_horaires_contacts_pratiques" ADD CONSTRAINT "_pages_v_version_horaires_contacts_pratiques_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_horaires_contacts_pratiques" ADD CONSTRAINT "_pages_v_version_horaires_contacts_pratiques_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_accueil_hero_image_id_media_id_fk" FOREIGN KEY ("version_accueil_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_accueil_hero_bouton_principal_lien_id_pages_id_fk" FOREIGN KEY ("version_accueil_hero_bouton_principal_lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_accueil_hero_bouton_secondaire_lien_id_pages_id_fk" FOREIGN KEY ("version_accueil_hero_bouton_secondaire_lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_accueil_mayor_word_image_id_media_id_fk" FOREIGN KEY ("version_accueil_mayor_word_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_pages_v_version_liste_items_annuaire_order_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_parent_id_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_annuaire_categorie_idx" ON "_pages_v_version_liste_items_annuaire" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_order_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_demarches_parent_id_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_categorie_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_demarches_icone_idx" ON "_pages_v_version_liste_items_demarches" USING btree ("icone_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_order_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_actualites_parent_id_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_categorie_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_version_liste_items_actualites_lien_document_idx" ON "_pages_v_version_liste_items_actualites" USING btree ("lien_document_id");
  CREATE INDEX "_pages_v_version_liste_items_document_order_idx" ON "_pages_v_version_liste_items_document" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_document_parent_id_idx" ON "_pages_v_version_liste_items_document" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_document_type_idx" ON "_pages_v_version_liste_items_document" USING btree ("type_id");
  CREATE INDEX "_pages_v_version_liste_items_document_fichier_idx" ON "_pages_v_version_liste_items_document" USING btree ("fichier_id");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_order_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_parent_id_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_budget_projet_fichier_idx" ON "_pages_v_version_liste_items_budget_projet" USING btree ("fichier_id");
  CREATE INDEX "_pages_v_version_liste_items_agenda_order_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("_order");
  CREATE INDEX "_pages_v_version_liste_items_agenda_parent_id_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_liste_items_agenda_categorie_idx" ON "_pages_v_version_liste_items_agenda" USING btree ("categorie_id");
  CREATE INDEX "_pages_v_blocks_intro_order_idx" ON "_pages_v_blocks_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_parent_id_idx" ON "_pages_v_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_path_idx" ON "_pages_v_blocks_intro" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_intro_image_principale_idx" ON "_pages_v_blocks_intro" USING btree ("image_principale_id");
  CREATE INDEX "_pages_v_blocks_intro_image_secondaire1_idx" ON "_pages_v_blocks_intro" USING btree ("image_secondaire1_id");
  CREATE INDEX "_pages_v_blocks_intro_image_secondaire2_idx" ON "_pages_v_blocks_intro" USING btree ("image_secondaire2_id");
  CREATE INDEX "_pages_v_blocks_texte_centre_order_idx" ON "_pages_v_blocks_texte_centre" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_texte_centre_parent_id_idx" ON "_pages_v_blocks_texte_centre" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_texte_centre_path_idx" ON "_pages_v_blocks_texte_centre" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_titre_colonnes_tuiles_tuiles_order_idx" ON "_pages_v_blocks_titre_colonnes_tuiles_tuiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_titre_colonnes_tuiles_tuiles_parent_id_idx" ON "_pages_v_blocks_titre_colonnes_tuiles_tuiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_titre_colonnes_tuiles_order_idx" ON "_pages_v_blocks_titre_colonnes_tuiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_titre_colonnes_tuiles_parent_id_idx" ON "_pages_v_blocks_titre_colonnes_tuiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_titre_colonnes_tuiles_path_idx" ON "_pages_v_blocks_titre_colonnes_tuiles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_pleine_largeur_order_idx" ON "_pages_v_blocks_image_pleine_largeur" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_pleine_largeur_parent_id_idx" ON "_pages_v_blocks_image_pleine_largeur" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_pleine_largeur_path_idx" ON "_pages_v_blocks_image_pleine_largeur" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_pleine_largeur_image_desktop_idx" ON "_pages_v_blocks_image_pleine_largeur" USING btree ("image_desktop_id");
  CREATE INDEX "_pages_v_blocks_image_pleine_largeur_image_mobile_idx" ON "_pages_v_blocks_image_pleine_largeur" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_grille_images_order_idx" ON "_pages_v_blocks_grille_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_grille_images_parent_id_idx" ON "_pages_v_blocks_grille_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_grille_images_path_idx" ON "_pages_v_blocks_grille_images" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_grille_images_image1_idx" ON "_pages_v_blocks_grille_images" USING btree ("image1_id");
  CREATE INDEX "_pages_v_blocks_grille_images_image2_idx" ON "_pages_v_blocks_grille_images" USING btree ("image2_id");
  CREATE INDEX "_pages_v_blocks_grille_images_image3_idx" ON "_pages_v_blocks_grille_images" USING btree ("image3_id");
  CREATE INDEX "_pages_v_version_trombinoscope_membres_commissions_order_idx" ON "_pages_v_version_trombinoscope_membres_commissions" USING btree ("_order");
  CREATE INDEX "_pages_v_version_trombinoscope_membres_commissions_parent_id_idx" ON "_pages_v_version_trombinoscope_membres_commissions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_trombinoscope_membres_order_idx" ON "_pages_v_version_trombinoscope_membres" USING btree ("_order");
  CREATE INDEX "_pages_v_version_trombinoscope_membres_parent_id_idx" ON "_pages_v_version_trombinoscope_membres" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_trombinoscope_membres_photo_idx" ON "_pages_v_version_trombinoscope_membres" USING btree ("photo_id");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes_order_idx" ON "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes_parent_id_idx" ON "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_order_idx" ON "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_parent_id_idx" ON "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_notes_order_idx" ON "_pages_v_version_catalogue_lieux_salles_notes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_notes_parent_id_idx" ON "_pages_v_version_catalogue_lieux_salles_notes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_order_idx" ON "_pages_v_version_catalogue_lieux_salles" USING btree ("_order");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_parent_id_idx" ON "_pages_v_version_catalogue_lieux_salles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_catalogue_lieux_salles_icone_idx" ON "_pages_v_version_catalogue_lieux_salles" USING btree ("icone_id");
  CREATE INDEX "_pages_v_version_numeros_utiles_urgences_order_idx" ON "_pages_v_version_numeros_utiles_urgences" USING btree ("_order");
  CREATE INDEX "_pages_v_version_numeros_utiles_urgences_parent_id_idx" ON "_pages_v_version_numeros_utiles_urgences" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_numeros_utiles_contacts_locaux_order_idx" ON "_pages_v_version_numeros_utiles_contacts_locaux" USING btree ("_order");
  CREATE INDEX "_pages_v_version_numeros_utiles_contacts_locaux_parent_id_idx" ON "_pages_v_version_numeros_utiles_contacts_locaux" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_accueil_quick_access_items_order_idx" ON "_pages_v_version_accueil_quick_access_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_accueil_quick_access_items_parent_id_idx" ON "_pages_v_version_accueil_quick_access_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_accueil_quick_access_items_icone_idx" ON "_pages_v_version_accueil_quick_access_items" USING btree ("icone_id");
  CREATE INDEX "_pages_v_version_accueil_quick_access_items_lien_idx" ON "_pages_v_version_accueil_quick_access_items" USING btree ("lien_id");
  CREATE INDEX "_pages_v_version_accueil_discover_cards_order_idx" ON "_pages_v_version_accueil_discover_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_version_accueil_discover_cards_parent_id_idx" ON "_pages_v_version_accueil_discover_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_accueil_discover_cards_image_idx" ON "_pages_v_version_accueil_discover_cards" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_accueil_discover_cards_lien_poi_idx" ON "_pages_v_version_accueil_discover_cards" USING btree ("lien_poi_id");
  CREATE INDEX "_pages_v_version_accueil_discover_cards_lien_sentier_idx" ON "_pages_v_version_accueil_discover_cards" USING btree ("lien_sentier_id");
  CREATE INDEX "_pages_v_version_horaires_fermetures_order_idx" ON "_pages_v_version_horaires_fermetures" USING btree ("_order");
  CREATE INDEX "_pages_v_version_horaires_fermetures_parent_id_idx" ON "_pages_v_version_horaires_fermetures" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_horaires_contacts_pratiques_order_idx" ON "_pages_v_version_horaires_contacts_pratiques" USING btree ("_order");
  CREATE INDEX "_pages_v_version_horaires_contacts_pratiques_parent_id_idx" ON "_pages_v_version_horaires_contacts_pratiques" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_horaires_contacts_pratiques_icone_idx" ON "_pages_v_version_horaires_contacts_pratiques" USING btree ("icone_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version__order_idx" ON "_pages_v" USING btree ("version__order");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_accueil_hero_version_accueil_hero_image_idx" ON "_pages_v" USING btree ("version_accueil_hero_image_id");
  CREATE INDEX "_pages_v_version_accueil_hero_version_accueil_hero_bouto_idx" ON "_pages_v" USING btree ("version_accueil_hero_bouton_principal_lien_id");
  CREATE INDEX "_pages_v_version_accueil_hero_version_accueil_hero_bou_1_idx" ON "_pages_v" USING btree ("version_accueil_hero_bouton_secondaire_lien_id");
  CREATE INDEX "_pages_v_version_accueil_mayor_word_version_accueil_mayo_idx" ON "_pages_v" USING btree ("version_accueil_mayor_word_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_idx" ON "_pages_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_pages_v_version_liste_items_annuaire" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_demarches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_actualites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_budget_projet" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_liste_items_agenda" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_texte_centre" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_titre_colonnes_tuiles_tuiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_titre_colonnes_tuiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_pleine_largeur" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_grille_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_trombinoscope_membres_commissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_trombinoscope_membres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_catalogue_lieux_salles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_numeros_utiles_urgences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_numeros_utiles_contacts_locaux" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_accueil_quick_access_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_accueil_discover_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_horaires_fermetures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_horaires_contacts_pratiques" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_pages_v_version_liste_items_annuaire" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_demarches" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_actualites" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_document" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_budget_projet" CASCADE;
  DROP TABLE "_pages_v_version_liste_items_agenda" CASCADE;
  DROP TABLE "_pages_v_blocks_intro" CASCADE;
  DROP TABLE "_pages_v_blocks_texte_centre" CASCADE;
  DROP TABLE "_pages_v_blocks_titre_colonnes_tuiles_tuiles" CASCADE;
  DROP TABLE "_pages_v_blocks_titre_colonnes_tuiles" CASCADE;
  DROP TABLE "_pages_v_blocks_image_pleine_largeur" CASCADE;
  DROP TABLE "_pages_v_blocks_grille_images" CASCADE;
  DROP TABLE "_pages_v_version_trombinoscope_membres_commissions" CASCADE;
  DROP TABLE "_pages_v_version_trombinoscope_membres" CASCADE;
  DROP TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs_lignes" CASCADE;
  DROP TABLE "_pages_v_version_catalogue_lieux_salles_groupes_tarifs" CASCADE;
  DROP TABLE "_pages_v_version_catalogue_lieux_salles_notes" CASCADE;
  DROP TABLE "_pages_v_version_catalogue_lieux_salles" CASCADE;
  DROP TABLE "_pages_v_version_numeros_utiles_urgences" CASCADE;
  DROP TABLE "_pages_v_version_numeros_utiles_contacts_locaux" CASCADE;
  DROP TABLE "_pages_v_version_accueil_quick_access_items" CASCADE;
  DROP TABLE "_pages_v_version_accueil_discover_cards" CASCADE;
  DROP TABLE "_pages_v_version_horaires_fermetures" CASCADE;
  DROP TABLE "_pages_v_version_horaires_contacts_pratiques" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP INDEX "pages__status_idx";
  ALTER TABLE "pages" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "menu" SET NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_liste_items_budget_projet_nature";
  DROP TYPE "public"."enum__pages_v_version_liste_items_budget_projet_statut";
  DROP TYPE "public"."enum__pages_v_blocks_intro_position_images";
  DROP TYPE "public"."enum__pages_v_version_trombinoscope_membres_role";
  DROP TYPE "public"."enum__pages_v_version_catalogue_lieux_salles_notes_type";
  DROP TYPE "public"."enum__pages_v_version_numeros_utiles_urgences_couleur";
  DROP TYPE "public"."enum__pages_v_version_menu";
  DROP TYPE "public"."enum__pages_v_version_gabarit";
  DROP TYPE "public"."enum__pages_v_version_liste_layout_type";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
