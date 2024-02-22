// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@/types/misc';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { useEffect, useState } from 'react';
import { QRVieweraWrapper } from '../Wrappers';
import { QrScanSignature } from '@app/library/QRCode/ScanSignature';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import { checkValidAddress } from '@/renderer/Utils';

export const Reader = ({ addresses, setAddresses }: AnyJson) => {
  const { addressExists } = useAddresses();
  const { setStatus: setOverlayStatus } = useOverlay();

  // Store data from QR Code scanner.
  const [qrData, setQrData] = useState<string | undefined>(undefined);

  // Store QR data feedback.
  const [feedback, setFeedback] = useState<string>('');

  // Gets the address from received QR data, or an empty string.
  const handleQrData = (signature: string) => {
    setQrData(signature.split(':')?.[1] || '');
  };

  // Handle new vault address to local storage.
  const handleVaultImport = () => {
    const newAddresses = addresses
      .filter((a: AnyJson) => a.address !== qrData)
      .concat({
        index: getNextAddressIndex(),
        address: qrData,
      });
    localStorage.setItem('vault_addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

  // Check if QR data has valid address.
  const valid = checkValidAddress(qrData || '') && !addressExists(qrData || '');

  // Reset QR data on open.
  useEffect(() => {
    setQrData(undefined);
  }, []);

  // Update QR feedback on QR data change.
  useEffect(() => {
    const newFeedback =
      qrData === undefined
        ? 'Waiting for QR Code'
        : checkValidAddress(qrData)
          ? addressExists(qrData)
            ? 'Account Already Added'
            : 'Address Received:'
          : 'Invalid Address';

    setFeedback(newFeedback);

    if (valid) {
      handleVaultImport();
      setOverlayStatus(0);
    }
  }, [qrData]);

  return (
    <QRVieweraWrapper>
      <div className="viewer">
        <QrScanSignature
          size={279}
          onScan={({ signature }) => {
            handleQrData(signature);
          }}
        />
      </div>
      <div className="foot">
        <h4>{feedback}</h4>
        <div>
          <ButtonSecondary
            text={'Cancel'}
            onClick={() => setOverlayStatus(0)}
          />
        </div>
      </div>
    </QRVieweraWrapper>
  );
};
