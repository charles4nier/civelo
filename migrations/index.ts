import * as migration_20260831_092241_baseline from './20260831_092241_baseline';
import * as migration_20260831_092500_fk_cascade_fix from './20260831_092500_fk_cascade_fix';
import * as migration_20260911_101156_ajoute_theme_classique from './20260911_101156_ajoute_theme_classique';
import * as migration_20260914_153219_renomme_theme_app_en_moderne from './20260914_153219_renomme_theme_app_en_moderne';
import * as migration_20260914_181940_cascade_suppression_tenant from './20260914_181940_cascade_suppression_tenant';
import * as migration_20260916_060953_ajoute_drafts_pages from './20260916_060953_ajoute_drafts_pages';
import * as migration_20260916_194420_ajoute_variante_tenant from './20260916_194420_ajoute_variante_tenant';
import * as migration_20260916_205500_ajoute_afficher_encart_mayor_word from './20260916_205500_ajoute_afficher_encart_mayor_word';
import * as migration_20260916_205821_ajoute_afficher_slideshow from './20260916_205821_ajoute_afficher_slideshow';

export const migrations = [
  {
    up: migration_20260831_092241_baseline.up,
    down: migration_20260831_092241_baseline.down,
    name: '20260831_092241_baseline',
  },
  {
    up: migration_20260831_092500_fk_cascade_fix.up,
    down: migration_20260831_092500_fk_cascade_fix.down,
    name: '20260831_092500_fk_cascade_fix',
  },
  {
    up: migration_20260911_101156_ajoute_theme_classique.up,
    down: migration_20260911_101156_ajoute_theme_classique.down,
    name: '20260911_101156_ajoute_theme_classique',
  },
  {
    up: migration_20260914_153219_renomme_theme_app_en_moderne.up,
    down: migration_20260914_153219_renomme_theme_app_en_moderne.down,
    name: '20260914_153219_renomme_theme_app_en_moderne',
  },
  {
    up: migration_20260914_181940_cascade_suppression_tenant.up,
    down: migration_20260914_181940_cascade_suppression_tenant.down,
    name: '20260914_181940_cascade_suppression_tenant',
  },
  {
    up: migration_20260916_060953_ajoute_drafts_pages.up,
    down: migration_20260916_060953_ajoute_drafts_pages.down,
    name: '20260916_060953_ajoute_drafts_pages',
  },
  {
    up: migration_20260916_194420_ajoute_variante_tenant.up,
    down: migration_20260916_194420_ajoute_variante_tenant.down,
    name: '20260916_194420_ajoute_variante_tenant',
  },
  {
    up: migration_20260916_205500_ajoute_afficher_encart_mayor_word.up,
    down: migration_20260916_205500_ajoute_afficher_encart_mayor_word.down,
    name: '20260916_205500_ajoute_afficher_encart_mayor_word',
  },
  {
    up: migration_20260916_205821_ajoute_afficher_slideshow.up,
    down: migration_20260916_205821_ajoute_afficher_slideshow.down,
    name: '20260916_205821_ajoute_afficher_slideshow'
  },
];
