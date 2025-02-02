// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
  onValueChange: (val: string) => void;
}
