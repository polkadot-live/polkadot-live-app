// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountStatusesProvider,
  AddHandlerProvider,
  ConnectionsProvider,
  DeleteHandlerProvider,
  DialogControlProvider,
  HelpProvider,
  ImportAddressesProvider,
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
import { withProviders } from '@polkadot-live/ui';
import { LedgerController } from '../controllers';
import App from './App';
import {
  TxMetaProvider,
  WalletConnectImportProvider,
  WalletConnectProvider,
  WcVerifierProvider,
} from './contexts';

export const Providers = withProviders(
  HelpProvider,
  OverlayProvider,
  TabsProvider,
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
  TaskHandlerProvider,
)(App);
