// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HelpProvider, SideNavProvider } from '@polkadot-live/ui/contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import {
  AppSettingsProvider,
  BootstrappingProvider,
  CogMenuProvider,
} from './contexts';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  SideNavProvider,
  BootstrappingProvider,
  AppSettingsProvider,
  CogMenuProvider
)(App);
