// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { QRVieweraWrapper } from '../Wrappers';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { Config as ConfigImport } from '@/config/processes/import';
import { checkValidAddress } from '@/renderer/Utils';
import { Html5QrCodePlugin } from '@/renderer/library/QRCode/Scan';
import { createImgSize } from '@/renderer/library/QRCode/util';
import { ScanWrapper } from '@/renderer/library/QRCode/Wrappers';
import type { Html5Qrcode } from 'html5-qrcode';
import type { LocalAddress } from '@/types/accounts';
import type { ReaderVaultProps } from '../types';
import { useImportHandler } from '@/renderer/contexts/import/ImportHandler';

export const Reader = ({ addresses, setAddresses }: ReaderVaultProps) => {
  const { setStatus: setOverlayStatus } = useOverlay();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

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

  const vaultAddressExists = (address: string) =>
    addresses.find((a: LocalAddress) => a.address === address);

  const stopHtml5QrCode = () => {
    if (html5QrCodeRef.current !== null) {
      html5QrCodeRef.current.stop().catch(console.error);
      console.log('stopped qr code scanner');
    }
  };

  // Update QR feedback on QR data change.
  const handleQrData = (signature: string) => {
    if (imported) {
      return;
    }

    const maybeAddress = signature.split(':')?.[1];

    const newFeedback =
      maybeAddress === undefined
        ? 'Waiting for QR Code'
        : checkValidAddress(maybeAddress)
          ? vaultAddressExists(maybeAddress)
            ? 'Account Already Added'
            : 'Address Received:'
          : 'Invalid Address';

    setFeedback(newFeedback);

    // Check if QR data has valid address.
    const valid =
      checkValidAddress(maybeAddress || '') &&
      !vaultAddressExists(maybeAddress || '');

    if (valid) {
      stopHtml5QrCode();
      handleVaultImport(maybeAddress);
    }
  };

  // Handle new vault address to local storage and close overlay.
  const handleVaultImport = (address: string) => {
    const accountName = ellipsisFn(address);

    const newAddresses = addresses
      .filter((a: LocalAddress) => a.address !== address)
      .concat({
        index: getNextAddressIndex(),
        address,
        isImported: false,
        name: accountName,
        source: 'vault',
      });

    const storageKey = ConfigImport.getStorageKey('vault');
    localStorage.setItem(storageKey, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    setImported(true);

    // Add account status entry.
    insertAccountStatus(address, 'vault');

    // Set processing flag to true and import via main renderer.
    handleImportAddress(address, 'vault', accountName);
  };

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

  // Close the overlay when import is successful, ignoring initial render state.
  useEffect(() => {
    if (!isInitialRender && imported) {
      setOverlayStatus(0);
    }
  }, [imported]);

  // The success callback for the QR code scan plugin.
  const onScan = (data: string | null) => {
    if (data) {
      handleQrData(data);
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
