// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  getAddressChainId,
  postRenameAccount,
  renameAccountInStore,
} from '@polkadot-live/core';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { renderToast } from '@polkadot-live/ui/utils';
import { Remove } from '../Addresses/Remove';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { AddressProps } from '../Addresses/types';

export const Address = ({ localAddress, setSection }: AddressProps) => {
  const { address, isImported, name, source } = localAddress;
  const { openOverlayWith } = useOverlay();
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount } = useAccountStatuses();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

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
      /* Data */
      address={address}
      accountName={name}
      chainId={getAddressChainId(address)}
      isConnected={getOnlineMode()}
      isImported={isImported}
      processingStatus={getStatusForAccount(address, source)}
      theme={theme}
      /* Handlers */
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
      onRenameError={(message, toastId) =>
        renderToast(message, toastId, 'error')
      }
      onRenameSuccess={(message, toastId) =>
        renderToast(message, toastId, 'success')
      }
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove address={address} source="vault" accountName={name} />,
          'small'
        )
      }
      renameHandler={renameHandler}
    />
  );
};
