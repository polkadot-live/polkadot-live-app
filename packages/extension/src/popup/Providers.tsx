// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AddressesProvider,
  ApiHealthProvider,
  AppSettingsProvider,
  ChainEventsProvider,
  ChainsProvider,
  ConnectionsProvider,
  EventsProvider,
  HelpProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  ManageProvider,
  SideNavProvider,
  SubscriptionsProvider,
  SummaryProvider,
} from '@polkadot-live/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import { BootstrappingProvider, CogMenuProvider } from './contexts';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  AppSettingsProvider,
  ConnectionsProvider,
  AddressesProvider,
  SideNavProvider,
  ApiHealthProvider,
  ChainsProvider,
  ChainEventsProvider,
  ManageProvider,
  SubscriptionsProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  EventsProvider,
  BootstrappingProvider,
  CogMenuProvider,
  SummaryProvider
)(App);
