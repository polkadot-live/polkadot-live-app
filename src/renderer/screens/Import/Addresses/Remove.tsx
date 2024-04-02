// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { Config as ConfigImport } from '@/config/processes/import';
import { getAddressChainId } from '@/renderer/Utils';
import type { RemoveProps } from './types';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export const Remove = ({ address, setAddresses, source }: RemoveProps) => {
  const { setStatus } = useOverlay();

  // Click handler function.
  const handleRemoveAddress = () => {
    if (source === 'vault') {
      handleRemoveVaultAddress();
    } else if (source === 'ledger') {
      handleRemoveLedgerAddress();
    } else if (source === 'read-only') {
      console.log('TODO: handleRemoveReadOnlyAddress()');
    }

    setStatus(0);
  };

  // Handle removal of a ledger address.
  const handleRemoveLedgerAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LedgerLocalAddress[]) => {
      const newAddresses = prevState.map((a: LedgerLocalAddress) =>
        a.address === address ? { ...a, isImported: false } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow();
  };

  // Handle removal of a vault address.
  const handleRemoveVaultAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: false } : a
      );

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressToMainWindow();
  };

  // Send address data to main window to process removal.
  const postAddressToMainWindow = () => {
    ConfigImport.portImport.postMessage({
      task: 'renderer:address:remove',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Remove Account</h3>
      <h5>{address}</h5>
      <p>
        Removing this account will unsubscribe it from all of its events. After
        removal, this account will need to be re-imported to resume receiving
        events.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          text="Remove Account"
          onClick={() => handleRemoveAddress()}
        />
      </div>
    </ConfirmWrapper>
  );
};
