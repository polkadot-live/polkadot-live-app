// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { useHelp, useOverlay } from '@polkadot-live/ui/contexts';
import {
  buildCache,
  ContextProxyProvider,
  useAccountStatuses,
  useAddresses as useImportAddresses,
  useAddHandler,
  useConnections,
  useDeleteHandler,
  useDialogControl,
  useImportHandler,
  usePolkassembly,
  useReferenda,
  useReferendaSubscriptions,
  useRemoveHandler,
  useRenameHandler,
  useSettingFlags,
  useTaskHandler,
  useTracks,
  useTreasury,
} from '@polkadot-live/contexts';
import {
  useLedgerFeedback,
  useLedgerHardware,
  useTabs,
  useTxMeta,
  useWalletConnect,
  useWalletConnectImport,
  useWcFeedback,
  useWcVerifier,
} from './contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyTab = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        TracksCtx: () => useTracks(),
        ImportAddressesCtx: () => useImportAddresses(),
        AccountStatusesCtx: () => useAccountStatuses(),
        ImportHandlerCtx: () => useImportHandler(),
        AddHandlerCtx: () => useAddHandler(),
        RemoveHandlerCtx: () => useRemoveHandler(),
        DeleteHandlerCtx: () => useDeleteHandler(),
        RenameHandlerCtx: () => useRenameHandler(),
        DialogControlCtx: () => useDialogControl(),
        SettingFlagsCtx: () => useSettingFlags(),
        TabsCtx: () => useTabs(),
        LedgerHardwareCtx: () => useLedgerHardware(),
        WcFeedbackCtx: () => useWcFeedback(),
        WalletConnectCtx: () => useWalletConnect(),
        WalletConnectImportCtx: () => useWalletConnectImport(),
        WcVerifierCtx: () => useWcVerifier(),
        LedgerFeedbackCtx: () => useLedgerFeedback(),
        TxMetaCtx: () => useTxMeta(),
        TreasuryCtx: () => useTreasury(),
        PolkassemblyCtx: () => usePolkassembly(),
        ReferendaCtx: () => useReferenda(),
        ReferendaSubscriptionsCtx: () => useReferendaSubscriptions(),
        TaskHandlerCtx: () => useTaskHandler(),
      }),
    []
  );

  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
