import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const fixture = 'src/content/videos/test-player-fixture.md';
const draft = 'src/content/articles/test-draft-fixture.md';
export default function setup() {
  if (existsSync(fixture) || existsSync(draft))
    throw new Error(
      'Stale test fixtures exist. Remove only test-player-fixture.md and test-draft-fixture.md before rerunning.',
    );
  try {
    writeFileSync(
      fixture,
      '---\ntitle: Test player\nsummary: Test-only fixture\ndraft: false\npublished: 2026-09-21\n---\n',
    );
    const invalid = spawnSync(
      process.execPath,
      ['node_modules/astro/bin/astro.mjs', 'build'],
      {
        encoding: 'utf8',
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      },
    );
    if (
      invalid.status === 0 ||
      !((invalid.stdout ?? '') + (invalid.stderr ?? '')).includes(
        'Published videos need a YouTube video ID',
      )
    ) {
      throw new Error(
        'Expected missing published video ID to fail schema validation.\n' +
          invalid.stdout +
          invalid.stderr,
      );
    }
    writeFileSync(
      fixture,
      '---\ntitle: Test player\nsummary: Test-only fixture\ndraft: false\npublished: 2026-09-21\nyoutubeId: dQw4w9WgXcQ\nproject: agentic-demo\narticle: evidence-before-confidence\n---\n## Written summary\nA temporary fixture for player activation.\n',
    );
    writeFileSync(
      draft,
      '---\ntitle: Draft sentinel\nsummary: This must never be published\ndraft: true\npublished: 2026-09-21\n---\nDRAFT_SENTINEL_8372\n',
    );
    execFileSync(
      process.execPath,
      ['node_modules/astro/bin/astro.mjs', 'build'],
      {
        stdio: 'inherit',
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      },
    );
  } catch (error) {
    if (existsSync(fixture)) unlinkSync(fixture);
    if (existsSync(draft)) unlinkSync(draft);
    throw error;
  }
}
