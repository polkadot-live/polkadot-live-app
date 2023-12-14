// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountStateProvider } from '@app/contexts/AccountState';
import { AddressesProvider } from '@app/contexts/Addresses';
import { ChainsProvider } from '@app/contexts/Chains';
import { EventsProvider } from '@app/contexts/Events';
import { OverlayProvider } from '@app/contexts/Overlay';
import { SubscriptionsProvider } from './contexts/Subscriptions';
import { ManageProvider } from './screens/Home/Manage/provider';
import { TooltipProvider } from '@app/contexts/Tooltip';
import { TxMetaProvider } from '@app/contexts/TxMeta';
import { withProviders } from '@app/library/Hooks/withProviders';
import { Theme } from './Theme';

export const Providers = withProviders(
  OverlayProvider,
  AddressesProvider,
  AccountStateProvider,
  ChainsProvider,
  SubscriptionsProvider,
  ManageProvider,
  EventsProvider,
  TxMetaProvider,
  TooltipProvider
)(Theme);
