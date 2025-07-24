// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SendAccount } from '@polkadot-live/types/accounts';
import type { SendRecipient } from '../types';

export interface DialogSelectAccountProps {
  accounts: SendAccount[];
  accountRole: 'sender' | 'recipient';
  recipient: SendRecipient | null;
  sender: SendAccount | null;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setSender: React.Dispatch<React.SetStateAction<SendAccount | null>>;
  handleSenderChange: (senderAccount: SendAccount) => void;
  setRecipientFilter: React.Dispatch<React.SetStateAction<string>>;
}
