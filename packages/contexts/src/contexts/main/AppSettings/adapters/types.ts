// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SettingKey } from '@polkadot-live/types';
import type { Dispatch, RefObject, SetStateAction } from 'react';

export interface AppSettingsAdapter {
  onMount: () => Promise<Map<SettingKey, boolean>>;
  onSettingToggle: (
    key: SettingKey,
    setCache: Dispatch<SetStateAction<Map<SettingKey, boolean>>>,
    cacheRef: RefObject<Map<SettingKey, boolean>>,
  ) => void;
}
