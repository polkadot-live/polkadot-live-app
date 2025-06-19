// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm, Delete, Remove } from '../Actions';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { renderToast } from '@polkadot-live/ui/utils';
import { renameAccountInStore } from '@polkadot-live/core';
import { useAccountStatuses, useAddresses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { AddressProps } from './types';
import type { EncodedAccount } from '@polkadot-live/types/accounts';
import { DialogRename } from './Dialogs/DialogRename';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { publicKeyHex, source } = genericAccount;
  const { openOverlayWith } = useOverlay();
  const { handleAddressImport } = useAddresses();
  const { getStatusForAccount, anyProcessing } = useAccountStatuses();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  // Handler to rename an account.
  const renameHandler = async (newName: string) => {
    await renameAccountInStore(publicKeyHex, source, newName);

    // TODO: Apply to encoded accounts.
    // Post message to main renderer to process the account rename.
    //const address = encodeAddress(publicKeyHex, 0); // TMP
    //postRenameAccount(address, newName);

    // Update import window address state
    genericAccount.accountName = newName;
    handleAddressImport(genericAccount);
  };

  return (
    <HardwareAddress
      key={publicKeyHex}
      /* Data */
      genericAccount={genericAccount}
      isConnected={getOnlineMode()}
      anyProcessing={anyProcessing(genericAccount)}
      isProcessing={({ address }) =>
        Boolean(getStatusForAccount(address, source))
      }
      theme={theme}
      /* Dialog */
      DialogRename={DialogRename}
      /* Handlers */
      onClipboardCopy={async (text: string) =>
        await window.myAPI.copyToClipboard(text)
      }
      openConfirmHandler={(encodedAccount: EncodedAccount) =>
        openOverlayWith(
          <Confirm
            encodedAccount={encodedAccount}
            genericAccount={genericAccount}
          />,
          'small'
        )
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete genericAccount={genericAccount} setSection={setSection} />
        )
      }
      onRenameError={(message, toastId) =>
        renderToast(message, toastId, 'error')
      }
      onRenameSuccess={(message, toastId) =>
        renderToast(message, toastId, 'success')
      }
      openRemoveHandler={(encodedAccount) =>
        openOverlayWith(
          <Remove
            encodedAccount={encodedAccount}
            genericAccount={genericAccount}
          />,
          'small'
        )
      }
      renameHandler={renameHandler}
    />
  );
};
