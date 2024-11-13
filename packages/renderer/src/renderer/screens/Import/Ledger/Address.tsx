// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  postRenameAccount,
  renameAccountInStore,
} from '@ren/renderer/utils/ImportUtils';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { Remove } from '../Addresses/Remove';
import { useAddresses } from '@ren/renderer/contexts/import/Addresses';
import { useOverlay } from '@ren/renderer/contexts/common/Overlay';
import type { LedgerAddressProps } from '../types';

export const Address = ({ localAddress, setSection }: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();
  const { address, index, isImported, name } = localAddress;
  const { handleAddressImport } = useAddresses();

  // Handler to rename an account.
  const renameHandler = async (who: string, newName: string) => {
    // Update name in store in main process.
    await renameAccountInStore(address, 'ledger', newName);

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);

    // Update import window address state
    handleAddressImport('ledger', { ...localAddress, name: newName });
  };

  return (
    <HardwareAddress
      key={index || 0}
      source={'ledger'}
      address={address}
      accountName={name}
      renameHandler={renameHandler}
      isImported={isImported}
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove address={address} source="ledger" accountName={name} />,
          'small'
        )
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm address={address} name={name} source="ledger" />,
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
