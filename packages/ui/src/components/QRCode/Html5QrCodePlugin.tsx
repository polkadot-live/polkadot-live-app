// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Html5QrScannerProps } from './types';

export const Html5QrCodePlugin = ({
  fps,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
  html5QrCode,
}: Html5QrScannerProps) => {
  // Reference of the HTML element used to scan the QR code.
  const ref = useRef<HTMLDivElement>(null);

  const divId = 'html5qr-code-full-region';

  // Load QR scanner video when component mounts and make sure to clean
  // it up when the component unmounts.
  useEffect(() => {
    html5QrCode = new Html5Qrcode(divId);

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

    const stopScanner = async () => {
      if (html5QrCode !== null) {
        await html5QrCode.stop();
        html5QrCode.clear();
        console.log('scanner stopped');
      }
    };

    // Cleanup function when component will unmount.
    return () => {
      stopScanner().catch(console.error);
    };
  }, []);

  return <div ref={ref} id={divId} />;
};
