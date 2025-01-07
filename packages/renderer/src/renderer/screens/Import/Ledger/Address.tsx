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
import type { LedgerAddressProps } from '../types';

export const Address = ({ localAddress, setSection }: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();
  const { address, index, isImported, name } = localAddress;
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount } = useAccountStatuses();
  const { getOnlineMode } = useConnections();

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
      /* Data */
      address={address}
      accountName={name}
      ChainIcon={chainIcon(getAddressChainId(address))}
      isConnected={getOnlineMode()}
      isImported={isImported}
      processingStatus={getStatusForAccount(address, 'ledger')}
      /* Handlers */
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
      onRenameError={(message, toastId) =>
        renderToast(message, 'error', toastId)
      }
      onRenameSuccess={(message, toastId) =>
        renderToast(message, 'success', toastId)
      }
      openRemoveHandler={() =>
        openOverlayWith(
          <Remove address={address} source="ledger" accountName={name} />,
          'small'
        )
      }
      renameHandler={renameHandler}
    />
  );
};
