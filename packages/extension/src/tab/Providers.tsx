// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AddressesProvider as ImportAddressesProvider,
  ConnectionsProvider,
  SettingFlagsProvider,
  DialogControlProvider,
} from '@polkadot-live/contexts';
import { HelpProvider, OverlayProvider } from '@polkadot-live/ui/contexts';
import {
  AccountStatusesProvider,
  AddHandlerProvider,
  DeleteHandlerProvider,
  ImportHandlerProvider,
  LedgerFeedbackProvider,
  LedgerHardwareProvider,
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  TabsProvider,
  TaskHandlerProvider,
  TracksProvider,
  TreasuryProvider,
  TxMetaProvider,
  WalletConnectProvider,
  WalletConnectImportProvider,
  WcFeedbackProvider,
  WcVerifierProvider,
} from './contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  OverlayProvider,
  ConnectionsProvider,
  SettingFlagsProvider,
  TracksProvider,
  ImportAddressesProvider,
  RemoveHandlerProvider,
  AccountStatusesProvider, // useAddresses, useRemoveHandler
  AddHandlerProvider, // useAccountStatuses
  ImportHandlerProvider, // useAccountStatuses
  RenameHandlerProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  TabsProvider,
  LedgerHardwareProvider,
  WcFeedbackProvider,
  WalletConnectProvider,
  WalletConnectImportProvider,
  WcVerifierProvider,
  LedgerFeedbackProvider,
  TxMetaProvider,
  TreasuryProvider,
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  TaskHandlerProvider
)(App);
