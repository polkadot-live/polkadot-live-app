// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { Config as ConfigImport } from '@/config/processes/import';
import { ConfirmWrapper } from './Wrappers';
import { getAddressChainId } from '@/renderer/Utils';
import { Identicon } from '@/renderer/library/Identicon';
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import type { DeleteProps } from './types';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export const Delete = ({
  address,
  setAddresses,
  source,
  setSection,
}: DeleteProps) => {
  const { setStatus } = useOverlay();
  const { deleteAccountStatus } = useAccountStatuses();

  // Click handler function.
  const handleDeleteAddress = () => {
    // Remove status entry from account statuses context.
    deleteAccountStatus(address, source);

    if (source === 'vault') {
      handleDeleteVaultAddress();
    } else if (source === 'ledger') {
      handleDeleteLedgerAddress();
    } else if (source === 'read-only') {
      handleDeleteReadOnlyAddress();
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

    // Go back to import home page.
    setSection(0);

    postAddressDeleteMessage();
  };

  // Handle deletion of a vault address.
  const handleDeleteVaultAddress = () => {
    let goBack = false;

    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.filter(
        (a: LocalAddress) => a.address !== address
      );

      newAddresses.length === 0 && (goBack = true);

      localStorage.setItem(
        ConfigImport.getStorageKey(source),
        JSON.stringify(newAddresses)
      );

      return newAddresses;
    });

    postAddressDeleteMessage();

    // Go back to import home screen if no more vault addresses are imported.
    goBack && setSection(0);
  };

  // Handle deletion of a read-only address.
  const handleDeleteReadOnlyAddress = () => {
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
      task: 'renderer:address:delete',
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
