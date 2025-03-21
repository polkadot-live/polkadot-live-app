// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SendRecipient } from '..';

export interface DialogRecipientProps {
  addresses: (LocalAddress | LedgerLocalAddress)[];
  chainId: ChainID | null;
  recipient: SendRecipient | null;
  sender: string | null;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
}
