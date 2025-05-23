// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';

export interface CopyButtonProps {
  theme: AnyData;
  onCopyClick: () => Promise<void>;
  defaultText?: string;
  clickedText?: string;
  iconFontSize?: string;
}
