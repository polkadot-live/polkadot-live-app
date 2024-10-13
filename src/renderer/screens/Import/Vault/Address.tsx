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
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import type { AddressProps } from '../Addresses/types';

export const Address = ({
  localAddress,
  setSection,
  orderData,
}: AddressProps) => {
  const { address, isImported, name, source } = localAddress;
  const { openOverlayWith } = useOverlay();
  const { handleAddressImport } = useAddresses();

  // Handler to rename an account.
  const renameHandler = async (who: string, newName: string) => {
    // Update name in store in main process.
    await renameAccountInStore(address, 'vault', newName);

    // Post message to main renderer to process the account rename.
    postRenameAccount(who, newName);

    // Update import window address state
    handleAddressImport(source, { ...localAddress, name: newName });
  };

  return (
    <HardwareAddress
      key={address}
      address={address}
      source={source}
      isImported={isImported}
      orderData={orderData}
      accountName={name}
      renameHandler={renameHandler}
      openRemoveHandler={() =>
        openOverlayWith(<Remove address={address} source="vault" />, 'small')
      }
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm address={address} name={name} source="vault" />,
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
