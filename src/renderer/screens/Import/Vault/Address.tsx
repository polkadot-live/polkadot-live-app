// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn, unescape } from '@w3ux/utils';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { Confirm } from '../Addresses/Confirm';
import { Remove } from '../Addresses/Remove';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Config as ConfigImport } from '@/config/processes/import';
import type { AddressProps } from '../Addresses/types';
import type { LocalAddress } from '@/types/accounts';

export const Address = ({
  address,
  index,
  setAddresses,
  isImported,
}: AddressProps) => {
  const { openOverlayWith } = useOverlay();

  /**
   * Store the current name of the address.
   */
  const initialName = () => {
    const defaultName = ellipsisFn(address);
    const stored = localStorage.getItem(ConfigImport.getStorageKey('vault'));

    // Return shortened address if no storage found.
    if (!stored) {
      return defaultName;
    }

    // Parse fetched addresses and see if this address has a custom name.
    const parsed: LocalAddress[] = JSON.parse(stored);

    const localAddress = parsed.find(
      (i: LocalAddress) => i.address === address
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
      initial={initialName()}
      Identicon={<Identicon value={address} size={40} />}
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
            name={name}
            source="vault"
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
