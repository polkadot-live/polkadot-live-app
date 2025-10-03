// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HelpProvider, SideNavProvider } from '@polkadot-live/ui/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import {
  ApiHealthProvider,
  AppSettingsProvider,
  BootstrappingProvider,
  ChainsProvider,
  CogMenuProvider,
} from './contexts';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  SideNavProvider,
  ApiHealthProvider,
  ChainsProvider,
  BootstrappingProvider,
  AppSettingsProvider,
  CogMenuProvider
)(App);
