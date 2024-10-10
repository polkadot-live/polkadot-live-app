// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import { HelpProvider } from '@/renderer/contexts/common/Help';
import { OverlayProvider } from '@/renderer/contexts/common/Overlay';
import { TooltipProvider } from '@/renderer/contexts/common/Tooltip';
import { ConnectionsProvider } from '@/renderer/contexts/common/Connections';

// Tabs contexts.
import { TabsProvider } from '@/renderer/contexts/tabs/Tabs';

// Main window contexts.
import { AddressesProvider } from '@/renderer/contexts/main/Addresses';
import { AppSettingsProvider } from '@/renderer/contexts/main/AppSettings';
import { BootstrappingProvider } from '@app/contexts/main/Bootstrapping';
import { ChainsProvider } from '@/renderer/contexts/main/Chains';
import { EventsProvider } from '@/renderer/contexts/main/Events';
import { ManageProvider } from '@/renderer/contexts/main/Manage';
import { SubscriptionsProvider } from '@app/contexts/main/Subscriptions';
import { IntervalSubscriptionsProvider } from './contexts/main/IntervalSubscriptions';
import { IntervalTasksManagerProvider } from './contexts/main/IntervalTasksManager';

// Import window contexts.
import { AccountStatusesProvider as ImportAccountStatusesProvider } from '@app/contexts/import/AccountStatuses';
import { AddressesProvider as ImportAddressesProvider } from '@app/contexts/import/Addresses';
import { ImportHandlerProvider } from './contexts/import/ImportHandler';
import { AddHandlerProvider } from './contexts/import/AddHandler';
import { RemoveHandlerProvider } from './contexts/import/RemoveHandler';
import { DeleteHandlerProvider } from './contexts/import/DeleteHandler';

// Settings window contexts.
import { SettingFlagsProvider } from './contexts/settings/SettingFlags';
import { WebsocketServerProvider } from './contexts/settings/WebsocketServer';
import { WorkspacesProvider } from './contexts/settings/Workspaces';

// Actions window contexts.
import { TxMetaProvider } from '@/renderer/contexts/action/TxMeta';

// OpenGov window contexts.
import { TracksProvider } from './contexts/openGov/Tracks';
import { TreasuryProvider } from './contexts/openGov/Treasury';
import { ReferendaProvider } from './contexts/openGov/Referenda';
import { ReferendaSubscriptionsProvider } from './contexts/openGov/ReferendaSubscriptions';
import { TaskHandlerProvider } from './contexts/openGov/TaskHandler';
import { PolkassemblyProvider } from './contexts/openGov/Polkassembly';

// Other imports.
import { Theme } from './Theme';
import { withProviders } from '@app/library/Hooks/withProviders';

const getProvidersForWindow = () => {
  const windowId = window.myAPI.getWindowId();

  switch (windowId) {
    case 'tabs': {
      return withProviders(TabsProvider)(Theme);
    }
    case 'main': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TooltipProvider,
        ConnectionsProvider,
        AddressesProvider,
        AppSettingsProvider,
        ChainsProvider,
        SubscriptionsProvider,
        IntervalSubscriptionsProvider,
        ManageProvider,
        IntervalTasksManagerProvider,
        EventsProvider,
        // Online status relies on other contexts being initialized.
        BootstrappingProvider
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
