// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HelpProvider, OverlayProvider } from '@polkadot-live/ui/contexts';
import { TabsProvider } from './contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  OverlayProvider,
  TabsProvider
)(App);
