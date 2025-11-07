// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { renderToast } from '@polkadot-live/ui/utils';
import type {
  IpcTreasuryInfo,
  SerIpcTreasuryInfo,
} from '@polkadot-live/types/treasury';
import type { TreasuryAdapter } from './types';

export const chromeAdapter: TreasuryAdapter = {
  initTreasury: (chainId, setFetchingTreasuryData, setTreasuryData) => {
    // Utility to parse serialized treasury info.
    const parseTreasuryInfo = (info: SerIpcTreasuryInfo): IpcTreasuryInfo => {
      switch (chainId) {
        case 'Polkadot Relay': {
          const { coreTreasuryInfo, serStatemintTreasuryInfo: ser } = info;
          return {
            coreTreasuryInfo,
            statemintTreasuryInfo: {
              usdcBalance: BigInt(ser?.usdcBalance || 0),
              usdtBalance: BigInt(ser?.usdtBalance || 0),
              dotBalance: BigInt(ser?.dotBalance || 0),
            },
          };
        }
        default: {
          const { coreTreasuryInfo, serStatemineTreasuryInfo: ser } = info;
          return {
            coreTreasuryInfo,
            statemineTreasuryInfo: {
              ksmBalance: BigInt(ser?.ksmBalance || 0),
            },
          };
        }
      }
    };

    setFetchingTreasuryData(true);
    chrome.runtime
      .sendMessage({
        type: 'openGov',
        task: 'initTreasury',
        payload: { chainId },
      })
      .then((result: SerIpcTreasuryInfo | null) => {
        if (result !== null) {
          const info = parseTreasuryInfo(result);
          setTreasuryData(info);
        } else {
          setFetchingTreasuryData(false);
          renderToast('Error fetching treasury', 'fetch-error', 'error');
        }
      });
  },
};
