// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanWrapper } from './Wrappers.js';
import type { ScanProps } from './types.js';
import { createImgSize } from './util.js';

// eslint-disable-next-line
const DEFAULT_DELAY = 150;

const DEFAULT_ERROR = (error: Error): void => {
  throw new Error(error.message);
};

const Scan = ({
  className = '',
  // eslint-disable-next-line
  delay = DEFAULT_DELAY,
  onError = DEFAULT_ERROR,
  onScan,
  size,
  // eslint-disable-next-line
  style = {},
}: ScanProps): React.ReactElement<ScanProps> => {
  const containerStyle = useMemo(() => createImgSize(size), [size]);

  const onErrorCallback = useCallback(
    (error: string) => onError(new Error(error)),
    [onError]
  );

  const onScanCallback = useCallback(
    (data: string | null) => data && onScan(data),
    [onScan]
  );

  return (
    <ScanWrapper className={className} style={containerStyle}>
      <Html5QrCodePlugin
        fps={10}
        disableFlip={false}
        qrCodeSuccessCallback={onScanCallback}
        qrCodeErrorCallback={onErrorCallback}
      />
    </ScanWrapper>
  );
};

export const QrScan = memo(Scan);

//----------------------------------------------------------------------
// Html5QrcodeScanner Component (TODO: Put in separate module)
//----------------------------------------------------------------------

const qrcodeRegionId = 'html5qr-code-full-region';

type Html5QrScannerProps = {
  fps: number;
  disableFlip: boolean;
  qrCodeSuccessCallback: (data: string | null) => void | '' | null;
  qrCodeErrorCallback: (error: string) => void;
};

const Html5QrCodePlugin = (props: Html5QrScannerProps) => {
  useEffect(() => {
    // Success callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw 'qrCodeSuccessCallback is required callback.';
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      { fps: 10, disableFlip: true },
      undefined
    );

    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    // Cleanup function when component will unmount.
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error('Failed to clear html5QrcodeScanner.', error);
      });
    };
  });

  return <div id={qrcodeRegionId} />;
};
