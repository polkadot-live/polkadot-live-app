// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '@/renderer/types';

/**
 * @name  ModalHardwareItem
 * @summary Inner wrapper for a hardware connect item.
 */
export const ModalHardwareItem = ({ children, style }: ComponentBase) => (
  <div className={'modal-hardware-item'} style={style}>
    {children}
  </div>
);
