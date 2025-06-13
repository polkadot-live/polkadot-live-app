// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm } from '../Addresses/Confirm';
import { Delete } from '../Addresses/Delete';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { renderToast } from '@polkadot-live/ui/utils';
import { postRenameAccount, renameAccountInStore } from '@polkadot-live/core';
import { Remove } from '../Addresses/Remove';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { AddressProps } from '../Addresses/types';
import { encodeAddress, hexToU8a } from 'dedot/utils';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { accountName, isImported, publicKeyHex, source } = genericAccount;
  const { openOverlayWith } = useOverlay();
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount } = useAccountStatuses();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  // Handler to rename an account.
  const renameHandler = async (newName: string) => {
    // Update name in store in main process.
    await renameAccountInStore(publicKeyHex, source, newName);

    // Post message to main renderer to process the account rename.
    const address = encodeAddress(publicKeyHex, 0); // TMP
    postRenameAccount(address, newName);

    // Update import window address state
    genericAccount.accountName = newName;
    handleAddressImport(genericAccount);
  };

  return (
    <HardwareAddress
      key={publicKeyHex}
      /* Data */
      address={publicKeyHex}
      accountName={accountName}
      chainId={'Polkadot'}
      isConnected={getOnlineMode()}
      isImported={isImported}
      processingStatus={getStatusForAccount(publicKeyHex, source)}
      theme={theme}
      /* Handlers */
      openConfirmHandler={() =>
        openOverlayWith(
          <Confirm
            address={encodeAddress(hexToU8a(publicKeyHex), 0)}
            publicKeyHex={publicKeyHex}
            name={accountName}
            source="read-only"
          />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete
            address={encodeAddress(hexToU8a(publicKeyHex), 0)}
            publicKeyHex={publicKeyHex}
            source="read-only"
            setSection={setSection}
          />
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
          <Remove
            address={encodeAddress(hexToU8a(publicKeyHex), 0)}
            publicKeyHex={publicKeyHex}
            source="read-only"
            accountName={accountName}
          />,
          'small'
        )
      }
      renameHandler={renameHandler}
    />
  );
};
