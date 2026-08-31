import * as migration_20260831_092241_baseline from './20260831_092241_baseline';
import * as migration_20260831_092500_fk_cascade_fix from './20260831_092500_fk_cascade_fix';

export const migrations = [
  {
    up: migration_20260831_092241_baseline.up,
    down: migration_20260831_092241_baseline.down,
    name: '20260831_092241_baseline'
  },
  {
    up: migration_20260831_092500_fk_cascade_fix.up,
    down: migration_20260831_092500_fk_cascade_fix.down,
    name: '20260831_092500_fk_cascade_fix'
  },
];
