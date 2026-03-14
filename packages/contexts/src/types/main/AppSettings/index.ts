// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LatestVersionCache,
  SettingKey,
} from '@polkadot-live/types/settings';

export interface AppSettingsContextInterface {
  newReleaseRef: React.RefObject<LatestVersionCache | null>;
  cacheGet: (key: SettingKey) => boolean;
  fetchLatest: (force?: boolean) => Promise<void>;
  toggleSetting: (setting: SettingKey) => void;
  updateAvailable: () => boolean;
}
