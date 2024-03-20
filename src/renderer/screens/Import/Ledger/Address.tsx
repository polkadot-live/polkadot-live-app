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
import type { LedgerAddressProps } from '../types';
import type { LedgerLocalAddress } from '@/types/accounts';

export const Address = ({
  address,
  setAddresses,
  index,
  isImported,
}: LedgerAddressProps) => {
  // State for account name.
  const [accountName, setAccountName] = useState<string>(
    getAccountName(address, 'ledger')
  );

  const { openOverlayWith } = useOverlay();

  // Handler to rename an account.
  const renameHandler = (who: string, value: string) => {
    setAccountName(value);
    renameLocalAccount(who, value);
  };

  // Called in the rename handler parent function.
  const renameLocalAccount = (who: string, newName: string) => {
    const storageKey = ConfigImport.getStorageKey('ledger');

    // Get ledger addresses from local storage.
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return false;
    }

    const parsed: LedgerLocalAddress[] = JSON.parse(stored);

    // Update the target ledger addresses with the new name.
    const updated = parsed.map((i: LedgerLocalAddress) => {
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
      index={index}
      initial={accountName}
      renameHandler={renameHandler}
      isImported={isImported}
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove
            address={address}
            setAddresses={setAddresses}
            source="ledger"
          />,
          'small'
        )
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm
            address={address}
            setAddresses={setAddresses}
            name={accountName}
            source="ledger"
          />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete
            setAddresses={setAddresses}
            address={address}
            source="ledger"
          />
        )
      }
      disableEditIfImported
    />
  );
};
