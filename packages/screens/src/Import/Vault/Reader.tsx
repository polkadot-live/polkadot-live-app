// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isValidAddress } from '@polkadot-live/core';
import {
  ButtonSecondary,
  createImgSize,
  Html5QrCodePlugin,
  ScanWrapper,
} from '@polkadot-live/ui';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QRVieweraWrapper } from '../Wrappers';
import type { Html5Qrcode } from 'html5-qrcode';
import type { ReaderProps } from './types';

export const Reader = ({
  handleImportAddress,
  isAlreadyImported,
  setOverlayStatus,
}: ReaderProps) => {
  // Check whether initial render.
  const initialRender = useRef<boolean>(true);
  const isInitialRender = initialRender.current;
  initialRender.current = false;

  // Store QR data feedback.
  const [feedback, setFeedback] = useState<string>('');

  // Successful import
  const [imported, setImported] = useState<boolean>(false);

  // This component needs access to the Html5Qrcode object because
  // it needs to stop the scanning process when the cancel button
  // is clicked or when a valid address is imported.
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopHtml5QrCode = () => {
    if (html5QrCodeRef.current !== null) {
      html5QrCodeRef.current.stop().catch(console.error);
      console.log('stopped qr code scanner');
    }
  };

  // Update QR feedback on QR data change.
  const handleQrData = async (signature: string) => {
    if (imported) {
      return;
    }

    const maybeAddress: string = signature.split(':')?.[1];
    const isValid = isValidAddress(maybeAddress);

    if (!isValid) {
      setFeedback('Invalid Address');
      return;
    }

    const publicKeyHex = u8aToHex(decodeAddress(maybeAddress));
    if (!isAlreadyImported(publicKeyHex)) {
      stopHtml5QrCode();
      setFeedback('Address Received');
      await handleVaultImport(publicKeyHex, maybeAddress);
    } else {
      setFeedback('Account Already Added');
    }
  };

  // Handle new vault address to local storage and close overlay.
  const handleVaultImport = async (
    _publicKeyHex: string,
    enAddress: string,
  ) => {
    await handleImportAddress(enAddress, 'vault');
    setImported(true);
  };

  // Close the overlay when import is successful, ignoring initial render state.
  useEffect(() => {
    if (!isInitialRender && imported) {
      setOverlayStatus(0);
    }
  }, [imported]);

  // The success callback for the QR code scan plugin.
  const onScan = async (data: string | null) => {
    if (data) {
      handleQrData(data).catch((err) => console.log(err));
    }
  };

  // Do not use any console logging functions for handling the error. The plugin
  // checks for a scan every frame and calls the error handler if no valid QR
  // code was found.
  const onError = (error: string) => {
    if (error) {
      return;
    }
  };

  // Close QR scanner and overlay when cancel button is clicked.
  const onCancel = () => {
    stopHtml5QrCode();
    setOverlayStatus(0);
  };

  const containerStyle = useMemo(() => createImgSize(400), []);

  return (
    <QRVieweraWrapper style={{ background: 'none !important' }}>
      <div className="viewer">
        <ScanWrapper style={containerStyle}>
          <Html5QrCodePlugin
            fps={10}
            qrCodeSuccessCallback={onScan}
            qrCodeErrorCallback={onError}
            html5QrCode={html5QrCodeRef.current}
          />
        </ScanWrapper>
      </div>
      <div className="foot">
        <h4>{feedback}</h4>
        <div>
          <ButtonSecondary text={'Cancel'} onClick={() => onCancel()} />
        </div>
      </div>
    </QRVieweraWrapper>
  );
};
