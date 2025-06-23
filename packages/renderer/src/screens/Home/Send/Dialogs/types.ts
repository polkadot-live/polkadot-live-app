// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SendAccount } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SendRecipient } from '../types';

export interface DialogRecipientProps {
  addresses: SendAccount[];
  chainId: ChainID | null;
  recipient: SendRecipient | null;
  sender: string | null;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
}
