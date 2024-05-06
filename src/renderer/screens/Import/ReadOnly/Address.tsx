// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import { HardwareAddress } from '@/renderer/library/Hardware/HardwareAddress';
import {
  postRenameAccount,
  renameLocalAccount,
} from '@/renderer/utils/ImportUtils';
import { Remove } from '../Addresses/Remove';
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { useOverlay } from '@/renderer/contexts/Overlay';
import { useState } from 'react';
import type { AddressProps } from '../Addresses/types';

export const Address = ({
  address,
  source,
  index,
  accountName,
  setAddresses,
  isImported,
  setSection,
  orderData,
}: AddressProps) => {
  // State for account name.
  const [accountNameState, setAccountNameState] = useState<string>(accountName);
  const { openOverlayWith } = useOverlay();

  // Getter for account's processing flag.
  const { getStatusForAccount } = useAccountStatuses();

  // Handler to rename an account.
  const renameHandler = (who: string, newName: string) => {
    setAccountNameState(newName);
    renameLocalAccount(who, newName, 'read-only');

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);
  };

  return (
    <HardwareAddress
      key={index}
      address={address}
      isImported={isImported}
      orderData={orderData}
      isProcessing={getStatusForAccount(address, source) || false}
      index={index}
      accountName={accountNameState}
      renameHandler={renameHandler}
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove
            setAddresses={setAddresses}
            address={address}
            source="read-only"
          />,
          'small'
        )
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm
            setAddresses={setAddresses}
            address={address}
            name={accountNameState}
            source="read-only"
          />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete
            setAddresses={setAddresses}
            address={address}
            source="read-only"
            setSection={setSection}
          />
        )
      }
    />
  );
};
