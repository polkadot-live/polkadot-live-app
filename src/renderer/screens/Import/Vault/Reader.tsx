// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isValidAddress } from '@polkadot-cloud/utils';
import type { AnyJson } from '@/types/misc';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QRVieweraWrapper } from '../Wrappers';
import { QrScanSignature } from '@app/library/QRCode/ScanSignature';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';
import type { VaultAccount } from '@polkadot-cloud/react/types';

export const Reader = ({ addresses, setAddresses }: AnyJson) => {
  const { formatAccountSs58 } = useAddresses();
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

    setFeedback(
      maybeAddress === undefined
        ? 'Waiting for QR Code'
        : isValidAddress(maybeAddress)
          ? formatAccountSs58(maybeAddress, 0)
            ? 'Different Network Address'
            : vaultAddressExists(maybeAddress)
              ? 'Account Already Added'
              : `Address Received: ${maybeAddress}`
          : 'Invalid Address'
    );

    // Check if QR data has valid address.
    const valid =
      isValidAddress(maybeAddress || '') &&
      !vaultAddressExists(maybeAddress || '') &&
      !formatAccountSs58(maybeAddress || '', 0);

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
