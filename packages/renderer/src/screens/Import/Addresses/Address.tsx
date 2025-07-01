// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Delete } from '../Actions';
import { DropdownAccount } from './Dropdowns';
import { HardwareAddress } from '@polkadot-live/ui/components';
import {
  useAccountStatuses,
  useAddHandler,
  useRemoveHandler,
  useRenameHandler,
} from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { AddressProps } from './types';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { publicKeyHex, source } = genericAccount;
  const { openOverlayWith } = useOverlay();
  const { getStatusForAccount, anyProcessing } = useAccountStatuses();
  const { handleAddAddress, handleBookmarkToggle } = useAddHandler();
  const { handleRemoveAddress } = useRemoveHandler();
  const { setManageAccountDialogData } = useRenameHandler();
  const { getTheme, getOnlineMode } = useConnections();
  const { setBulkRenameDialogData, setShowAddressDialogData } =
    useRenameHandler();

  const theme = getTheme();

  return (
    <HardwareAddress
      key={publicKeyHex}
      /* Components */
      DropdownAccount={DropdownAccount}
      /* Data */
      anyProcessing={anyProcessing(genericAccount)}
      genericAccount={genericAccount}
      isConnected={getOnlineMode()}
      isProcessing={({ address, chainId }) =>
        Boolean(getStatusForAccount(`${chainId}:${address}`, source))
      }
      setBulkRenameDialogData={setBulkRenameDialogData}
      theme={theme}
      /* Handlers */
      handleBookmarkToggle={async (encodedAccount) => {
        await handleBookmarkToggle(encodedAccount, genericAccount);
      }}
      handleManageAccountClick={() =>
        setManageAccountDialogData({ genericAccount, isOpen: true })
      }
      handleShowAddressClick={(encodedAccount) =>
        setShowAddressDialogData({ encodedAccount, isOpen: true })
      }
      handleAddSubscriptions={async (encodedAccount: EncodedAccount) =>
        await handleAddAddress(encodedAccount, genericAccount)
      }
      handleRemoveSubscriptions={async (encodedAccount: EncodedAccount) =>
        await handleRemoveAddress(encodedAccount, genericAccount)
      }
      onClipboardCopy={async (text: string) =>
        await window.myAPI.copyToClipboard(text)
      }
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete genericAccount={genericAccount} setSection={setSection} />
        )
      }
    />
  );
};
