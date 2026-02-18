// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useAccountStatuses,
  useAddHandler,
  useConnections,
  useDeleteHandler,
  useDialogControl,
  useOverlay,
  useRemoveHandler,
} from '@polkadot-live/contexts';
import { HardwareAddress } from '@polkadot-live/ui';
import { Delete } from '../Actions';
import { DropdownAccount } from './Dropdowns';
import type { EncodedAccount } from '@polkadot-live/types/accounts';
import type { AddressProps } from './types';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { publicKeyHex, source } = genericAccount;
  const { copyToClipboard, getTheme, getOnlineMode } = useConnections();
  const { getStatusForAccount, anyProcessing } = useAccountStatuses();
  const { handleAddAddress, handleBookmarkToggle } = useAddHandler();
  const { handleRemoveAddress } = useRemoveHandler();
  const { handleDeleteAddress } = useDeleteHandler();
  const { openOverlayWith, setStatus } = useOverlay();
  const {
    setManageAccountDialogData,
    setBulkRenameDialogData,
    setShowAddressDialogData,
  } = useDialogControl();
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
      handleManageAccountClick={() => {
        setManageAccountDialogData({ genericAccount, isOpen: true });
      }}
      handleShowAddressClick={(encodedAccount) =>
        setShowAddressDialogData({
          address: encodedAccount.address,
          isOpen: true,
        })
      }
      handleAddSubscriptions={async (encodedAccount: EncodedAccount) =>
        await handleAddAddress(encodedAccount, genericAccount)
      }
      handleRemoveSubscriptions={async (encodedAccount: EncodedAccount) =>
        await handleRemoveAddress(encodedAccount, genericAccount)
      }
      onClipboardCopy={async (text: string) => await copyToClipboard(text)}
      openDeleteHandler={() =>
        openOverlayWith(
          <Delete
            genericAccount={genericAccount}
            handleDeleteAddress={handleDeleteAddress}
            setSection={setSection}
            setStatus={setStatus}
          />,
        )
      }
    />
  );
};
