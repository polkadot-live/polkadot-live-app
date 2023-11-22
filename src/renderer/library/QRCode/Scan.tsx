// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
        qrCodeSuccessCallback={onScanCallback}
        qrCodeErrorCallback={onErrorCallback}
      />
    </ScanWrapper>
  );
};

export const QrScan = memo(Scan);

/*----------------------------------------------------------------------
 Html5Qrcode Component (TODO: Put in separate module)
 ----------------------------------------------------------------------*/

const qrcodeRegionId = 'html5qr-code-full-region';

type Html5QrScannerProps = {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void | '' | null;
  qrCodeErrorCallback: (error: string) => void;
};

const Html5QrCodePlugin = (props: Html5QrScannerProps) => {
  useEffect(() => {
    // Success callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw 'qrCodeSuccessCallback is required callback.';
    }

    let html5QrCode: Html5Qrcode | null = null;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          html5QrCode = new Html5Qrcode(qrcodeRegionId);
          html5QrCode
            .start(
              cameraId,
              {
                fps: props.fps,
              },
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              (decodedText, decodedResult) => {
                // do something when code is read
                props.qrCodeSuccessCallback(decodedText);
              },
              (errorMessage) => {
                // parse error
                props.qrCodeErrorCallback(errorMessage);
              }
            )
            .catch((err) => {
              // start failed
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });

    // Cleanup function when component will unmount.
    return () => {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .then(() => {
            // QR code scanning is stopped
          })
          .catch((err) => {
            // stop failed
            console.error(err);
          });
      }
    };
  });

  return <div id={qrcodeRegionId} />;
};
