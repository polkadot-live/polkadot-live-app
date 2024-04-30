// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AddressesProvider } from '@app/contexts/Addresses';
import { ChainsProvider } from '@app/contexts/Chains';
import { EventsProvider } from '@app/contexts/Events';
import { HelpProvider } from './contexts/Help';
import { OnlineStatusProvider } from '@app/contexts/OnlineStatus';
import { OverlayProvider } from '@app/contexts/Overlay';
import { SubscriptionsProvider } from '@app/contexts/Subscriptions';
import { ManageProvider } from './screens/Home/Manage/provider';
import { TooltipProvider } from '@app/contexts/Tooltip';
import { TxMetaProvider } from '@app/contexts/TxMeta';
import { withProviders } from '@app/library/Hooks/withProviders';
// Import window contexts
import { AccountStatusesProvider } from './contexts/AccountStatuses';
import { Theme } from './Theme';

export const Providers = withProviders(
  OverlayProvider,
  AddressesProvider,
  ChainsProvider,
  HelpProvider,
  SubscriptionsProvider,
  ManageProvider,
  EventsProvider,
  TxMetaProvider,
  TooltipProvider,
  AccountStatusesProvider,
  // Online status provider relies on other contexts being initialized.
  OnlineStatusProvider
)(Theme);
