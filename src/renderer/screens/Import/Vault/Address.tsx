// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn, localStorageOrDefault, unescape } from '@w3ux/utils';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { Confirm } from '../Addresses/Confirm';
import { Remove } from '../Addresses/Remove';
import type { AddressProps } from '../Addresses/types';
import type { AnyJson } from '@/types/misc';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';

export const Address = ({
  address,
  index,
  setAddresses,
  isImported,
}: AddressProps) => {
  const { openOverlayWith } = useOverlay();

  // store the current name of the address
  const initialName = () => {
    const defaultName = ellipsisFn(address);
    const localVault = localStorageOrDefault(
      'vault_addresses',
      [],
      true
    ) as AnyJson[];
    if (!localVault) {
      return defaultName;
    }
    const localAddress = localVault.find((i: AnyJson) => i.address === address);
    return localAddress?.name ? unescape(localAddress.name) : defaultName;
  };

  const [name, setName] = useState<string>(initialName());

  const renameHandler = (who: string, value: string) => {
    setName(value);
    renameLocalAccount(who, value);
  };

  const renameLocalAccount = (who: string, newName: string) => {
    let localVault = localStorageOrDefault(
      'vault_addresses',
      [],
      true
    ) as AnyJson[];
    if (!localVault) {
      return false;
    }
    localVault = localVault?.map((i: AnyJson) => {
      if (i.address !== who) {
        return i;
      } else {
        return {
          ...i,
          name: newName,
        };
      }
    });

    localStorage.setItem('vault_addresses', JSON.stringify(localVault));
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
