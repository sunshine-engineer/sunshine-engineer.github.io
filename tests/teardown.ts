import { existsSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
export default function teardown() {
  for (const path of [
    'src/content/videos/test-player-fixture.md',
    'src/content/articles/test-draft-fixture.md',
  ]) {
    if (existsSync(path)) unlinkSync(path);
  }
  execFileSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build'],
    {
      stdio: 'inherit',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    },
  );
}
