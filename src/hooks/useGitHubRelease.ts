import { useState, useEffect, useCallback } from 'react';

export interface GitHubAssetItem {
  name: string;
  size: number;
  browser_download_url: string;
}

export interface ReleaseAssets {
  windowsExe?: GitHubAssetItem;
  windowsStandaloneExe?: GitHubAssetItem;
  windowsZip?: GitHubAssetItem;
  linuxTar?: GitHubAssetItem;
  macosZip?: GitHubAssetItem;
  checksums?: GitHubAssetItem;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  body: string;
  html_url: string;
  assets: GitHubAssetItem[];
}

export interface GitHubReleaseState {
  version: string;
  rawTag: string;
  releaseDate: string;
  releaseStage: string;
  assets: ReleaseAssets;
  releases: GitHubRelease[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const REPO_SLUG = 'EG1DOTIN/pyEGClamUI';
const CACHE_KEY = 'pyeg_gh_releases_cache';
const CACHE_TIME_KEY = 'pyeg_gh_releases_time';
const RATE_LIMIT_KEY = 'pyeg_gh_ratelimit_until';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function formatReleaseDate(isoDateString?: string): string {
  if (!isoDateString) return 'October 2026';
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return 'October 2026';
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'October 2026';
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function extractAssets(assetsList: GitHubAssetItem[]): ReleaseAssets {
  const result: ReleaseAssets = {};
  if (!Array.isArray(assetsList)) return result;

  let installerExe: GitHubAssetItem | undefined;
  let standaloneExe: GitHubAssetItem | undefined;
  let fallbackExe: GitHubAssetItem | undefined;

  assetsList.forEach((a) => {
    const name = (a.name || '').toLowerCase();
    if (name.includes('setup') && name.endsWith('.exe')) {
      installerExe = a;
    } else if (name === 'pyegclamui.exe') {
      standaloneExe = a;
    } else if (name.endsWith('.exe')) {
      fallbackExe = a;
    }

    if (name.includes('windows') && name.endsWith('.zip')) {
      result.windowsZip = a;
    }
    if ((name.includes('linux') || name.endsWith('.tar.gz') || name.endsWith('.appimage')) && !name.endsWith('.zip')) {
      result.linuxTar = a;
    }
    if ((name.includes('macos') || name.includes('darwin') || name.endsWith('.dmg') || (name.endsWith('.zip') && name.includes('mac'))) && !name.includes('windows')) {
      result.macosZip = a;
    }
    if (name.includes('sha256') || name.includes('checksum')) {
      result.checksums = a;
    }
  });

  result.windowsExe = installerExe || standaloneExe || fallbackExe;
  result.windowsStandaloneExe = standaloneExe || fallbackExe;

  return result;
}

const DEFAULT_ASSETS: ReleaseAssets = {
  windowsExe: {
    name: 'pyEGClamUI-v3.2.0-Windows-Setup.exe',
    size: 192 * 1024 * 1024,
    browser_download_url: 'https://github.com/EG1DOTIN/pyEGClamUI/releases/latest/download/pyEGClamUI-v3.2.0-Windows-Setup.exe',
  },
  windowsZip: {
    name: 'pyegclamui-v3.2.0-windows-x64.zip',
    size: 57 * 1024 * 1024,
    browser_download_url: 'https://github.com/EG1DOTIN/pyEGClamUI/releases/latest/download/pyegclamui-v3.2.0-windows-x64.zip',
  },
  linuxTar: {
    name: 'pyegclamui-v3.2.0-linux-x86_64.tar.gz',
    size: 83 * 1024 * 1024,
    browser_download_url: 'https://github.com/EG1DOTIN/pyEGClamUI/releases/latest/download/pyegclamui-v3.2.0-linux-x86_64.tar.gz',
  },
  macosZip: {
    name: 'pyegclamui-v3.2.0-macos-arm64.zip',
    size: 204 * 1024 * 1024,
    browser_download_url: 'https://github.com/EG1DOTIN/pyEGClamUI/releases/latest/download/pyegclamui-v3.2.0-macos-arm64.zip',
  },
  checksums: {
    name: 'SHA256SUMS.txt',
    size: 512,
    browser_download_url: 'https://github.com/EG1DOTIN/pyEGClamUI/releases/latest/download/SHA256SUMS.txt',
  },
};

/**
 * Shared React hook to dynamically fetch and cache latest release information
 * directly from GitHub Releases API for pyEGClamUI.
 */
export function useGitHubRelease(): GitHubReleaseState {
  const [version, setVersion] = useState<string>('3.2.0');
  const [rawTag, setRawTag] = useState<string>('v3.2.0');
  const [releaseDate, setReleaseDate] = useState<string>('October 2026');
  const [releaseStage, setReleaseStage] = useState<string>('Release');
  const [assets, setAssets] = useState<ReleaseAssets>(DEFAULT_ASSETS);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const applyReleaseData = useCallback((data: GitHubRelease[]) => {
    if (!Array.isArray(data) || data.length === 0) return;
    setReleases(data);
    const latest = data[0];
    if (latest.tag_name) {
      setRawTag(latest.tag_name);
      setVersion(latest.tag_name.replace(/^v/, ''));
    }
    if (latest.published_at) {
      setReleaseDate(formatReleaseDate(latest.published_at));
    }
    setReleaseStage(latest.prerelease ? 'Beta Release' : 'Release');

    if (Array.isArray(latest.assets) && latest.assets.length > 0) {
      const parsedAssets = extractAssets(latest.assets);
      setAssets((prev) => ({ ...prev, ...parsedAssets }));
    }
  }, []);

  const fetchReleases = useCallback(async (force = false) => {
    // 1. Check local cache (unless force = true)
    if (!force) {
      try {
        const until = localStorage.getItem(RATE_LIMIT_KEY);
        if (until && Date.now() < parseInt(until, 10)) {
          const stale = localStorage.getItem(CACHE_KEY);
          if (stale) {
            applyReleaseData(JSON.parse(stale));
          }
          setLoading(false);
          return;
        }

        const cached = localStorage.getItem(CACHE_KEY);
        const time = localStorage.getItem(CACHE_TIME_KEY);
        if (cached && time && Date.now() - parseInt(time, 10) < CACHE_TTL_MS) {
          applyReleaseData(JSON.parse(cached));
          setLoading(false);
          return;
        }
      } catch {
        // Continue to live network request
      }
    }

    // 2. Fetch live from GitHub Releases API
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_SLUG}/releases`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (response.ok) {
        const data: GitHubRelease[] = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
            localStorage.removeItem(RATE_LIMIT_KEY);
          } catch {}
          applyReleaseData(data);
        }
      } else if (response.status === 403 || response.status === 429) {
        // Enforce rate limit backoff
        try {
          localStorage.setItem(RATE_LIMIT_KEY, String(Date.now() + CACHE_TTL_MS));
          const stale = localStorage.getItem(CACHE_KEY);
          if (stale) applyReleaseData(JSON.parse(stale));
        } catch {}
      } else {
        setError(`GitHub API responded with status ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch release');
      try {
        const stale = localStorage.getItem(CACHE_KEY);
        if (stale) applyReleaseData(JSON.parse(stale));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [applyReleaseData]);

  useEffect(() => {
    fetchReleases(false);
  }, [fetchReleases]);

  const refresh = useCallback(async () => {
    await fetchReleases(true);
  }, [fetchReleases]);

  return {
    version,
    rawTag,
    releaseDate,
    releaseStage,
    assets,
    releases,
    loading,
    error,
    refresh,
  };
}
