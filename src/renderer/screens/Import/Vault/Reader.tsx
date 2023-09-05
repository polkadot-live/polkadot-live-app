// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { QrScanSignature } from '@polkadot/react-qr';
import { ButtonSecondary } from '@polkadot-cloud/react';
import { isValidAddress } from '@polkadot-cloud/utils';
import { AnyJson } from '@polkadot-live/types';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { useEffect, useState } from 'react';
import { QRVieweraWrapper } from '../Wrappers';

export const Reader = ({ addresses, setAddresses }: AnyJson) => {
  const { formatAccountSs58, addressExists } = useAddresses();
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
  const valid =
    isValidAddress(qrData || '') &&
    !addressExists(qrData || '') &&
    !formatAccountSs58(qrData || '', 0);

  // Reset QR data on open.
  useEffect(() => {
    setQrData(undefined);
  }, []);

  // Update QR feedback on QR data change.
  useEffect(() => {
    setFeedback(
      qrData === undefined
        ? 'Waiting for QR Code'
        : isValidAddress(qrData)
        ? formatAccountSs58(qrData, 0)
          ? 'Different Network Address'
          : addressExists(qrData)
          ? 'Account Already Added'
          : 'Address Received:'
        : 'Invalid Address'
    );

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
