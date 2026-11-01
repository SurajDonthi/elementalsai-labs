// npm run review → the review copies (one self-contained file per page, with draft notes) for Suraj's review page,
// written to ai-services-gtm/labs-site/landing-pages-v2/, where pages.json and the review notes live.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const OUT = fileURLToPath(new URL('../ai-services-gtm/labs-site/landing-pages-v2/', ROOT));
const env = { ...process.env, LABS_OUT: OUT };
delete env.LABS_PROD;
for (const f of ['build.mjs', 'site.mjs']) execFileSync(process.execPath, [fileURLToPath(new URL('src/' + f, ROOT))], { env, stdio: 'inherit' });
