// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  getLocalAccountName,
  renameLocalAccount,
  postRenameAccount,
} from '@/renderer/utils/ImportUtils';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Remove } from '../Addresses/Remove';
import { useOverlay } from '@app/contexts/Overlay';
import { useState } from 'react';
import type { LedgerAddressProps } from '../types';

export const Address = ({
  address,
  setAddresses,
  index,
  isImported,
}: LedgerAddressProps) => {
  // State for account name.
  const [accountName, setAccountName] = useState<string>(
    getLocalAccountName(address, 'ledger')
  );

  const { openOverlayWith } = useOverlay();

  // Handler to rename an account.
  const renameHandler = (who: string, newName: string) => {
    setAccountName(newName);
    renameLocalAccount(who, newName, 'ledger');

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);
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
