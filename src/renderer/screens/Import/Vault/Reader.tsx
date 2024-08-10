// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { QRVieweraWrapper } from '../Wrappers';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { checkValidAddress } from '@/renderer/Utils';
import { Html5QrCodePlugin } from '@/renderer/library/QRCode/Scan';
import { createImgSize } from '@/renderer/library/QRCode/util';
import { ScanWrapper } from '@/renderer/library/QRCode/Wrappers';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import { useImportHandler } from '@/renderer/contexts/import/ImportHandler';
import type { Html5Qrcode } from 'html5-qrcode';
import type { ReaderVaultProps } from '../types';

export const Reader = ({ addresses }: ReaderVaultProps) => {
  const { setStatus: setOverlayStatus } = useOverlay();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();
  const { isAlreadyImported } = useAddresses();

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
    const isValid = checkValidAddress(maybeAddress);
    const isImported = isAlreadyImported(maybeAddress);

    const newFeedback = isValid
      ? isImported
        ? 'Account Already Added'
        : 'Address Received'
      : 'Invalid Address';

    setFeedback(newFeedback);

    // Import address if it's valid.
    if (isValid && !isImported) {
      stopHtml5QrCode();
      await handleVaultImport(maybeAddress);
    }
  };

  // Handle new vault address to local storage and close overlay.
  const handleVaultImport = async (address: string) => {
    const accountName = ellipsisFn(address);

    insertAccountStatus(address, 'vault');
    await handleImportAddress(address, 'vault', accountName);
    setImported(true);
  };

  // Gets the next non-imported address index.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index || 0 + 1;

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
    <QRVieweraWrapper>
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
