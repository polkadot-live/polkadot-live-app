// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HardwareAddress } from '@polkadot-cloud/react';
import {
  ellipsisFn,
  localStorageOrDefault,
  unescape,
} from '@polkadot-cloud/utils';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { Confirm } from '../Addresses/Confirm';
import { Remove } from '../Addresses/Remove';
import type { AddressProps } from '../Addresses/types';
import type { AnyJson } from '@/types/misc';

export const Address = ({ address, index }: AddressProps) => {
  const { openOverlayWith } = useOverlay();
  const { addressExists } = useAddresses();

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
      index={index}
      initial={initialName()}
      Identicon={<Identicon value={address} size={40} />}
      existsHandler={addressExists}
      renameHandler={renameHandler}
      openRemoveHandler={() =>
        openOverlayWith(<Remove address={address} />, 'small')
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm address={address} name={name} source="ledger" />,
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
