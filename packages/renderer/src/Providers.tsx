// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import {
  HelpProvider,
  OverlayProvider,
  SideNavProvider,
} from '@polkadot-live/ui/contexts';

// Tabs contexts.
import { TabsProvider } from '@ren/contexts/tabs';

// Main window contexts.
import {
  AddressesProvider,
  ApiHealthProvider,
  AppSettingsProvider,
  BootstrappingProvider,
  ChainsProvider,
  CogMenuProvider,
  DataBackupProvider,
  EventsProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  LedgerSignerProvider,
  ManageProvider,
  SubscriptionsProvider,
  SummaryProvider,
  TreasuryApiProvider,
  WalletConnectProvider,
} from '@ren/contexts/main';

// Import window contexts.
import {
  AccountStatusesProvider,
  AddressesProvider as ImportAddressesProvider,
  AddHandlerProvider,
  ConnectionsProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  ImportHandlerProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  SettingFlagsProvider,
  TracksProvider,
  TreasuryProvider,
} from '@polkadot-live/contexts';
import {
  LedgerHardwareProvider,
  WalletConnectImportProvider,
} from '@ren/contexts/import';

// Actions window contexts.
import {
  LedgerFeedbackProvider,
  WcFeedbackProvider,
  TxMetaProvider,
  WcVerifierProvider,
} from '@ren/contexts/action';

// OpenGov window contexts.
import {
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  TaskHandlerProvider,
} from '@ren/contexts/openGov';

// Other imports.
import { Theme } from './Theme';
import { withProviders } from '@polkadot-live/ui/hooks';

const getProvidersForWindow = () => {
  const windowId = window.myAPI.getWindowId();

  switch (windowId) {
    case 'tabs': {
      return withProviders(ConnectionsProvider, TabsProvider)(Theme);
    }
    case 'main': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        AddressesProvider,
        AppSettingsProvider,
        // Side nav relies on app settings.
        SideNavProvider,
        ApiHealthProvider,
        TreasuryApiProvider,
        ChainsProvider,
        ManageProvider,
        SubscriptionsProvider,
        IntervalSubscriptionsProvider,
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
    case 'import': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        ImportAddressesProvider,
        // Requires useAddresses
        RemoveHandlerProvider,
        AccountStatusesProvider,
        DialogControlProvider,
        // Requires useAccountStatuses + useAddresses
        ImportHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        AddHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        DeleteHandlerProvider,
        // Requires useAddresses
        RenameHandlerProvider,
        // Requires useConnections
        LedgerHardwareProvider,
        // Requires useConnections
        WalletConnectImportProvider
      )(Theme);
    }
    case 'settings': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        SettingFlagsProvider
      )(Theme);
    }
    case 'action': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        TxMetaProvider,
        WcVerifierProvider,
        LedgerFeedbackProvider,
        WcFeedbackProvider
      )(Theme);
    }
    case 'openGov': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        TracksProvider,
        TreasuryProvider,
        PolkassemblyProvider,
        ReferendaProvider, // Requires usePolkassembly
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
