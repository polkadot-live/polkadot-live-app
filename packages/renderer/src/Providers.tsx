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
  WalletConnectImportProvider,
} from '@ren/contexts/import';

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
        AccountStatusesProvider,
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
