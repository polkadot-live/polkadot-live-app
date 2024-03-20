// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  getLocalAccountName,
  postRenameAccount,
  renameLocalAccount,
} from '@/renderer/utils/ImportUtils';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Remove } from '../Addresses/Remove';
import { useOverlay } from '@app/contexts/Overlay';
import { useState } from 'react';
import type { AddressProps } from '../Addresses/types';

export const Address = ({
  address,
  index,
  setAddresses,
  isImported,
}: AddressProps) => {
  // State for account name.
  const [accountName, setAccountName] = useState<string>(
    getLocalAccountName(address, 'vault')
  );

  const { openOverlayWith } = useOverlay();

  // Handler to rename an account.
  const renameHandler = (who: string, newName: string) => {
    setAccountName(newName);
    renameLocalAccount(who, newName, 'vault');

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);
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
    />
  );
};
