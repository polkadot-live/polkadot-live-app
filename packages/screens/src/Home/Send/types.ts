// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { SendNativeHookInterface } from '@polkadot-live/contexts/types/main';

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
  useSendNative: () => SendNativeHookInterface;
}

export type SendAccordionValue =
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
