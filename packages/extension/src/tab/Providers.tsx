// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import App from './App';
import { LedgerController } from '../controllers';
import {
  AccountStatusesProvider,
  ImportAddressesProvider,
  AddHandlerProvider,
  ConnectionsProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  HelpProvider,
  ImportHandlerProvider,
  LedgerFeedbackProvider,
  LedgerHardwareProvider,
  OverlayProvider,
  PolkassemblyProvider,
  ReferendaProvider,
  ReferendaSubscriptionsProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  SettingFlagsProvider,
  TabsProvider,
  TaskHandlerProvider,
  TracksProvider,
  TreasuryProvider,
  WcFeedbackProvider,
} from '@polkadot-live/contexts';
import {
  TxMetaProvider,
  WalletConnectProvider,
  WalletConnectImportProvider,
  WcVerifierProvider,
} from './contexts';
import { withProviders } from '@polkadot-live/ui/hooks';

export const Providers = withProviders(
  HelpProvider,
  OverlayProvider,
  ConnectionsProvider,
  SettingFlagsProvider,
  TracksProvider,
  ImportAddressesProvider,
  RemoveHandlerProvider,
  AccountStatusesProvider, // useImportAddresses, useRemoveHandler
  AddHandlerProvider, // useAccountStatuses
  ImportHandlerProvider, // useAccountStatuses
  RenameHandlerProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  TabsProvider,
  [LedgerHardwareProvider, { ledgerController: LedgerController }],
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
