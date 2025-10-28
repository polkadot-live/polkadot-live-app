// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConnectionsProvider } from '../contexts';
import { DialogControlProvider } from '@polkadot-live/contexts';
import { HelpProvider, OverlayProvider } from '@polkadot-live/ui/contexts';
import {
  AccountStatusesProvider,
  AddHandlerProvider,
  DeleteHandlerProvider,
  ImportAddressesProvider,
  ImportHandlerProvider,
  LedgerFeedbackProvider,
  LedgerHardwareProvider,
  RemoveHandlerProvider,
  RenameHandlerProvider,
  SettingFlagsProvider,
  TabsProvider,
  TxMetaProvider,
  WalletConnectProvider,
  WalletConnectImportProvider,
} from './contexts';
import { withProviders } from '@polkadot-live/ui/hooks';
import App from './App';

export const Providers = withProviders(
  HelpProvider,
  OverlayProvider,
  SettingFlagsProvider,
  ConnectionsProvider,
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
  WalletConnectProvider,
  WalletConnectImportProvider,
  LedgerFeedbackProvider,
  TxMetaProvider
)(App);
