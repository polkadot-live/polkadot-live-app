// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';
import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import { getAccountName } from '@/renderer/utils/ImportUtils';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Remove } from '../Addresses/Remove';
import { useOverlay } from '@app/contexts/Overlay';
import { useState } from 'react';
import type { AddressProps } from '../Addresses/types';
import type { LocalAddress } from '@/types/accounts';

export const Address = ({
  address,
  index,
  setAddresses,
  isImported,
}: AddressProps) => {
  // State for account name.
  const [accountName, setAccountName] = useState<string>(
    getAccountName(address, 'vault')
  );

  const { openOverlayWith } = useOverlay();

  // Handler to rename an account.
  const renameHandler = (who: string, value: string) => {
    setAccountName(value);
    renameLocalAccount(who, value);
  };

  // Called in the rename handler parent function.
  const renameLocalAccount = (who: string, newName: string) => {
    const storageKey = ConfigImport.getStorageKey('vault');

    // Get vault addresses from local storage.
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return false;
    }

    const parsed: LocalAddress[] = JSON.parse(stored);

    // Update the target vault addresses with the new name.
    const updated = parsed.map((i: LocalAddress) => {
      if (i.address !== who) {
        return i;
      } else {
        return {
          ...i,
          name: newName,
        };
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <HardwareAddress
      key={index}
      address={address}
      isImported={isImported}
      index={index}
      initial={accountName}
      renameHandler={renameHandler}
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove
            setAddresses={setAddresses}
            address={address}
            source="vault"
          />,
          'small'
        )
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm
            setAddresses={setAddresses}
            address={address}
            name={accountName}
            source="vault"
          />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete
            setAddresses={setAddresses}
            address={address}
            source="vault"
          />
        )
      }
      disableEditIfImported
    />
  );
};
