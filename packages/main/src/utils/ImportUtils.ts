// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AddressesController } from '@/controller/AddressesController';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { ExtrinsicInfo, TxActionUid } from '@polkadot-live/types/tx';

/**
 * @name getAddressNameMap
 * @summary Get map with address as key and name as value.
 */
export const getAddressNameMap = () => {
  const addressNameMap = new Map<string, string>();
  const s_addresses = AddressesController.getAll();
  const p_addresses = new Map<AccountSource, string>(JSON.parse(s_addresses));

  for (const [source, ser] of p_addresses.entries()) {
    switch (source) {
      case 'vault':
      case 'read-only':
      case 'wallet-connect': {
        const parsed: LocalAddress[] = JSON.parse(ser);
        for (const { address, name } of parsed) {
          addressNameMap.set(address, name);
        }
        continue;
      }
      case 'ledger': {
        const parsed: LedgerLocalAddress[] = JSON.parse(ser);
        for (const { address, name } of parsed) {
          addressNameMap.set(address, name);
        }
        continue;
      }
      default: {
        continue;
      }
    }
  }

  return addressNameMap;
};

/**
 * @name compareExtrinsics
 * @summary Checks if two extrinsics are deemed different when importing.
 * @returns `true` if extrinsics are the same, `false` otherwise.
 */
export const compareExtrinsics = (a: ExtrinsicInfo, b: ExtrinsicInfo) => {
  const { action: aAction, from: aFrom } = a.actionMeta;
  const { action: bAction, from: bFrom } = b.actionMeta;
  const whiteListed: TxActionUid = 'balances_transferKeepAlive';

  return a.txId === b.txId
    ? true
    : aFrom === bFrom &&
        aAction === bAction &&
        aAction !== whiteListed &&
        a.txStatus !== 'finalized'
      ? true
      : false;
};
