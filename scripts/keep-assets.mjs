// Fills assets-keep/ with the css/js files of past versions of the site, so Clarity can replay old visits with their styles.
// Usage: node scripts/keep-assets.mjs <commit> [<commit> ...]   (builds each commit in a temporary git worktree)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url)), KEEP = join(ROOT, 'assets-keep');
mkdirSync(KEEP, { recursive: true });
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' });

for (const commit of process.argv.slice(2)) {
  const dir = mkdtempSync(join(tmpdir(), 'labs-keep-'));
  try {
    git('worktree', 'add', '--detach', dir, commit);
    execFileSync(process.execPath, [join(dir, 'scripts/release.mjs')], { cwd: dir, stdio: 'ignore' });
    let added = 0;
    for (const n of readdirSync(join(dir, 'public/assets'))) if (/\.(css|js)$/.test(n) && !existsSync(join(KEEP, n))) { copyFileSync(join(dir, 'public/assets', n), join(KEEP, n)); added++; }
    console.log(commit, 'added', added);
  } catch (e) { console.log(commit, 'failed:', e.message.split('\n')[0]); }
  finally { try { git('worktree', 'remove', '--force', dir); } catch {} rmSync(dir, { recursive: true, force: true }); }
}
