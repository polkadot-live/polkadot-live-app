// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// General contexts.
import { HelpProvider } from '@/renderer/contexts/common/Help';
import { OverlayProvider } from '@/renderer/contexts/common/Overlay';
import { TooltipProvider } from '@/renderer/contexts/common/Tooltip';

// Main window contexts.
import { AddressesProvider } from '@/renderer/contexts/main/Addresses';
import { BootstrappingProvider } from '@app/contexts/main/Bootstrapping';
import { ChainsProvider } from '@/renderer/contexts/main/Chains';
import { EventsProvider } from '@/renderer/contexts/main/Events';
import { ManageProvider } from '@/renderer/contexts/main/Manage';
import { SubscriptionsProvider } from '@app/contexts/main/Subscriptions';
import { IntervalSubscriptionsProvider } from './contexts/main/IntervalSubscriptions';

// Import window contexts.
import { AccountStatusesProvider as ImportAccountStatusesProvider } from '@app/contexts/import/AccountStatuses';
import { AddressesProvider as ImportAddressesProvider } from '@app/contexts/import/Addresses';
import { ConnectionsProvider as ImportConnectionsProvider } from '@app/contexts/import/Connections';

// Settings window contexts.
import { SettingFlagsProvider } from './contexts/settings/SettingFlags';

// Actions window contexts.
import { TxMetaProvider } from '@/renderer/contexts/action/TxMeta';

// OpenGov window contexts.
import { TracksProvider } from './contexts/openGov/Tracks';
import { TreasuryProvider } from './contexts/openGov/Treasury';
import { ReferendaProvider } from './contexts/openGov/Referenda';
import { ReferendaSubscriptionsProvider } from './contexts/openGov/ReferendaSubscriptions';

// Other imports.
import { Theme } from './Theme';
import { withProviders } from '@app/library/Hooks/withProviders';

const getProvidersForWindow = () => {
  const windowId = window.myAPI.getWindowId();

  switch (windowId) {
    case 'main': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TooltipProvider,
        AddressesProvider,
        ChainsProvider,
        SubscriptionsProvider,
        IntervalSubscriptionsProvider,
        ManageProvider,
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
        ImportAddressesProvider,
        ImportAccountStatusesProvider,
        ImportConnectionsProvider
      )(Theme);
    }
    case 'settings': {
      return withProviders(
        HelpProvider,
        OverlayProvider,
        TooltipProvider,
        SettingFlagsProvider
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
        TracksProvider,
        TreasuryProvider,
        ReferendaProvider,
        ReferendaSubscriptionsProvider
      )(Theme);
    }
    default: {
      throw new Error('Window ID not recognized.');
    }
  }
};

export const Providers = getProvidersForWindow();
