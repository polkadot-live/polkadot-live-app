// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { appendOrEmpty } from '@w3ux/utils';
import type { ModalConnectItemProps } from '../types';

/**
 * @name  ModalConnectItem
 * @summary Wrapper for a modal connect item.
 */
export const ModalConnectItem = ({
  children,
  style,
  canConnect,
}: ModalConnectItemProps) => (
  <div
    className={`modal-connect-item${appendOrEmpty(canConnect, 'can-connect')}`}
    style={style}
  >
    {children}
  </div>
);
