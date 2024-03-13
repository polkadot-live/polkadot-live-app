// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn, unescape } from '@w3ux/utils';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { Confirm } from '../Addresses/Confirm';
import { Remove } from '../Addresses/Remove';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { ConfigRenderer } from '@/config/ConfigRenderer';
import type { LedgerAddressProps } from '../types';
import type { LedgerLocalAddress } from '@/types/accounts';

export const Address = ({
  address,
  setAddresses,
  index,
  isImported,
}: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();

  /**
   * Store the current name of the address.
   */
  const initialName = () => {
    const defaultName = ellipsisFn(address);
    const stored = localStorage.getItem(ConfigRenderer.getStorageKey('ledger'));

    // Return shortened address if no storage found.
    if (!stored) {
      return defaultName;
    }

    // Parse fetched addresses and see if this address has a custom name.
    const parsed: LedgerLocalAddress[] = JSON.parse(stored);

    const localAddress = parsed.find(
      (i: LedgerLocalAddress) => i.address === address
    );

    return localAddress?.name ? unescape(localAddress.name) : defaultName;
  };

  const [name, setName] = useState<string>(initialName());

  /**
   * Handler to rename an account.
   */
  const renameHandler = (who: string, value: string) => {
    setName(value);
    renameLocalAccount(who, value);
  };

  /**
   * Called in the rename handler parent function.
   */
  const renameLocalAccount = (who: string, newName: string) => {
    const storageKey = ConfigRenderer.getStorageKey('ledger');

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
      initial={initialName()}
      Identicon={<Identicon value={address} size={40} />}
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
            name={name}
            source="ledger"
          />,
          'small'
        )
      }
      disableEditIfImported
      t={{
        tRemove: 'Remove',
        tImport: 'Import',
      }}
    />
  );
};
