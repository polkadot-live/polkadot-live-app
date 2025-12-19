// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Main window contexts.
import {
  BootstrappingProvider,
  CogMenuProvider,
  DataBackupProvider,
  LedgerSignerProvider,
  TreasuryApiProvider,
  WalletConnectProvider,
} from '@ren/contexts/main';

// Actions window contexts.
import { TxMetaProvider, WcVerifierProvider } from '@ren/contexts/action';

// Import window contexts.
import {
  AddressesProvider,
  AppSettingsProvider,
  ApiHealthProvider,
  AccountStatusesProvider,
  ImportAddressesProvider,
  AddHandlerProvider,
  ChainsProvider,
  ChainEventsProvider,
  ConnectionsProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  EventsProvider,
  HelpProvider,
  ImportHandlerProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  LedgerFeedbackProvider,
  LedgerHardwareProvider,
  ManageProvider,
  OverlayProvider,
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  SettingFlagsProvider,
  SideNavProvider,
  SubscriptionsProvider,
  SummaryProvider,
  TabsProvider,
  TaskHandlerProvider,
  TracksProvider,
  TreasuryProvider,
  WcFeedbackProvider,
} from '@polkadot-live/contexts';
import { WalletConnectImportProvider } from '@ren/contexts/import';

// Other imports.
import { Theme } from './Theme';
import { withProviders } from '@polkadot-live/ui/hooks';

const getProvidersForWindow = () => {
  const windowId = window.myAPI.getWindowId();

  switch (windowId) {
    case 'main': {
      return withProviders(
        HelpProvider,
        AppSettingsProvider,
        OverlayProvider,
        ConnectionsProvider,
        AddressesProvider,
        // Side nav relies on app settings.
        SideNavProvider,
        ApiHealthProvider,
        TreasuryApiProvider,
        ChainsProvider,
        ChainEventsProvider,
        ManageProvider,
        IntervalSubscriptionsProvider,
        SubscriptionsProvider,
        IntervalTasksManagerProvider,
        EventsProvider,
        // Online status relies on other contexts being initialized.
        BootstrappingProvider,
        // Requires setting state from other contexts.
        DataBackupProvider,
        // Requires useBootstrapping and useHelp.
        CogMenuProvider,
        WalletConnectProvider,
        LedgerSignerProvider,
        SummaryProvider
      )(Theme);
    }
    case 'tabs': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TabsProvider,
        ConnectionsProvider,
        SettingFlagsProvider,
        TracksProvider,
        ImportAddressesProvider,
        // Requires useAddresses
        RemoveHandlerProvider,
        // Requires useImportAddresses + useRemoveHandler,
        AccountStatusesProvider,
        // Requires useAccountStatuses + useAddresses
        AddHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        ImportHandlerProvider,
        // Requires useAddresses
        RenameHandlerProvider,
        DeleteHandlerProvider,
        DialogControlProvider,
        // Requires useConnections
        LedgerHardwareProvider,
        WcFeedbackProvider,
        // Requires useConnections
        WalletConnectImportProvider,
        WcVerifierProvider,
        LedgerFeedbackProvider,
        TxMetaProvider,
        TreasuryProvider,
        PolkassemblyProvider,
        ReferendaProvider,
        ReferendaSubscriptionsProvider,
        TaskHandlerProvider
      )(Theme);
    }
    default: {
      throw new Error('Window ID not recognized.');
    }
  }
};

export const Providers = getProvidersForWindow();
