// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as main from '@ren/contexts/main';
import * as imports from '@ren/contexts/import';
import * as extrinsics from '@ren/contexts/action';

import { useMemo } from 'react';
import { useHelp, useOverlay, useSideNav } from '@polkadot-live/ui/contexts';
import {
  buildCache,
  ContextProxyProvider,
  useAccountStatuses,
  useAppSettings,
  useApiHealth,
  useAddHandler,
  useAddresses,
  useChains,
  useConnections,
  useDeleteHandler,
  useDialogControl,
  useImportAddresses,
  useImportHandler,
  useIntervalSubscriptions,
  useIntervalTasksManager,
  useManage,
  usePolkassembly,
  useReferenda,
  useReferendaSubscriptions,
  useRemoveHandler,
  useRenameHandler,
  useSettingFlags,
  useSubscriptions,
  useTabs,
  useTaskHandler,
  useTracks,
  useTreasury,
} from '@polkadot-live/contexts';

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
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        TxMetaCtx: () => extrinsics.useTxMeta(),
        WcVerifierCtx: () => extrinsics.useWcVerifier(),
        LedgerFeedbackCtx: () => extrinsics.useLedgerFeedback(),
        WcFeedbackCtx: () => extrinsics.useWcFeedback(),
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
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        AddressesCtx: () => useAddresses(),
        AppSettingsCtx: () => useAppSettings(),
        SideNavCtx: () => useSideNav(),
        ApiHealthCtx: () => useApiHealth(),
        TreasuryApiCtx: () => main.useTreasuryApi(),
        ChainsCtx: () => useChains(),
        SubscriptionsCtx: () => useSubscriptions(),
        IntervalSubscriptionsCtx: () => useIntervalSubscriptions(),
        ManageCtx: () => useManage(),
        IntervalTaskManagerCtx: () => useIntervalTasksManager(),
        EventsCtx: () => main.useEvents(),
        BootstrappingCtx: () => main.useBootstrapping(),
        DataBackupCtx: () => main.useDataBackup(),
        CogMenuCtx: () => main.useCogMenu(),
        WalletConnectCtx: () => main.useWalletConnect(),
        LedgerSigningCtx: () => main.useLedgerSigner(),
        SummaryCtx: () => main.useSummary(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * OpenGov view.
 */
export const ContextProxyOpenGov = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        TracksCtx: () => useTracks(),
        TreasuryCtx: () => useTreasury(),
        PolkassemblyCtx: () => usePolkassembly(),
        ReferendaCtx: () => useReferenda(),
        TaskHandlerCtx: () => useTaskHandler(),
        ReferendaSubscriptionsCtx: () => useReferendaSubscriptions(),
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
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        ImportAddressesCtx: () => useImportAddresses(),
        RemoveHandlerCtx: () => useRemoveHandler(),
        AccountStatusesCtx: () => useAccountStatuses(),
        DialogControlCtx: () => useDialogControl(),
        ImportHandlerCtx: () => useImportHandler(),
        AddHandlerCtx: () => useAddHandler(),
        DeleteHandlerCtx: () => useDeleteHandler(),
        RenameHandlerCtx: () => useRenameHandler(),
        LedgerHardwareCtx: () => imports.useLedgerHardware(),
        WalletConnectImportCtx: () => imports.useWalletConnectImport(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * Settings view.
 */
export const ContextProxySettings = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        SettingFlagsCtx: () => useSettingFlags(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};

/**
 * Tabs view.
 */
export const ContextProxyTabs = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        ConnectionsCtx: () => useConnections(),
        TabsCtx: () => useTabs(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
