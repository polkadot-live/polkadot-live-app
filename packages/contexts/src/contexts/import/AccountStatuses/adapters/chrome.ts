// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AnyData,
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types';
import { renderToast } from '@polkadot-live/ui/utils';
import type { AccountStatusesAdapter } from './types';

export const chromeAdapter: AccountStatusesAdapter = {
  listenOnMount: (setStatusForAccount, handleRemoveAddress) => {
    if (!(setStatusForAccount && handleRemoveAddress)) {
      return null;
    }
    // Handle status updates.
    const callback = async (message: AnyData) => {
      switch (message.type) {
        case 'rawAccount': {
          switch (message.task) {
            case 'setProcessing': {
              interface I {
                encoded: EncodedAccount;
                generic: ImportedGenericAccount;
                status: boolean;
                success: boolean;
              }
              const { generic, encoded, status, success }: I = message.payload;
              const { address, chainId } = encoded;
              setStatusForAccount(
                `${chainId}:${address}`,
                generic.source,
                status
              );

              if (!success) {
                await handleRemoveAddress(encoded, generic);
                renderToast('Account import error', 'import-error', 'error');
              }
              break;
            }
          }
          break;
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
