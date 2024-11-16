// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import {
  postRenameAccount,
  renameAccountInStore,
  renderToast,
} from '@app/utils/ImportUtils';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { Remove } from '../Addresses/Remove';
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { chainIcon } from '@ren/config/chains';
import { getAddressChainId } from '@app/Utils';
import type { AddressProps } from '../Addresses/types';

export const Address = ({ localAddress, setSection }: AddressProps) => {
  const { address, isImported, name, source } = localAddress;
  const { openOverlayWith } = useOverlay();
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount } = useAccountStatuses();
  const { isConnected } = useConnections();

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
      ChainIcon={chainIcon(getAddressChainId(address))}
      isConnected={isConnected}
      isImported={isImported}
      processingStatus={getStatusForAccount(address, source)}
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
        renderToast(message, 'error', toastId)
      }
      onRenameSuccess={(message, toastId) =>
        renderToast(message, 'success', toastId)
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
