// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AddressesProvider,
  ApiHealthProvider,
  AppSettingsProvider,
  ChainsProvider,
  ConnectionsProvider,
} from '@polkadot-live/contexts';
import { HelpProvider, SideNavProvider } from '@polkadot-live/ui/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import {
  BootstrappingProvider,
  CogMenuProvider,
  EventsProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  ManageProvider,
  SubscriptionsProvider,
  SummaryProvider,
} from './contexts';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  AppSettingsProvider,
  ConnectionsProvider,
  AddressesProvider,
  SideNavProvider,
  ApiHealthProvider,
  ChainsProvider,
  ManageProvider,
  SubscriptionsProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  EventsProvider,
  BootstrappingProvider,
  CogMenuProvider,
  SummaryProvider
)(App);
