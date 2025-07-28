// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import { ConnectionsProvider, HelpProvider } from '@ren/contexts/common';
import { OverlayProvider, SideNavProvider } from '@polkadot-live/ui/contexts';

// Tabs contexts.
import { TabsProvider } from '@ren/contexts/tabs';

// Main window contexts.
import {
  AddressesProvider,
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
  WalletConnectProvider,
} from '@ren/contexts/main';

// Import window contexts.
import {
  AccountStatusesProvider,
  AddressesProvider as ImportAddressesProvider,
  AddHandlerProvider,
  DeleteHandlerProvider,
  ImportHandlerProvider,
  LedgerHardwareProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  WalletConnectImportProvider,
} from '@ren/contexts/import';

// Settings window contexts.
import {
  SettingFlagsProvider,
  WebsocketServerProvider,
  WorkspacesProvider,
} from '@ren/contexts/settings';

// Actions window contexts.
import { LedgerFeedbackProvider, TxMetaProvider } from '@ren/contexts/action';

// OpenGov window contexts.
import {
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  TaskHandlerProvider,
  TracksProvider,
  TreasuryProvider,
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
        ChainsProvider,
        SubscriptionsProvider,
        IntervalSubscriptionsProvider,
        ManageProvider,
        IntervalTasksManagerProvider,
        EventsProvider,
        // Online status relies on other contexts being initialized.
        BootstrappingProvider,
        // Requires setting state from other contexts.
        DataBackupProvider,
        // Requires useBootstrapping and useHelp.
        CogMenuProvider,
        WalletConnectProvider,
        LedgerSignerProvider
      )(Theme);
    }
    case 'import': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        ImportAddressesProvider,
        AccountStatusesProvider,
        // Requires useAccountStatuses + useAddresses
        ImportHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        AddHandlerProvider,
        // Requires useAddresses
        RemoveHandlerProvider,
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
        SettingFlagsProvider,
        WebsocketServerProvider,
        WorkspacesProvider
      )(Theme);
    }
    case 'action': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        ConnectionsProvider,
        TxMetaProvider,
        LedgerFeedbackProvider
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
