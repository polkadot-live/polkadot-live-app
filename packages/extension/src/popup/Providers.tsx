// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AddressesProvider,
  ApiHealthProvider,
  AppSettingsProvider,
  ChainsProvider,
  ConnectionsProvider,
  IntervalSubscriptionsProvider,
  IntervalTasksManagerProvider,
  ManageProvider,
  SubscriptionsProvider,
} from '@polkadot-live/contexts';
import { HelpProvider, SideNavProvider } from '@polkadot-live/ui/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import {
  BootstrappingProvider,
  CogMenuProvider,
  EventsProvider,
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
