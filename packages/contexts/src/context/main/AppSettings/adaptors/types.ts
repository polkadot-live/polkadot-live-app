// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { SettingKey } from '@polkadot-live/types';

export interface AppSettingsAdaptor {
  onMount: () => Promise<Map<SettingKey, boolean>>;
  onSettingToggle: (
    key: SettingKey,
    setCache: Dispatch<SetStateAction<Map<SettingKey, boolean>>>,
    cacheRef: RefObject<Map<SettingKey, boolean>>
  ) => void;
}
