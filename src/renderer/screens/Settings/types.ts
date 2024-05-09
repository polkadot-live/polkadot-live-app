// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface SettingItem {
  title: string;
  enabled: boolean;
  settingType: string;
  buttonText?: string;
  buttonIcon?: IconProp;
}

export interface SettingProps {
  title: string;
  enabled: boolean;
  settingType: string;
  buttonText?: string;
  buttonIcon?: IconProp;
}
