// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import axios from 'axios';

export interface LatestVersionCache {
  version: string;
  checkedAt: number;
  etag?: string;
  lastModified?: string;
}

export const fetchLatestVersion = async (
  url: string,
  getCache: () => Promise<LatestVersionCache | null>,
  setCache: (c: LatestVersionCache) => Promise<void>,
  force = false,
): Promise<LatestVersionCache | null> => {
  const cache = await getCache();
  const now = Date.now();

  // Respect 24-hour TTL unless forced.
  if (!force && cache && now - cache.checkedAt < 24 * 60 * 60 * 1000) {
    return cache;
  }

  const headers: Record<string, string> = {};
  if (cache?.etag) headers['If-None-Match'] = cache.etag;
  else if (cache?.lastModified)
    headers['If-Modified-Since'] = cache.lastModified;

  try {
    const resp = await axios.get(url, {
      headers,
      // Allow handling 200 and 304 manually.
      validateStatus: (s) => s === 200 || s === 304,
      timeout: 10_000,
    });

    if (resp.status === 304) {
      // Not modified — update checkedAt and persist.
      const updated = { ...(cache as LatestVersionCache), checkedAt: now };
      await setCache(updated);
      return updated;
    }

    // 200 OK — parse body (expects JSON like { version: 'x.y.z' }).
    const body = resp.data;
    if (!body || typeof body.version !== 'string') {
      throw new Error('Invalid version payload');
    }

    const newCache: LatestVersionCache = {
      version: body.version,
      checkedAt: now,
    };

    if (resp.headers.etag) newCache.etag = resp.headers.etag;
    if (resp.headers['last-modified'])
      newCache.lastModified = resp.headers['last-modified'];

    await setCache(newCache);
    return newCache;
  } catch (err) {
    console.error(err);
    return cache;
  }
};

/**
 * Return true if `candidate` is a newer version than `current`.
 * Handles simple prerelease tags like `-beta` or `-rc.1`.
 */
export const isNewer = (current: string, candidate: string): boolean => {
  if (!isValidSemver(current) || !isValidSemver(candidate)) {
    return false;
  }
  if (current === candidate) return false;

  const [cm, cp = ''] = current.split('-', 2);
  const [nm, np = ''] = candidate.split('-', 2);

  const pa = cm.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = nm.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const ca = pa[i] || 0;
    const na = pb[i] || 0;
    if (na > ca) return true;
    if (na < ca) return false;
  }

  // Numeric parts equal -> handle prerelease: absence > presence.
  if (cp === np) return false;
  // Current is release, candidate is prerelease => candidate is older.
  if (!cp && np) return false;
  // Current is prerelease, candidate is release => candidate is newer.
  if (cp && !np) return true;

  // Both have prerelease: simple lexical compare (not full semver precedence).
  return np > cp;
};

/**
 * Validate a simple SemVer-like version string.
 *
 * Accepts `MAJOR.MINOR.PATCH` and optional pre-release suffixes
 * such as `-beta`, `-rc.1`, or dot-separated identifiers
 * (examples: "1.2.3", "1.2.3-beta.1", "0.0.1-rc").
 */
export const isValidSemver = (v: string): boolean => {
  const semverRe =
    /^(?:\d+)\.(?:\d+)\.(?:\d+)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
  return semverRe.test(v);
};
