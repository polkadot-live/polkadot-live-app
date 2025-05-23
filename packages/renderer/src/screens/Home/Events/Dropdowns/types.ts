// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EventCallback,
  TxAction,
  UriAction,
} from '@polkadot-live/types/reporter';

export interface ActionsDropdownProps {
  event: EventCallback;
  txActions: TxAction[];
  uriActions: UriAction[];
}
