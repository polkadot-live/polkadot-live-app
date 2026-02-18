// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SendNativeHookInterface } from '@polkadot-live/contexts';
import type {
  AccountSource,
  ActionMeta,
  SendAccount,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';

export interface AddressWithTooltipProps {
  theme: AnyData;
  address: string;
}

export interface AccountNameWithTooltipProps {
  theme: AnyData;
  address: string;
  accountName: string;
  copyToClipboard: (text: string) => Promise<void>;
}

export interface SendProps {
  useSendNative: (
    initExtrinsic: (meta: ActionMeta) => Promise<void>,
    fetchSendAccounts: () => Promise<Map<AccountSource, SendAccount[]>>,
    getSpendableBalance: (address: string, chainId: ChainID) => Promise<string>,
  ) => SendNativeHookInterface;
  initExtrinsic: (meta: ActionMeta) => Promise<void>;
  fetchSendAccounts: () => Promise<Map<AccountSource, SendAccount[]>>;
  getSpendableBalance: (address: string, chainId: ChainID) => Promise<string>;
}

export type SendAccordionValue =
  | 'section-network'
  | 'section-sender'
  | 'section-receiver'
  | 'section-send-amount'
  | 'section-summary';

export interface SelectBoxProps {
  children: React.ReactNode;
  ariaLabel: string;
  placeholder: string;
  disabled?: boolean;
  onValueChange: (val: string) => void;
}
