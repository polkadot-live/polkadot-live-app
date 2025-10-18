// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Delete } from '../Actions';
import { DropdownAccount } from './Dropdowns';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { useContextProxy } from '@polkadot-live/contexts';
import type { AddressProps } from './types';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { publicKeyHex, source } = genericAccount;
  const { useCtx } = useContextProxy();
  const { getStatusForAccount, anyProcessing } = useCtx('AccountStatusesCtx')();
  const { handleAddAddress, handleBookmarkToggle } = useCtx('AddHandlerCtx')();
  const { handleRemoveAddress } = useCtx('RemoveHandlerCtx')();
  const { handleDeleteAddress } = useCtx('DeleteHandlerCtx')();
  const { copyToClipboard, getTheme, getOnlineMode } =
    useCtx('ConnectionsCtx')();

  const { openOverlayWith, setStatus } = useCtx('OverlayCtx')();
  const {
    setManageAccountDialogData,
    setBulkRenameDialogData,
    setShowAddressDialogData,
  } = useCtx('DialogControlCtx')();
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
          />
        )
      }
    />
  );
};
