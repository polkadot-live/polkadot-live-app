// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';

export interface AddressWithTooltipProps {
  theme: AnyData;
  address: string;
}

export interface AccountNameWithTooltipProps {
  theme: AnyData;
  address: string;
  accountName: string;
}

export interface CopyButtonWithTooltipProps {
  theme: AnyData;
  onCopyClick: () => Promise<void>;
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
  value: string;
  disabled?: boolean;
  onValueChange: (val: string) => void;
}
