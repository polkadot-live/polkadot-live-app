// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactElement } from 'react';
import { memo, useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanWrapper } from './Wrappers.js';
import type { ScanProps } from './types.js';
import { createImgSize } from './util.js';
import { useOverlay } from '@/renderer/contexts/Overlay';

// eslint-disable-next-line
const DEFAULT_DELAY = 150;

const DEFAULT_ERROR = (error: Error): void => {
  throw new Error(error.message);
};

// TODO: tidy up or use these unused vars.
const QrScanInner = ({
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delay = DEFAULT_DELAY,
  onError = DEFAULT_ERROR,
  onScan,
  size,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style = {},
}: ScanProps): ReactElement<ScanProps> => {
  const containerStyle = useMemo(() => createImgSize(size), [size]);

  const onErrorCallback = useCallback(
    (error: string): void => onError(new Error(error)),
    [onError]
  );

  const onScanCallback = useCallback(
    (data: string | null): void => {
      if (data) {
        onScan(data);
      }
    },
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

export const QrScan = memo(QrScanInner);

/*----------------------------------------------------------------------
 Html5Qrcode Component (TODO: Put in separate module)
 ----------------------------------------------------------------------*/

interface Html5QrScannerProps {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void;
  qrCodeErrorCallback: (error: string) => void;
}

const Html5QrCodePlugin = ({
  fps,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}: Html5QrScannerProps) => {
  const { setOnCloseOverlay } = useOverlay();

  // Store the HTML QR Code instance.
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  // Reference of the HTML element used to scan the QR code.
  const ref = useRef<HTMLDivElement>(null);

  const handleHtmlQrCode = (): void => {
    if (!ref.current) {
      return;
    }

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          html5QrCode
            ?.start(
              cameraId,
              {
                fps,
              },
              (decodedText) => {
                // do something when code is read
                qrCodeSuccessCallback(decodedText);
              },
              (errorMessage) => {
                // parse error
                qrCodeErrorCallback(errorMessage);
              }
            )
            .catch((err) => {
              console.error(err);
            });
        } else {
          // TODO: display error if no camera devices are available.
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (ref.current) {
      // Instantiate Html5Qrcode once DOM element exists
      const newHtml5QrCode = new Html5Qrcode(ref.current.id);
      setHtml5QrCode(newHtml5QrCode);

      // Stop HTML5 Qr Code when prompt closes.
      setOnCloseOverlay(() => {
        newHtml5QrCode?.stop();
      });
    }
  }, []);

  // Start QR scanner when API object is instantiated.
  useEffect(() => {
    handleHtmlQrCode();
  }, [html5QrCode]);

  return <div ref={ref} id="html5qr-code-full-region" />;
};
