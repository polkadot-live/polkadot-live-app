// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as main from '@ren/contexts/main';
import * as imports from '@ren/contexts/import';
import * as extrinsics from '@ren/contexts/action';
import { useMemo } from 'react';
import { buildCache, ContextProxyProvider } from '@polkadot-live/contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

/**
 * Extrinsics view.
 */
export const ContextProxyExtrinsics = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        TxMetaCtx: () => extrinsics.useTxMeta(),
        WcVerifierCtx: () => extrinsics.useWcVerifier(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * Main view.
 */
export const ContextProxyMain = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        BootstrappingCtx: () => main.useBootstrapping(),
        CogMenuCtx: () => main.useCogMenu(),
        WalletConnectCtx: () => main.useWalletConnect(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * Import view.
 */
export const ContextProxyImport = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        WalletConnectImportCtx: () => imports.useWalletConnectImport(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
