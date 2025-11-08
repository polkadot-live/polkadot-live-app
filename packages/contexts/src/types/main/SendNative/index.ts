// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SendAccount, SendRecipient } from '@polkadot-live/types/accounts';

export interface SendNativeHookInterface {
  fetchingSpendable: boolean;
  progress: number;
  receiver: SendRecipient | null;
  recipientAccounts: SendAccount[];
  sendAmount: string;
  sender: SendAccount | null;
  senderAccounts: SendAccount[];
  spendable: bigint | null;
  summaryComplete: boolean;
  validAmount: boolean;
  handleProceedClick: () => Promise<void>;
  handleResetClick: () => void;
  handleSendAmountBlur: () => void;
  handleSendAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendAmountFocus: () => void;
  handleSenderChange: (senderAccount: SendAccount) => void;
  proceedDisabled: () => boolean;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setRecipientFilter: React.Dispatch<React.SetStateAction<string>>;
  setSender: React.Dispatch<React.SetStateAction<SendAccount | null>>;
}
