// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '../../types';
import type { ReactNode } from 'react';

export type ActionItemProps = ComponentBase & {
  // the title.
  text: string;
  // the state of the item.
  toggled?: boolean;
  // whether the item is disabled.
  disabled?: boolean;
  // the switch action.
  onToggle?: (val: boolean) => void;
  // whether the item should be inactive.
  inactive?: boolean;
  // optional inline button.
  inlineButton?: ReactNode;
  // whether to the toggle icon.
  showIcon?: boolean;
};
