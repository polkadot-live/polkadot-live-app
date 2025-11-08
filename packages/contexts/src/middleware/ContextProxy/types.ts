// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  TxMetaContextInterface,
  WcVerifierContextInterface,
} from '../../types/action';
import type { WalletConnectImportContextInterface } from '../../types/import';
import type {
  BootstrappingInterface,
  CogMenuContextInterface,
  DataBackupContextInterface,
  LedgerSignerContextInterface,
  WalletConnectContextInterface,
} from '../../types/main';

export interface ContextProxyInterface {
  useCtx: <T extends keyof ContextsMap>(key: T) => ContextValue<T>;
}

export type ContextValue<T extends keyof ContextsMap> = ContextsMap[T];

export interface ContextsMap {
  /** Extrinsics */
  TxMetaCtx: () => TxMetaContextInterface;
  WcVerifierCtx: () => WcVerifierContextInterface;

  /** Import */
  WalletConnectImportCtx: () => WalletConnectImportContextInterface;

  /** Main */
  BootstrappingCtx: () => BootstrappingInterface;
  DataBackupCtx: () => DataBackupContextInterface;
  CogMenuCtx: () => CogMenuContextInterface;
  WalletConnectCtx: () => WalletConnectContextInterface;
  LedgerSigningCtx: () => LedgerSignerContextInterface;
}
