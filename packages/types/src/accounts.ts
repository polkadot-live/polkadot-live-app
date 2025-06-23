// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from './chains';

export type AccountSource =
  | 'vault'
  | 'ledger'
  | 'system'
  | 'read-only'
  | 'wallet-connect';

export type AccountStatus = 'pending' | 'active' | 'does_not_exist';

/*
 * Essential account data mapped to chain ID.
 */
export type FlattenedAccounts = Map<ChainID, FlattenedAccountData[]>;

/*
 * Account's balances.
 */
export interface AccountBalance {
  nonce: bigint;
  free: bigint;
  reserved: bigint;
  frozen: bigint;
}

/*
 * Account's associated nomination pool data.
 */
export interface AccountNominationPoolData {
  poolId: number;
  poolRewardAddress: string;
  poolPendingRewards: string;
  poolState: string;
  poolName: string;
  poolRoles: NominationPoolRoles;
  poolCommission: NominationPoolCommission;
}

export interface NominationPoolRoles {
  depositor: string;
  root?: string | undefined;
  nominator?: string | undefined;
  bouncer?: string | undefined;
}

export interface NominationPoolCommission {
  current?: string[] | undefined;
  max?: string | undefined;
  changeRate?:
    | {
        maxIncrease: string;
        minDelay: string;
      }
    | undefined;
  throttleFrom?: string | undefined;
}

/*
 * Account's nominating pool data.
 */

export interface AccountNominatingData {
  exposed: boolean;
  lastCheckedEra: number;
  submittedIn: number;
  validators: ValidatorData[];
}

export interface ValidatorData {
  validatorId: string;
  commission: string;
}

/*
 * Account data saved in Electron store.
 */
export interface StoredAccount {
  _address: string;
  _chain: ChainID;
  _name: string;
  _source: AccountSource;
}

/**
 * Account JSON representation.
 */
export interface AccountJson {
  _address: string;
  _chain: ChainID;
  _name: string;
  _source: AccountSource;
}

/**
 * Type storing essential data for an account.
 */
export interface FlattenedAccountData {
  address: string;
  chain: ChainID;
  name: string;
  nominationPoolData: AccountNominationPoolData | null;
  nominatingData: AccountNominatingData | null;
  source: AccountSource;
}

/**
 * Address type for import window.
 */
export interface LedgerMetadata {
  device: { id: string; productName: string };
  accountIndex?: number;
}

export interface EncodedAccount {
  address: string;
  alias: string;
  chainId: ChainID;
  isImported: boolean;
}

/**
 * Send screen account type.
 */
export interface SendAccount extends EncodedAccount {
  source: AccountSource;
}

export interface ImportedGenericAccount {
  accountName: string;
  encodedAccounts: Record<ChainID, EncodedAccount>;
  publicKeyHex: string;
  source: AccountSource;
  ledger?: LedgerMetadata;
}
