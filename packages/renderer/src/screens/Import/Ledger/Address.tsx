// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import { renderToast } from '@polkadot-live/ui/utils';
import {
  getAddressChainId,
  postRenameAccount,
  renameAccountInStore,
} from '@polkadot-live/core';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { Remove } from '../Addresses/Remove';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { LedgerAddressProps } from '../types';

export const Address = ({ localAddress, setSection }: LedgerAddressProps) => {
  const { openOverlayWith } = useOverlay();
  const { address, index, isImported, name } = localAddress;
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount } = useAccountStatuses();

  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

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
      chainId={getAddressChainId(address)}
      isConnected={getOnlineMode()}
      isImported={isImported}
      processingStatus={getStatusForAccount(address, 'ledger')}
      theme={theme}
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
        renderToast(message, toastId, 'error')
      }
      onRenameSuccess={(message, toastId) =>
        renderToast(message, toastId, 'success')
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
