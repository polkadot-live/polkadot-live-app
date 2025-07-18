// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import pkg from '../package.json' with { type: 'json' };
import mapWorkspaces from '@npmcli/map-workspaces';
import { resolve, matchesGlob, sep, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';

/**
 * By default, electron-builder copies each package into the output compilation entirety,
 * including the source code, tests, configuration, assets, and any other files.
 *
 * So you may get compiled app structure like this:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── src/            # Garbage. May be safely removed
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   ├── vite.config.js  # Garbage
 * │       │   ├── .env            # some sensitive config
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 *
 * To prevent this, we read the “files”
 * property from each package's package.json
 * and add all files that do not match the patterns to the exclusion list.
 *
 * This way,
 * each package independently determines which files will be included in the final compilation and which will not.
 *
 * So if `package-a` in its `package.json` describes
 * ```json
 * {
 *   "name": "package-a",
 *   "files": [
 *     "dist/**\/"
 *   ]
 * }
 * ```
 *
 * Then in the compilation only those files and `package.json` will be included:
 * ```
 * app/
 * ├── node_modules/
 * │   └── workspace-packages/
 * │       ├── package-a/
 * │       │   ├── dist/
 * │       │   │   └── index.js    # Runtime code
 * │       │   └── package.json
 * │       ├── package-b/
 * │       ├── package-c/
 * │       └── package-d/
 * ├── packages/
 * │   └── entry-point.js
 * └── package.json
 * ```
 */
export async function findFilesThatShouldBeExcluded() {
  /**
   * @type {Map<string, string>}
   */
  const workspaces = await mapWorkspaces({
    cwd: process.cwd(),
    pkg,
  });

  const allFilesToExclude = [];
  const electronPackageNames = [
    '@polkadot-live/consts',
    '@polkadot-live/core',
    '@polkadot-live/main',
    '@polkadot-live/preload',
    '@polkadot-live/renderer',
    '@polkadot-live/types',
    '@polkadot-live/ui',
  ];

  for (const [name, path] of workspaces) {
    // Copy files from electron packages only.
    if (!electronPackageNames.includes(name)) {
      continue;
    }

    const pkgPath = resolve(path, 'package.json');
    const { default: workspacePkg } = await import(pathToFileURL(pkgPath), {
      with: { type: 'json' },
    });

    // Get files property in package.json.
    let patterns = workspacePkg.files || [];
    patterns.push('package.json');
    patterns = patterns.map((p) => resolve(path, p));

    // Package files are excluded if their path doesn't match any patterns.
    let filesToExclude = getFiles(path, patterns);

    // Transform excluded paths into `!node_modules/<package-name>/<file-name>`.
    filesToExclude = filesToExclude.map((f) =>
      join('!node_modules', name, f.replace(path + sep, ''))
    );

    allFilesToExclude.push(...filesToExclude);
  }

  function getFiles(directory, patterns) {
    let results = [];
    const files = readdirSync(directory, { withFileTypes: true });

    fileLoop: for (const file of files) {
      const fileFullPath = resolve(directory, file.name);
      if (file.isDirectory()) {
        results = results.concat(getFiles(fileFullPath, patterns));
      } else {
        for (const pattern of patterns) {
          if (matchesGlob(fileFullPath, pattern)) {
            continue fileLoop;
          }
        }

        results.push(fileFullPath);
      }
    }

    return results;
  }

  return allFilesToExclude;
}

//console.log(await findFilesThatShouldBeExcluded());
