// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { Config as ConfigImport } from '@/config/processes/import';
import { ConfirmWrapper } from './Wrappers';
import { getAddressChainId } from '@/renderer/Utils';
import { Identicon } from '@/renderer/library/Identicon';
import { useOverlay } from '@/renderer/contexts/Overlay';
import type { DeleteProps } from './types';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export const Delete = ({ address, setAddresses, source }: DeleteProps) => {
  const { setStatus } = useOverlay();

  // Click handler function.
  const handleDeleteAddress = () => {
    if (source === 'vault') {
      handleDeleteVaultAddress();
    } else if (source === 'ledger') {
      handleDeleteLedgerAddress();
    }

    setStatus(0);
  };

  // Handle deletion of a ledger address.
  const handleDeleteLedgerAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LedgerLocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LedgerLocalAddress) => a.address !== address
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage();
  };

  // Handle deletion of a vault address.
  const handleDeleteVaultAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LocalAddress) => a.address !== address
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage();
  };

  // Send address data to main window to process removal.
  const postAddressDeleteMessage = () => {
    ConfigImport.portImport.postMessage({
      task: 'address:delete',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Delete Account</h3>
      <h5>{address}</h5>
      <p>
        Deleting this account will unsubscribe it from all of its events. After
        deleted, it will need to be re-imported into the application.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          text="Delete Account"
          onClick={() => handleDeleteAddress()}
        />
      </div>
    </ConfirmWrapper>
  );
};