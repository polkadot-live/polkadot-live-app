// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as main from '@ren/contexts/main';
import * as tabs from '@ren/contexts/tabs';
import * as imports from '@ren/contexts/import';
import * as extrinsics from '@ren/contexts/action';
import * as openGov from '@ren/contexts/openGov';

import { useMemo } from 'react';
import { useHelp, useOverlay, useSideNav } from '@polkadot-live/ui/contexts';
import {
  buildCache,
  ContextProxyProvider,
  useConnections,
  useSettingFlags,
  useDialogControl,
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
        AddressesCtx: () => main.useAddresses(),
        AppSettingsCtx: () => main.useAppSettings(),
        SideNavCtx: () => useSideNav(),
        ApiHealthCtx: () => main.useApiHealth(),
        TreasuryApiCtx: () => main.useTreasuryApi(),
        ChainsCtx: () => main.useChains(),
        SubscriptionsCtx: () => main.useSubscriptions(),
        IntervalSubscriptionsCtx: () => main.useIntervalSubscriptions(),
        ManageCtx: () => main.useManage(),
        IntervalTaskManagerCtx: () => main.useIntervalTasksManager(),
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
        TracksCtx: () => openGov.useTracks(),
        TreasuryCtx: () => openGov.useTreasury(),
        PolkassemblyCtx: () => openGov.usePolkassembly(),
        ReferendaCtx: () => openGov.useReferenda(),
        TaskHandlerCtx: () => openGov.useTaskHandler(),
        ReferendaSubscriptionsCtx: () => openGov.useReferendaSubscriptions(),
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
        ImportAddressesCtx: () => imports.useAddresses(),
        AccountStatusesCtx: () => imports.useAccountStatuses(),
        DialogControlCtx: () => useDialogControl(),
        ImportHandlerCtx: () => imports.useImportHandler(),
        AddHandlerCtx: () => imports.useAddHandler(),
        RemoveHandlerCtx: () => imports.useRemoveHandler(),
        DeleteHandlerCtx: () => imports.useDeleteHandler(),
        RenameHandlerCtx: () => imports.useRenameHandler(),
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
        TabsCtx: () => tabs.useTabs(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
