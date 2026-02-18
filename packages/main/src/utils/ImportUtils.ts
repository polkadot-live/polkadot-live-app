// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AddressesController } from '../controller';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ExtrinsicInfo, TxActionUid } from '@polkadot-live/types/tx';

/**
 * @name getAddressNameMap
 * @summary Get map with <chainId:address> as key and name as value.
 */
export const getAddressNameMap = () => {
  const addressNameMap = new Map<string, string>();
  const serialized = AddressesController.getAll();
  const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));

  for (const ser of parsedMap.values()) {
    const genericAccounts: ImportedGenericAccount[] = JSON.parse(ser);
    for (const { encodedAccounts: encoded } of genericAccounts) {
      for (const { address, chainId, alias } of Object.values(encoded)) {
        addressNameMap.set(`${chainId}:${address}`, alias);
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
    : !!(
        aFrom === bFrom &&
        aAction === bAction &&
        aAction !== whiteListed &&
        a.txStatus !== 'finalized'
      );
};
