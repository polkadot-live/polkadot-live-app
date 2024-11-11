// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import { HelpProvider } from '@app/contexts/common/Help';
import { OverlayProvider } from '@app/contexts/common/Overlay';
import { TooltipProvider } from '@app/contexts/common/Tooltip';
import { ConnectionsProvider } from '@app/contexts/common/Connections';

// Tabs contexts.
import { TabsProvider } from '@ren/renderer/contexts/tabs/Tabs';

// Main window contexts.
import { SideNavProvider } from './library/contexts';
import { AddressesProvider } from '@app/contexts/main/Addresses';
import { AppSettingsProvider } from '@app/contexts/main/AppSettings';
import { BootstrappingProvider } from '@app/contexts/main/Bootstrapping';
import { ChainsProvider } from '@app/contexts/main/Chains';
import { EventsProvider } from '@app/contexts/main/Events';
import { ManageProvider } from '@app/contexts/main/Manage';
import { SubscriptionsProvider } from '@app/contexts/main/Subscriptions';
import { IntervalSubscriptionsProvider } from '@app/contexts/main/IntervalSubscriptions';
import { IntervalTasksManagerProvider } from '@app/contexts/main/IntervalTasksManager';
import { DataBackupProvider } from '@app/contexts/main/DataBackup';

// Import window contexts.
import { AccountStatusesProvider as ImportAccountStatusesProvider } from '@app/contexts/import/AccountStatuses';
import { AddressesProvider as ImportAddressesProvider } from '@app/contexts/import/Addresses';
import { ImportHandlerProvider } from '@app/contexts/import/ImportHandler';
import { AddHandlerProvider } from '@app/contexts/import/AddHandler';
import { RemoveHandlerProvider } from '@app/contexts/import/RemoveHandler';
import { DeleteHandlerProvider } from '@app/contexts/import/DeleteHandler';

// Settings window contexts.
import { SettingFlagsProvider } from '@app/contexts/settings/SettingFlags';
import { WebsocketServerProvider } from '@app/contexts/settings/WebsocketServer';
import { WorkspacesProvider } from '@app/contexts/settings/Workspaces';

// Actions window contexts.
import { TxMetaProvider } from '@app/contexts/action/TxMeta';

// OpenGov window contexts.
import { TracksProvider } from '@app/contexts/openGov/Tracks';
import { TreasuryProvider } from '@app/contexts/openGov/Treasury';
import { ReferendaProvider } from '@app/contexts/openGov/Referenda';
import { ReferendaSubscriptionsProvider } from '@app/contexts/openGov/ReferendaSubscriptions';
import { TaskHandlerProvider } from '@app/contexts/openGov/TaskHandler';
import { PolkassemblyProvider } from '@app/contexts/openGov/Polkassembly';

// Other imports.
import { Theme } from './Theme';
import { withProviders } from '@ren/renderer/library/hooks/withProviders';

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
        DataBackupProvider
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
        ImportHandlerProvider, // Requires useAccountStatuses + useAddresses
        AddHandlerProvider, // Requires useAccountStatuses + useAddresses
        RemoveHandlerProvider, // Requires useAddresses
        DeleteHandlerProvider // Requires useAccountStatuses + useAddresses
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