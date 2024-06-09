// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  renameLocalAccount,
  postRenameAccount,
} from '@/renderer/utils/ImportUtils';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Remove } from '../Addresses/Remove';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { useState } from 'react';
import type { LedgerAddressProps } from '../types';

export const Address = ({
  address,
  accountName,
  source,
  setAddresses,
  index,
  isImported,
  orderData,
  setSection,
}: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();

  // State for account name.
  const [accountNameState, setAccountNameState] = useState<string>(accountName);

  // Handler to rename an account.
  const renameHandler = (who: string, newName: string) => {
    setAccountNameState(newName);
    renameLocalAccount(who, newName, 'ledger');

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);
  };

  return (
    <HardwareAddress
      key={index}
      source={source}
      address={address}
      index={index}
      accountName={accountNameState}
      renameHandler={renameHandler}
      isImported={isImported}
      orderData={orderData}
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
            name={accountNameState}
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
            setSection={setSection}
          />
        )
      }
    />
  );
};
