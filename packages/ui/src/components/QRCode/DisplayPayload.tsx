// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { memo, useMemo } from 'react';
import { QrDisplay } from './Display';
import { createSignPayload } from './util';
import type { DisplayPayloadProps } from './types';

const DisplayPayload = ({
  address,
  className,
  cmd,
  genesisHash,
  payload,
  size,
  style,
}: DisplayPayloadProps): React.ReactElement<DisplayPayloadProps> | null => {
  const data = useMemo(
    () => createSignPayload(address, cmd, payload, genesisHash),
    [address, cmd, payload, genesisHash]
  );

  if (!data) {
    return null;
  }

  return (
    <QrDisplay className={className} size={size} style={style} value={data} />
  );
};

export const QrDisplayPayload = memo(DisplayPayload);
