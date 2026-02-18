// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { memo, useEffect, useMemo, useState } from 'react';
import xxhash from 'xxhash-wasm';
import { qrcode } from './qrcode';
import { createImgSize } from './util';
import { DisplayWrapper } from './Wrappers';
import type React from 'react';
import type { DisplayProps } from './types';

const getDataUrl = (value: Uint8Array): string => {
  const qr = qrcode(0, 'M');
  // Cast hack because QR library expects strings, but internally supports byte mode.
  qr.addData(value as unknown as string, 'Byte');
  qr.make();
  return qr.createDataURL(16, 0);
};

const Display = ({
  className = '',
  size,
  style = {},
  value,
}: DisplayProps): React.ReactElement | null => {
  const [image, setImage] = useState<string | null>(null);
  const [valueHash, setValueHash] = useState<string | null>(null);
  const containerStyle = useMemo(() => createImgSize(size), [size]);

  // Generate QR code when value changes.
  useEffect(() => {
    let cancelled = false;
    xxhash().then(({ h64 }) => {
      const hash = h64(value.toString()).toString();
      if (!cancelled && hash !== valueHash) {
        setImage(getDataUrl(value));
        setValueHash(hash);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, valueHash]);

  if (!image) {
    return null;
  }

  return (
    <DisplayWrapper className={className} style={containerStyle}>
      <div className="ui--qr-Display" style={style}>
        <img src={image} alt="QR code" />
      </div>
    </DisplayWrapper>
  );
};

export const QrDisplay = memo(Display);
