// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Confirm, Delete, Remove } from '../Actions';
import { DialogRename } from './Dialogs/DialogRename';
import { HardwareAddress } from '@polkadot-live/ui/components';
import { useAccountStatuses } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useOverlay } from '@polkadot-live/ui/contexts';
import type { AddressProps } from './types';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

export const Address = ({ genericAccount, setSection }: AddressProps) => {
  const { publicKeyHex, source } = genericAccount;
  const { openOverlayWith } = useOverlay();
  const { getStatusForAccount, anyProcessing } = useAccountStatuses();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  return (
    <HardwareAddress
      key={publicKeyHex}
      /* Data */
      anyProcessing={anyProcessing(genericAccount)}
      genericAccount={genericAccount}
      isConnected={getOnlineMode()}
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
      openRemoveHandler={(encodedAccount) =>
        openOverlayWith(
          <Remove
            encodedAccount={encodedAccount}
            genericAccount={genericAccount}
          />,
          'small'
        )
      }
    />
  );
};
