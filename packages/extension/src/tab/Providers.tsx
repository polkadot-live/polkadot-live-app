// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountStatusesProvider,
  AddressesProvider as ImportAddressesProvider,
  ConnectionsProvider,
  DialogControlProvider,
  ImportHandlerProvider,
  RemoveHandlerProvider,
  SettingFlagsProvider,
} from '@polkadot-live/contexts';
import { HelpProvider, OverlayProvider } from '@polkadot-live/ui/contexts';
import {
  AddHandlerProvider,
  DeleteHandlerProvider,
  LedgerFeedbackProvider,
  LedgerHardwareProvider,
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
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
