// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConnectionsProvider } from '../contexts';
import { HelpProvider, SideNavProvider } from '@polkadot-live/ui/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import {
  AddressesProvider,
  ApiHealthProvider,
  AppSettingsProvider,
  BootstrappingProvider,
  ChainsProvider,
  CogMenuProvider,
  EventsProvider,
  IntervalSubscriptionsProvider,
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
  EventsProvider,
  BootstrappingProvider,
  CogMenuProvider,
  SummaryProvider
)(App);
