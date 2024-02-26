// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ellipsisFn, localStorageOrDefault, unescape } from '@w3ux/utils';
import type { AnyJson } from '@/types/misc';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { Confirm } from '../Addresses/Confirm';
import { Remove } from '../Addresses/Remove';
import type { AddressProps } from '../Addresses/types';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';

export const Address = ({ address, index }: AddressProps) => {
  const { openOverlayWith } = useOverlay();
  const { addressExists } = useAddresses();

  // store the current name of the address
  const initialName = () => {
    const defaultName = ellipsisFn(address);
    const localLedger = localStorageOrDefault(
      'ledger_addresses',
      [],
      true
    ) as AnyJson[];
    if (!localLedger) {
      return defaultName;
    }
    const localAddress = localLedger.find(
      (i: AnyJson) => i.address === address
    );
    return localAddress?.name ? unescape(localAddress.name) : defaultName;
  };

  const [name, setName] = useState<string>(initialName());

  const renameHandler = (who: string, value: string) => {
    setName(value);
    renameLocalAccount(who, value);
  };

  const renameLocalAccount = (who: string, newName: string) => {
    let localLedger = localStorageOrDefault(
      'ledger_addresses',
      [],
      true
    ) as AnyJson[];
    if (!localLedger) {
      return false;
    }
    localLedger = localLedger?.map((i: AnyJson) => {
      if (i.address !== who) {
        return i;
      } else {
        return {
          ...i,
          name: newName,
        };
      }
    });

    localStorage.setItem('ledger_addresses', JSON.stringify(localLedger));
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
