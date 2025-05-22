// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import { ConnectionsProvider, HelpProvider } from '@ren/contexts/common';
import {
  OverlayProvider,
  SideNavProvider,
  TooltipProvider,
} from '@polkadot-live/ui/contexts';

// Tabs contexts.
import { TabsProvider } from '@ren/contexts/tabs/Tabs';

// Main window contexts.
import { AddressesProvider } from '@ren/contexts/main/Addresses';
import { AppSettingsProvider } from '@ren/contexts/main/AppSettings';
import { BootstrappingProvider } from '@ren/contexts/main/Bootstrapping';
import { ChainsProvider } from '@ren/contexts/main/Chains';
import { EventsProvider } from '@ren/contexts/main/Events';
import { ManageProvider } from '@ren/contexts/main/Manage';
import { SubscriptionsProvider } from '@ren/contexts/main/Subscriptions';
import { IntervalSubscriptionsProvider } from '@ren/contexts/main/IntervalSubscriptions';
import { IntervalTasksManagerProvider } from '@ren/contexts/main/IntervalTasksManager';
import { DataBackupProvider } from '@ren/contexts/main/DataBackup';
import { CogMenuProvider } from '@ren/contexts/main/CogMenu';
import { WalletConnectProvider } from '@ren/contexts/main/WalletConnect';

// Import window contexts.
import { AccountStatusesProvider as ImportAccountStatusesProvider } from '@ren/contexts/import/AccountStatuses';
import { AddressesProvider as ImportAddressesProvider } from '@ren/contexts/import/Addresses';
import { ImportHandlerProvider } from '@ren/contexts/import/ImportHandler';
import { AddHandlerProvider } from '@ren/contexts/import/AddHandler';
import { RemoveHandlerProvider } from '@ren/contexts/import/RemoveHandler';
import { DeleteHandlerProvider } from '@ren/contexts/import/DeleteHandler';
import { LedgerHardwareProvider } from '@ren/contexts/import/LedgerHardware';
import { WalletConnectImportProvider } from '@ren/contexts/import/WalletConnectImport';

// Settings window contexts.
import { SettingFlagsProvider } from '@ren/contexts/settings/SettingFlags';
import { WebsocketServerProvider } from '@ren/contexts/settings/WebsocketServer';
import { WorkspacesProvider } from '@ren/contexts/settings/Workspaces';

// Actions window contexts.
import { TxMetaProvider } from '@ren/contexts/action';

// OpenGov window contexts.
import { TracksProvider } from '@ren/contexts/openGov/Tracks';
import { TreasuryProvider } from '@ren/contexts/openGov/Treasury';
import { ReferendaProvider } from '@ren/contexts/openGov/Referenda';
import { ReferendaSubscriptionsProvider } from '@ren/contexts/openGov/ReferendaSubscriptions';
import { TaskHandlerProvider } from '@ren/contexts/openGov/TaskHandler';
import { PolkassemblyProvider } from '@ren/contexts/openGov/Polkassembly';

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
        TooltipProvider,
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
        WalletConnectProvider
      )(Theme);
    }
    case 'import': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TooltipProvider,
        ConnectionsProvider,
        ImportAddressesProvider,
        ImportAccountStatusesProvider,
        // Requires useAccountStatuses + useAddresses
        ImportHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        AddHandlerProvider,
        // Requires useAddresses
        RemoveHandlerProvider,
        // Requires useAccountStatuses + useAddresses
        DeleteHandlerProvider,
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
        TooltipProvider,
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
        TooltipProvider,
        ConnectionsProvider,
        TxMetaProvider
      )(Theme);
    }
    case 'openGov': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TooltipProvider,
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
