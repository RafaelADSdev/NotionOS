import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const yarn = '.yarn/releases/yarn-4.18.0.cjs';

// Keep production assets on this origin instead of the upstream AFFiNE CDN.
const env = {
  ...process.env,
  PUBLIC_PATH: '/',
  BUILD_TYPE: 'stable',
};

// Git checkouts on hosting providers may omit .git from the build directory.
if (process.env.VERCEL_GIT_COMMIT_SHA) {
  env.GITHUB_SHA = process.env.VERCEL_GIT_COMMIT_SHA;
}

// The static app needs template assets, but not desktop/server install hooks
// or the Rust bindings used by those targets.
const steps = [
  ['packages/frontend/templates/build-edgeless.mjs'],
  ['packages/frontend/templates/build-stickers.mjs'],
  [yarn, 'affine', 'bundle', '-p', '@affine/web'],
];

for (const args of steps) {
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
