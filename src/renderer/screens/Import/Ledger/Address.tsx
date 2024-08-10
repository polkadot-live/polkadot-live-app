// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  postRenameAccount,
  renameAccountInStore,
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
  index,
  isImported,
  orderData,
  setSection,
}: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();

  // State for account name.
  const [accountNameState, setAccountNameState] = useState<string>(accountName);

  // Handler to rename an account.
  const renameHandler = async (who: string, newName: string) => {
    setAccountNameState(newName);

    // Update name in store in main process.
    await renameAccountInStore(who, 'ledger', newName);

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
        openOverlayWith(<Remove address={address} source="ledger" />, 'small')
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm address={address} name={accountNameState} source="ledger" />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete address={address} source="ledger" setSection={setSection} />
        )
      }
    />
  );
};
