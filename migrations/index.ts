import * as migration_20260831_092241_baseline from './20260831_092241_baseline';
import * as migration_20260831_092500_fk_cascade_fix from './20260831_092500_fk_cascade_fix';
import * as migration_20260911_101156_ajoute_theme_classique from './20260911_101156_ajoute_theme_classique';
import * as migration_20260914_153219_renomme_theme_app_en_moderne from './20260914_153219_renomme_theme_app_en_moderne';
import * as migration_20260914_181940_cascade_suppression_tenant from './20260914_181940_cascade_suppression_tenant';
import * as migration_20260916_060953_ajoute_drafts_pages from './20260916_060953_ajoute_drafts_pages';

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
    name: '20260916_060953_ajoute_drafts_pages'
  },
];
