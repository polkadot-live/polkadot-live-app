// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  postRenameAccount,
  renameLocalAccount,
} from '@/renderer/utils/ImportUtils';
import { HardwareAddress } from '@app/library/Hardware/HardwareAddress';
import { Remove } from '../Addresses/Remove';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { useState } from 'react';
import type { AddressProps } from '../Addresses/types';

export const Address = ({
  address,
  source,
  index,
  accountName,
  isImported,
  setSection,
  orderData,
}: AddressProps) => {
  const { openOverlayWith } = useOverlay();

  // State for account name.
  const [accountNameState, setAccountNameState] = useState<string>(accountName);

  // Handler to rename an account.
  const renameHandler = (who: string, newName: string) => {
    setAccountNameState(newName);
    renameLocalAccount(who, newName, 'vault');

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);
  };

  return (
    <HardwareAddress
      key={index}
      address={address}
      source={source}
      isImported={isImported}
      orderData={orderData}
      index={index}
      accountName={accountNameState}
      renameHandler={renameHandler}
      openRemoveHandler={() =>
        openOverlayWith(<Remove address={address} source="vault" />, 'small')
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm address={address} name={accountNameState} source="vault" />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete address={address} source="vault" setSection={setSection} />
        )
      }
    />
  );
};
