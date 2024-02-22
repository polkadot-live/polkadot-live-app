// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@/types/misc';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QRVieweraWrapper } from '../Wrappers';
import { QrScanSignature } from '@app/library/QRCode/ScanSignature';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import type { VaultAccount } from '@polkadot-cloud/react/types';
import { checkValidAddress } from '@/renderer/Utils';

export const Reader = ({ addresses, setAddresses }: AnyJson) => {
  const { addressExists } = useAddresses();
  const { setStatus: setOverlayStatus } = useOverlay();

  // Check whether initial render.
  const initialRender = useRef<boolean>(true);
  const isInitialRender = initialRender.current;
  initialRender.current = false;

  // Store QR data feedback.
  const [feedback, setFeedback] = useState<string>('');

  // Successful import
  const [imported, setImported] = useState<boolean>(false);

  const vaultAddressExists = (address: string) =>
    addresses.find((a: VaultAccount) => a.address === address);

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
          ? addressExists(maybeAddress)
            ? 'Account Already Added'
            : 'Address Received:'
          : 'Invalid Address';

    setFeedback(newFeedback);

    // Check if QR data has valid address.
    const valid = checkValidAddress(maybeAddress || '') && !addressExists(maybeAddress || '');

    if (valid) {
      handleVaultImport(maybeAddress);
    }
  };

  // Handle new vault address to local storage.
  const handleVaultImport = (address: string) => {
    const newAddresses = addresses
      .filter((a: AnyJson) => a.address !== address)
      .concat({
        index: getNextAddressIndex(),
        address,
      });
    localStorage.setItem('vault_addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    setImported(true);
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

  const onScan = useCallback(({ signature }: { signature: `0x${string}` }) => {
    handleQrData(signature);
  }, []);

  return (
    <QRVieweraWrapper>
      <div className="viewer">
        <QrScanSignature size={279} onScan={onScan} />
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