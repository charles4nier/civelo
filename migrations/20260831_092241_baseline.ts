import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'admin', 'editeur');
  CREATE TYPE "public"."enum_pages_liste_items_budget_projet_nature" AS ENUM('budget', 'projet');
  CREATE TYPE "public"."enum_pages_liste_items_budget_projet_statut" AS ENUM('a-venir', 'en-cours', 'termine');
  CREATE TYPE "public"."enum_pages_blocks_intro_position_images" AS ENUM('droite', 'gauche');
  CREATE TYPE "public"."enum_pages_trombinoscope_membres_role" AS ENUM('maire', 'adjoint', 'delegue', 'conseiller');
  CREATE TYPE "public"."enum_pages_catalogue_lieux_salles_notes_type" AS ENUM('info', 'condition');
  CREATE TYPE "public"."enum_pages_numeros_utiles_urgences_couleur" AS ENUM('red', 'blue', 'muted');
  CREATE TYPE "public"."enum_pages_menu" AS ENUM('essentiel', 'mairie', 'commune', 'tourisme');
  CREATE TYPE "public"."enum_pages_gabarit" AS ENUM('liste', 'editorial', 'trombinoscope', 'catalogue-lieux', 'contact', 'numeros-utiles', 'accueil', 'horaires', 'carte-interactive');
  CREATE TYPE "public"."enum_pages_liste_layout_type" AS ENUM('annuaire', 'demarches', 'actualites', 'document', 'budget-projet', 'agenda');
  CREATE TYPE "public"."enum_categories_couleur" AS ENUM('primary', 'coral', 'leaf', 'terracotta', 'sky', 'berry', 'muted', 'sunshine');
  CREATE TYPE "public"."enum_pois_categorie" AS ENUM('hebergement', 'site-visite');
  CREATE TYPE "public"."enum_tenants_theme" AS ENUM('edito', 'app', 'accueillant');
  CREATE TYPE "public"."enum_tenants_palette" AS ENUM('defaut');
  CREATE TYPE "public"."enum_tenants_typographie" AS ENUM('defaut');
  CREATE TYPE "public"."enum_tenants_statut_contrat" AS ENUM('actif', 'suspendu', 'resilie');
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prenom" varchar NOT NULL,
  	"nom" varchar NOT NULL,
  	"photo_id" integer,
  	"role" "enum_users_role" DEFAULT 'editeur' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_liste_items_annuaire" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nom" varchar,
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
  
  CREATE TABLE "pages_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"position_images" "enum_pages_blocks_intro_position_images" DEFAULT 'droite',
  	"eyebrow" varchar,
  	"titre" varchar,
  	"corps" jsonb,
  	"image_principale_id" integer,
  	"image_secondaire1_id" integer,
  	"image_secondaire2_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_texte_centre" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"titre" varchar,
  	"corps" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_titre_colonnes_tuiles_tuiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valeur" varchar,
  	"suffixe" varchar,
  	"libelle" varchar
  );
  
  CREATE TABLE "pages_blocks_titre_colonnes_tuiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"titre" varchar,
  	"colonne_gauche" jsonb,
  	"colonne_droite" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_pleine_largeur" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_desktop_id" integer,
  	"image_mobile_id" integer,
  	"legende" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_grille_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image1_id" integer,
  	"image2_id" integer,
  	"image3_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_trombinoscope_membres_commissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nom" varchar
  );
  
  CREATE TABLE "pages_trombinoscope_membres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"fonction" varchar,
  	"role" "enum_pages_trombinoscope_membres_role",
  	"note" varchar,
  	"photo_id" integer,
  	"email" varchar
  );
  
  CREATE TABLE "pages_catalogue_lieux_salles_groupes_tarifs_lignes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"public" varchar,
  	"prix" varchar,
  	"caution" varchar
  );
  
  CREATE TABLE "pages_catalogue_lieux_salles_groupes_tarifs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "pages_catalogue_lieux_salles_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texte" varchar,
  	"type" "enum_pages_catalogue_lieux_salles_notes_type" DEFAULT 'info'
  );
  
  CREATE TABLE "pages_catalogue_lieux_salles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"description" varchar,
  	"capacite" varchar,
  	"icone_id" integer
  );
  
  CREATE TABLE "pages_numeros_utiles_urgences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"numero" varchar,
  	"label" varchar,
  	"description" varchar,
  	"couleur" "enum_pages_numeros_utiles_urgences_couleur"
  );
  
  CREATE TABLE "pages_numeros_utiles_contacts_locaux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"telephone" varchar
  );
  
  CREATE TABLE "pages_accueil_quick_access_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icone_id" integer,
  	"titre" varchar,
  	"description" varchar,
  	"lien_id" integer
  );
  
  CREATE TABLE "pages_accueil_discover_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiquette" varchar,
  	"titre" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"lien_poi_id" integer,
  	"lien_sentier_id" integer
  );
  
  CREATE TABLE "pages_horaires_fermetures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"libelle" varchar
  );
  
  CREATE TABLE "pages_horaires_contacts_pratiques" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icone_id" integer,
  	"label" varchar,
  	"nom" varchar,
  	"description" varchar,
  	"adresse" varchar,
  	"telephone" varchar,
  	"email" varchar,
  	"site_web" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"menu" "enum_pages_menu" NOT NULL,
  	"gabarit" "enum_pages_gabarit",
  	"liste_layout_type" "enum_pages_liste_layout_type",
  	"liste_cta_actif" boolean DEFAULT false,
  	"liste_cta_eyebrow" varchar,
  	"liste_cta_titre" varchar,
  	"liste_cta_description" varchar,
  	"liste_cta_email" varchar,
  	"editorial_eyebrow_text" varchar,
  	"editorial_sous_titre" varchar,
  	"trombinoscope_intro" jsonb,
  	"trombinoscope_infos_reunion" varchar,
  	"contact_description" varchar,
  	"contact_adresse" varchar,
  	"contact_telephone" varchar,
  	"contact_email" varchar,
  	"contact_site_web" varchar,
  	"contact_precision" varchar,
  	"contact_formulaire_actif" boolean DEFAULT true,
  	"accueil_hero_image_id" integer,
  	"accueil_hero_titre" varchar,
  	"accueil_hero_description" varchar,
  	"accueil_hero_bouton_principal_label" varchar,
  	"accueil_hero_bouton_principal_lien_id" integer,
  	"accueil_hero_bouton_secondaire_label" varchar,
  	"accueil_hero_bouton_secondaire_lien_id" integer,
  	"accueil_mayor_word_image_id" integer,
  	"accueil_mayor_word_citation" varchar,
  	"accueil_mayor_word_nom_signataire" varchar,
  	"accueil_mayor_word_stat_nombre" varchar,
  	"accueil_mayor_word_stat_libelle" varchar,
  	"accueil_cta_titre" varchar,
  	"accueil_cta_description" varchar,
  	"accueil_cta_bouton_label" varchar,
  	"accueil_cta_adresse" varchar,
  	"accueil_cta_telephone" varchar,
  	"accueil_cta_email" varchar,
  	"accueil_cta_site_web" varchar,
  	"horaires_lundi_matin" varchar,
  	"horaires_lundi_apres_midi" varchar,
  	"horaires_mardi_matin" varchar,
  	"horaires_mardi_apres_midi" varchar,
  	"horaires_mercredi_matin" varchar,
  	"horaires_mercredi_apres_midi" varchar,
  	"horaires_jeudi_matin" varchar,
  	"horaires_jeudi_apres_midi" varchar,
  	"horaires_vendredi_matin" varchar,
  	"horaires_vendredi_apres_midi" varchar,
  	"horaires_samedi_matin" varchar,
  	"horaires_samedi_apres_midi" varchar,
  	"horaires_dimanche_matin" varchar,
  	"horaires_dimanche_apres_midi" varchar,
  	"carte_interactive_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"nom" varchar NOT NULL,
  	"page_id" integer NOT NULL,
  	"icone_id" integer,
  	"couleur" "enum_categories_couleur",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "icones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"icone" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"titre" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "pois" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"nom" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"categorie" "enum_pois_categorie" NOT NULL,
  	"latitude" numeric NOT NULL,
  	"longitude" numeric NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sentiers_trace" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lat" numeric NOT NULL,
  	"lng" numeric NOT NULL
  );
  
  CREATE TABLE "sentiers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"nom" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"distance" varchar,
  	"duree" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"domaine" varchar NOT NULL,
  	"insee" varchar,
  	"theme" "enum_tenants_theme" DEFAULT 'edito' NOT NULL,
  	"palette" "enum_tenants_palette" DEFAULT 'defaut' NOT NULL,
  	"typographie" "enum_tenants_typographie" DEFAULT 'defaut' NOT NULL,
  	"blason_id" integer,
  	"coordonnees_adresse" varchar,
  	"coordonnees_telephone" varchar,
  	"coordonnees_courriel" varchar,
  	"coordonnees_horaires" varchar,
  	"statut_contrat" "enum_tenants_statut_contrat" DEFAULT 'actif' NOT NULL,
  	"derniere_exportation" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "identite" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"titre" varchar NOT NULL,
  	"sous_titre" varchar,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bouton_entete" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"bouton_label" varchar,
  	"bouton_lien_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"description" varchar,
  	"adresse" varchar,
  	"telephone" varchar,
  	"email" varchar,
  	"site_web" varchar,
  	"jours_ouverture" varchar,
  	"horaires" varchar,
  	"facebook" varchar,
  	"instagram" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"pages_id" integer,
  	"categories_id" integer,
  	"icones_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"pois_id" integer,
  	"sentiers_id" integer,
  	"tenants_id" integer,
  	"identite_id" integer,
  	"bouton_entete_id" integer,
  	"footer_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_annuaire" ADD CONSTRAINT "pages_liste_items_annuaire_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_demarches" ADD CONSTRAINT "pages_liste_items_demarches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_lien_document_id_pages_id_fk" FOREIGN KEY ("lien_document_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_actualites" ADD CONSTRAINT "pages_liste_items_actualites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_type_id_categories_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_document" ADD CONSTRAINT "pages_liste_items_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_budget_projet" ADD CONSTRAINT "pages_liste_items_budget_projet_fichier_id_documents_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_budget_projet" ADD CONSTRAINT "pages_liste_items_budget_projet_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_liste_items_agenda" ADD CONSTRAINT "pages_liste_items_agenda_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_liste_items_agenda" ADD CONSTRAINT "pages_liste_items_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro" ADD CONSTRAINT "pages_blocks_intro_image_principale_id_media_id_fk" FOREIGN KEY ("image_principale_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro" ADD CONSTRAINT "pages_blocks_intro_image_secondaire1_id_media_id_fk" FOREIGN KEY ("image_secondaire1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro" ADD CONSTRAINT "pages_blocks_intro_image_secondaire2_id_media_id_fk" FOREIGN KEY ("image_secondaire2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro" ADD CONSTRAINT "pages_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_texte_centre" ADD CONSTRAINT "pages_blocks_texte_centre_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_titre_colonnes_tuiles_tuiles" ADD CONSTRAINT "pages_blocks_titre_colonnes_tuiles_tuiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_titre_colonnes_tuiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_titre_colonnes_tuiles" ADD CONSTRAINT "pages_blocks_titre_colonnes_tuiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pleine_largeur" ADD CONSTRAINT "pages_blocks_image_pleine_largeur_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pleine_largeur" ADD CONSTRAINT "pages_blocks_image_pleine_largeur_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pleine_largeur" ADD CONSTRAINT "pages_blocks_image_pleine_largeur_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_grille_images" ADD CONSTRAINT "pages_blocks_grille_images_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_grille_images" ADD CONSTRAINT "pages_blocks_grille_images_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_grille_images" ADD CONSTRAINT "pages_blocks_grille_images_image3_id_media_id_fk" FOREIGN KEY ("image3_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_grille_images" ADD CONSTRAINT "pages_blocks_grille_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_trombinoscope_membres_commissions" ADD CONSTRAINT "pages_trombinoscope_membres_commissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_trombinoscope_membres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_trombinoscope_membres" ADD CONSTRAINT "pages_trombinoscope_membres_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_trombinoscope_membres" ADD CONSTRAINT "pages_trombinoscope_membres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_catalogue_lieux_salles_groupes_tarifs_lignes" ADD CONSTRAINT "pages_catalogue_lieux_salles_groupes_tarifs_lignes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_catalogue_lieux_salles_groupes_tarifs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_catalogue_lieux_salles_groupes_tarifs" ADD CONSTRAINT "pages_catalogue_lieux_salles_groupes_tarifs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_catalogue_lieux_salles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_catalogue_lieux_salles_notes" ADD CONSTRAINT "pages_catalogue_lieux_salles_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_catalogue_lieux_salles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_catalogue_lieux_salles" ADD CONSTRAINT "pages_catalogue_lieux_salles_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_catalogue_lieux_salles" ADD CONSTRAINT "pages_catalogue_lieux_salles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_numeros_utiles_urgences" ADD CONSTRAINT "pages_numeros_utiles_urgences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_numeros_utiles_contacts_locaux" ADD CONSTRAINT "pages_numeros_utiles_contacts_locaux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_accueil_quick_access_items" ADD CONSTRAINT "pages_accueil_quick_access_items_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_quick_access_items" ADD CONSTRAINT "pages_accueil_quick_access_items_lien_id_pages_id_fk" FOREIGN KEY ("lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_quick_access_items" ADD CONSTRAINT "pages_accueil_quick_access_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_accueil_discover_cards" ADD CONSTRAINT "pages_accueil_discover_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_discover_cards" ADD CONSTRAINT "pages_accueil_discover_cards_lien_poi_id_pois_id_fk" FOREIGN KEY ("lien_poi_id") REFERENCES "public"."pois"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_discover_cards" ADD CONSTRAINT "pages_accueil_discover_cards_lien_sentier_id_sentiers_id_fk" FOREIGN KEY ("lien_sentier_id") REFERENCES "public"."sentiers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_accueil_discover_cards" ADD CONSTRAINT "pages_accueil_discover_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_horaires_fermetures" ADD CONSTRAINT "pages_horaires_fermetures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_horaires_contacts_pratiques" ADD CONSTRAINT "pages_horaires_contacts_pratiques_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_horaires_contacts_pratiques" ADD CONSTRAINT "pages_horaires_contacts_pratiques_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_accueil_hero_image_id_media_id_fk" FOREIGN KEY ("accueil_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_accueil_hero_bouton_principal_lien_id_pages_id_fk" FOREIGN KEY ("accueil_hero_bouton_principal_lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_accueil_hero_bouton_secondaire_lien_id_pages_id_fk" FOREIGN KEY ("accueil_hero_bouton_secondaire_lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_accueil_mayor_word_image_id_media_id_fk" FOREIGN KEY ("accueil_mayor_word_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_icone_id_icones_id_fk" FOREIGN KEY ("icone_id") REFERENCES "public"."icones"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pois" ADD CONSTRAINT "pois_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pois" ADD CONSTRAINT "pois_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sentiers_trace" ADD CONSTRAINT "sentiers_trace_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sentiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sentiers" ADD CONSTRAINT "sentiers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sentiers" ADD CONSTRAINT "sentiers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_blason_id_media_id_fk" FOREIGN KEY ("blason_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "identite" ADD CONSTRAINT "identite_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "identite" ADD CONSTRAINT "identite_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bouton_entete" ADD CONSTRAINT "bouton_entete_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bouton_entete" ADD CONSTRAINT "bouton_entete_bouton_lien_id_pages_id_fk" FOREIGN KEY ("bouton_lien_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_icones_fk" FOREIGN KEY ("icones_id") REFERENCES "public"."icones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pois_fk" FOREIGN KEY ("pois_id") REFERENCES "public"."pois"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sentiers_fk" FOREIGN KEY ("sentiers_id") REFERENCES "public"."sentiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_identite_fk" FOREIGN KEY ("identite_id") REFERENCES "public"."identite"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bouton_entete_fk" FOREIGN KEY ("bouton_entete_id") REFERENCES "public"."bouton_entete"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footer_fk" FOREIGN KEY ("footer_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "pages_liste_items_annuaire_order_idx" ON "pages_liste_items_annuaire" USING btree ("_order");
  CREATE INDEX "pages_liste_items_annuaire_parent_id_idx" ON "pages_liste_items_annuaire" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_annuaire_categorie_idx" ON "pages_liste_items_annuaire" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_demarches_order_idx" ON "pages_liste_items_demarches" USING btree ("_order");
  CREATE INDEX "pages_liste_items_demarches_parent_id_idx" ON "pages_liste_items_demarches" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_demarches_categorie_idx" ON "pages_liste_items_demarches" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_demarches_icone_idx" ON "pages_liste_items_demarches" USING btree ("icone_id");
  CREATE INDEX "pages_liste_items_actualites_order_idx" ON "pages_liste_items_actualites" USING btree ("_order");
  CREATE INDEX "pages_liste_items_actualites_parent_id_idx" ON "pages_liste_items_actualites" USING btree ("_parent_id");
  CREATE INDEX "pages_liste_items_actualites_categorie_idx" ON "pages_liste_items_actualites" USING btree ("categorie_id");
  CREATE INDEX "pages_liste_items_actualites_lien_document_idx" ON "pages_liste_items_actualites" USING btree ("lien_document_id");
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
  CREATE INDEX "pages_blocks_intro_order_idx" ON "pages_blocks_intro" USING btree ("_order");
  CREATE INDEX "pages_blocks_intro_parent_id_idx" ON "pages_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_path_idx" ON "pages_blocks_intro" USING btree ("_path");
  CREATE INDEX "pages_blocks_intro_image_principale_idx" ON "pages_blocks_intro" USING btree ("image_principale_id");
  CREATE INDEX "pages_blocks_intro_image_secondaire1_idx" ON "pages_blocks_intro" USING btree ("image_secondaire1_id");
  CREATE INDEX "pages_blocks_intro_image_secondaire2_idx" ON "pages_blocks_intro" USING btree ("image_secondaire2_id");
  CREATE INDEX "pages_blocks_texte_centre_order_idx" ON "pages_blocks_texte_centre" USING btree ("_order");
  CREATE INDEX "pages_blocks_texte_centre_parent_id_idx" ON "pages_blocks_texte_centre" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_texte_centre_path_idx" ON "pages_blocks_texte_centre" USING btree ("_path");
  CREATE INDEX "pages_blocks_titre_colonnes_tuiles_tuiles_order_idx" ON "pages_blocks_titre_colonnes_tuiles_tuiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_titre_colonnes_tuiles_tuiles_parent_id_idx" ON "pages_blocks_titre_colonnes_tuiles_tuiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_titre_colonnes_tuiles_order_idx" ON "pages_blocks_titre_colonnes_tuiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_titre_colonnes_tuiles_parent_id_idx" ON "pages_blocks_titre_colonnes_tuiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_titre_colonnes_tuiles_path_idx" ON "pages_blocks_titre_colonnes_tuiles" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_pleine_largeur_order_idx" ON "pages_blocks_image_pleine_largeur" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_pleine_largeur_parent_id_idx" ON "pages_blocks_image_pleine_largeur" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_pleine_largeur_path_idx" ON "pages_blocks_image_pleine_largeur" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_pleine_largeur_image_desktop_idx" ON "pages_blocks_image_pleine_largeur" USING btree ("image_desktop_id");
  CREATE INDEX "pages_blocks_image_pleine_largeur_image_mobile_idx" ON "pages_blocks_image_pleine_largeur" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_grille_images_order_idx" ON "pages_blocks_grille_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_grille_images_parent_id_idx" ON "pages_blocks_grille_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_grille_images_path_idx" ON "pages_blocks_grille_images" USING btree ("_path");
  CREATE INDEX "pages_blocks_grille_images_image1_idx" ON "pages_blocks_grille_images" USING btree ("image1_id");
  CREATE INDEX "pages_blocks_grille_images_image2_idx" ON "pages_blocks_grille_images" USING btree ("image2_id");
  CREATE INDEX "pages_blocks_grille_images_image3_idx" ON "pages_blocks_grille_images" USING btree ("image3_id");
  CREATE INDEX "pages_trombinoscope_membres_commissions_order_idx" ON "pages_trombinoscope_membres_commissions" USING btree ("_order");
  CREATE INDEX "pages_trombinoscope_membres_commissions_parent_id_idx" ON "pages_trombinoscope_membres_commissions" USING btree ("_parent_id");
  CREATE INDEX "pages_trombinoscope_membres_order_idx" ON "pages_trombinoscope_membres" USING btree ("_order");
  CREATE INDEX "pages_trombinoscope_membres_parent_id_idx" ON "pages_trombinoscope_membres" USING btree ("_parent_id");
  CREATE INDEX "pages_trombinoscope_membres_photo_idx" ON "pages_trombinoscope_membres" USING btree ("photo_id");
  CREATE INDEX "pages_catalogue_lieux_salles_groupes_tarifs_lignes_order_idx" ON "pages_catalogue_lieux_salles_groupes_tarifs_lignes" USING btree ("_order");
  CREATE INDEX "pages_catalogue_lieux_salles_groupes_tarifs_lignes_parent_id_idx" ON "pages_catalogue_lieux_salles_groupes_tarifs_lignes" USING btree ("_parent_id");
  CREATE INDEX "pages_catalogue_lieux_salles_groupes_tarifs_order_idx" ON "pages_catalogue_lieux_salles_groupes_tarifs" USING btree ("_order");
  CREATE INDEX "pages_catalogue_lieux_salles_groupes_tarifs_parent_id_idx" ON "pages_catalogue_lieux_salles_groupes_tarifs" USING btree ("_parent_id");
  CREATE INDEX "pages_catalogue_lieux_salles_notes_order_idx" ON "pages_catalogue_lieux_salles_notes" USING btree ("_order");
  CREATE INDEX "pages_catalogue_lieux_salles_notes_parent_id_idx" ON "pages_catalogue_lieux_salles_notes" USING btree ("_parent_id");
  CREATE INDEX "pages_catalogue_lieux_salles_order_idx" ON "pages_catalogue_lieux_salles" USING btree ("_order");
  CREATE INDEX "pages_catalogue_lieux_salles_parent_id_idx" ON "pages_catalogue_lieux_salles" USING btree ("_parent_id");
  CREATE INDEX "pages_catalogue_lieux_salles_icone_idx" ON "pages_catalogue_lieux_salles" USING btree ("icone_id");
  CREATE INDEX "pages_numeros_utiles_urgences_order_idx" ON "pages_numeros_utiles_urgences" USING btree ("_order");
  CREATE INDEX "pages_numeros_utiles_urgences_parent_id_idx" ON "pages_numeros_utiles_urgences" USING btree ("_parent_id");
  CREATE INDEX "pages_numeros_utiles_contacts_locaux_order_idx" ON "pages_numeros_utiles_contacts_locaux" USING btree ("_order");
  CREATE INDEX "pages_numeros_utiles_contacts_locaux_parent_id_idx" ON "pages_numeros_utiles_contacts_locaux" USING btree ("_parent_id");
  CREATE INDEX "pages_accueil_quick_access_items_order_idx" ON "pages_accueil_quick_access_items" USING btree ("_order");
  CREATE INDEX "pages_accueil_quick_access_items_parent_id_idx" ON "pages_accueil_quick_access_items" USING btree ("_parent_id");
  CREATE INDEX "pages_accueil_quick_access_items_icone_idx" ON "pages_accueil_quick_access_items" USING btree ("icone_id");
  CREATE INDEX "pages_accueil_quick_access_items_lien_idx" ON "pages_accueil_quick_access_items" USING btree ("lien_id");
  CREATE INDEX "pages_accueil_discover_cards_order_idx" ON "pages_accueil_discover_cards" USING btree ("_order");
  CREATE INDEX "pages_accueil_discover_cards_parent_id_idx" ON "pages_accueil_discover_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_accueil_discover_cards_image_idx" ON "pages_accueil_discover_cards" USING btree ("image_id");
  CREATE INDEX "pages_accueil_discover_cards_lien_poi_idx" ON "pages_accueil_discover_cards" USING btree ("lien_poi_id");
  CREATE INDEX "pages_accueil_discover_cards_lien_sentier_idx" ON "pages_accueil_discover_cards" USING btree ("lien_sentier_id");
  CREATE INDEX "pages_horaires_fermetures_order_idx" ON "pages_horaires_fermetures" USING btree ("_order");
  CREATE INDEX "pages_horaires_fermetures_parent_id_idx" ON "pages_horaires_fermetures" USING btree ("_parent_id");
  CREATE INDEX "pages_horaires_contacts_pratiques_order_idx" ON "pages_horaires_contacts_pratiques" USING btree ("_order");
  CREATE INDEX "pages_horaires_contacts_pratiques_parent_id_idx" ON "pages_horaires_contacts_pratiques" USING btree ("_parent_id");
  CREATE INDEX "pages_horaires_contacts_pratiques_icone_idx" ON "pages_horaires_contacts_pratiques" USING btree ("icone_id");
  CREATE INDEX "pages__order_idx" ON "pages" USING btree ("_order");
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_accueil_hero_accueil_hero_image_idx" ON "pages" USING btree ("accueil_hero_image_id");
  CREATE INDEX "pages_accueil_hero_accueil_hero_bouton_principal_lien_idx" ON "pages" USING btree ("accueil_hero_bouton_principal_lien_id");
  CREATE INDEX "pages_accueil_hero_accueil_hero_bouton_secondaire_lien_idx" ON "pages" USING btree ("accueil_hero_bouton_secondaire_lien_id");
  CREATE INDEX "pages_accueil_mayor_word_accueil_mayor_word_image_idx" ON "pages" USING btree ("accueil_mayor_word_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_idx" ON "pages" USING btree ("tenant_id","slug");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "categories_tenant_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "categories_page_idx" ON "categories" USING btree ("page_id");
  CREATE INDEX "categories_icone_idx" ON "categories" USING btree ("icone_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "icones_updated_at_idx" ON "icones" USING btree ("updated_at");
  CREATE INDEX "icones_created_at_idx" ON "icones" USING btree ("created_at");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "documents_tenant_idx" ON "documents" USING btree ("tenant_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "pois_tenant_idx" ON "pois" USING btree ("tenant_id");
  CREATE INDEX "pois_image_idx" ON "pois" USING btree ("image_id");
  CREATE INDEX "pois_updated_at_idx" ON "pois" USING btree ("updated_at");
  CREATE INDEX "pois_created_at_idx" ON "pois" USING btree ("created_at");
  CREATE INDEX "sentiers_trace_order_idx" ON "sentiers_trace" USING btree ("_order");
  CREATE INDEX "sentiers_trace_parent_id_idx" ON "sentiers_trace" USING btree ("_parent_id");
  CREATE INDEX "sentiers_tenant_idx" ON "sentiers" USING btree ("tenant_id");
  CREATE INDEX "sentiers_image_idx" ON "sentiers" USING btree ("image_id");
  CREATE INDEX "sentiers_updated_at_idx" ON "sentiers" USING btree ("updated_at");
  CREATE INDEX "sentiers_created_at_idx" ON "sentiers" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenants_domaine_idx" ON "tenants" USING btree ("domaine");
  CREATE INDEX "tenants_blason_idx" ON "tenants" USING btree ("blason_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE UNIQUE INDEX "identite_tenant_idx" ON "identite" USING btree ("tenant_id");
  CREATE INDEX "identite_logo_idx" ON "identite" USING btree ("logo_id");
  CREATE INDEX "identite_updated_at_idx" ON "identite" USING btree ("updated_at");
  CREATE INDEX "identite_created_at_idx" ON "identite" USING btree ("created_at");
  CREATE UNIQUE INDEX "bouton_entete_tenant_idx" ON "bouton_entete" USING btree ("tenant_id");
  CREATE INDEX "bouton_entete_bouton_lien_idx" ON "bouton_entete" USING btree ("bouton_lien_id");
  CREATE INDEX "bouton_entete_updated_at_idx" ON "bouton_entete" USING btree ("updated_at");
  CREATE INDEX "bouton_entete_created_at_idx" ON "bouton_entete" USING btree ("created_at");
  CREATE UNIQUE INDEX "footer_tenant_idx" ON "footer" USING btree ("tenant_id");
  CREATE INDEX "footer_updated_at_idx" ON "footer" USING btree ("updated_at");
  CREATE INDEX "footer_created_at_idx" ON "footer" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_icones_id_idx" ON "payload_locked_documents_rels" USING btree ("icones_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_pois_id_idx" ON "payload_locked_documents_rels" USING btree ("pois_id");
  CREATE INDEX "payload_locked_documents_rels_sentiers_id_idx" ON "payload_locked_documents_rels" USING btree ("sentiers_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_identite_id_idx" ON "payload_locked_documents_rels" USING btree ("identite_id");
  CREATE INDEX "payload_locked_documents_rels_bouton_entete_id_idx" ON "payload_locked_documents_rels" USING btree ("bouton_entete_id");
  CREATE INDEX "payload_locked_documents_rels_footer_id_idx" ON "payload_locked_documents_rels" USING btree ("footer_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "pages_liste_items_annuaire" CASCADE;
  DROP TABLE "pages_liste_items_demarches" CASCADE;
  DROP TABLE "pages_liste_items_actualites" CASCADE;
  DROP TABLE "pages_liste_items_document" CASCADE;
  DROP TABLE "pages_liste_items_budget_projet" CASCADE;
  DROP TABLE "pages_liste_items_agenda" CASCADE;
  DROP TABLE "pages_blocks_intro" CASCADE;
  DROP TABLE "pages_blocks_texte_centre" CASCADE;
  DROP TABLE "pages_blocks_titre_colonnes_tuiles_tuiles" CASCADE;
  DROP TABLE "pages_blocks_titre_colonnes_tuiles" CASCADE;
  DROP TABLE "pages_blocks_image_pleine_largeur" CASCADE;
  DROP TABLE "pages_blocks_grille_images" CASCADE;
  DROP TABLE "pages_trombinoscope_membres_commissions" CASCADE;
  DROP TABLE "pages_trombinoscope_membres" CASCADE;
  DROP TABLE "pages_catalogue_lieux_salles_groupes_tarifs_lignes" CASCADE;
  DROP TABLE "pages_catalogue_lieux_salles_groupes_tarifs" CASCADE;
  DROP TABLE "pages_catalogue_lieux_salles_notes" CASCADE;
  DROP TABLE "pages_catalogue_lieux_salles" CASCADE;
  DROP TABLE "pages_numeros_utiles_urgences" CASCADE;
  DROP TABLE "pages_numeros_utiles_contacts_locaux" CASCADE;
  DROP TABLE "pages_accueil_quick_access_items" CASCADE;
  DROP TABLE "pages_accueil_discover_cards" CASCADE;
  DROP TABLE "pages_horaires_fermetures" CASCADE;
  DROP TABLE "pages_horaires_contacts_pratiques" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "icones" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "pois" CASCADE;
  DROP TABLE "sentiers_trace" CASCADE;
  DROP TABLE "sentiers" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "identite" CASCADE;
  DROP TABLE "bouton_entete" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pages_liste_items_budget_projet_nature";
  DROP TYPE "public"."enum_pages_liste_items_budget_projet_statut";
  DROP TYPE "public"."enum_pages_blocks_intro_position_images";
  DROP TYPE "public"."enum_pages_trombinoscope_membres_role";
  DROP TYPE "public"."enum_pages_catalogue_lieux_salles_notes_type";
  DROP TYPE "public"."enum_pages_numeros_utiles_urgences_couleur";
  DROP TYPE "public"."enum_pages_menu";
  DROP TYPE "public"."enum_pages_gabarit";
  DROP TYPE "public"."enum_pages_liste_layout_type";
  DROP TYPE "public"."enum_categories_couleur";
  DROP TYPE "public"."enum_pois_categorie";
  DROP TYPE "public"."enum_tenants_theme";
  DROP TYPE "public"."enum_tenants_palette";
  DROP TYPE "public"."enum_tenants_typographie";
  DROP TYPE "public"."enum_tenants_statut_contrat";`)
}
