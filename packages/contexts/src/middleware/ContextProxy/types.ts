// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DialogControlContextInterface } from '../../import/DialogControl/types';
import type { SettingFlagsContextInterface } from '../../types/settings';
import type { TabsContextInterface } from '../../types/tabs';

import type {
  LedgerFeedbackContextInterface,
  TxMetaContextInterface,
  WcFeedbackContextInterface,
  WcVerifierContextInterface,
} from '../../types/action';
import type {
  ConnectionsContextInterface,
  HelpContextInterface,
  OverlayContextInterface,
  SideNavContextInterface,
} from '../../types/common';
import type {
  AccountStatusesContextInterface,
  AddHandlerContextInterface,
  DeleteHandlerContextInterface,
  AddressesContextInterface as ImportAddressesContextInterface,
  ImportHandlerContextInterface,
  LedgerHardwareContextInterface,
  RemoveHandlerContextInterface,
  RenameHandlerContextInterface,
  WalletConnectImportContextInterface,
} from '../../types/import';
import type {
  AddressesContextInterface,
  ApiHealthContextInterface,
  AppSettingsContextInterface,
  BootstrappingInterface,
  ChainsContextInterface,
  CogMenuContextInterface,
  DataBackupContextInterface,
  EventsContextInterface,
  IntervalSubscriptionsContextInterface,
  IntervalTasksManagerContextInterface,
  LedgerSignerContextInterface,
  ManageContextInterface,
  SubscriptionsContextInterface,
  TreasuryApiContextInterface,
  WalletConnectContextInterface,
} from '../../types/main';
import type {
  PolkassemblyContextInterface,
  ReferendaContextInterface,
  ReferendaSubscriptionsContextInterface,
  TaskHandlerContextInterface,
  TracksContextInterface,
  TreasuryContextInterface,
} from '../../types/openGov';

export interface ContextProxyInterface {
  useCtx: <T extends keyof ContextsMap>(key: T) => ContextValue<T>;
}

export type ContextValue<T extends keyof ContextsMap> = ContextsMap[T];

/**
 * TODO: Create multiple maps for the separate views.
 */
export interface ContextsMap {
  /** Common */
  ConnectionsCtx: () => ConnectionsContextInterface;
  HelpCtx: () => HelpContextInterface;
  OverlayCtx: () => OverlayContextInterface;
  SideNavCtx: () => SideNavContextInterface;

  /** Extrinsics */
  TxMetaCtx: () => TxMetaContextInterface;
  WcVerifierCtx: () => WcVerifierContextInterface;
  LedgerFeedbackCtx: () => LedgerFeedbackContextInterface;
  WcFeedbackCtx: () => WcFeedbackContextInterface;

  /** Import */
  DialogControlCtx: () => DialogControlContextInterface;
  ImportAddressesCtx: () => ImportAddressesContextInterface;
  AccountStatusesCtx: () => AccountStatusesContextInterface;
  ImportHandlerCtx: () => ImportHandlerContextInterface;
  AddHandlerCtx: () => AddHandlerContextInterface;
  RemoveHandlerCtx: () => RemoveHandlerContextInterface;
  DeleteHandlerCtx: () => DeleteHandlerContextInterface;
  RenameHandlerCtx: () => RenameHandlerContextInterface;
  LedgerHardwareCtx: () => LedgerHardwareContextInterface;
  WalletConnectImportCtx: () => WalletConnectImportContextInterface;

  /** Main */
  AddressesCtx: () => AddressesContextInterface;
  AppSettingsCtx: () => AppSettingsContextInterface;
  ApiHealthCtx: () => ApiHealthContextInterface;
  TreasuryApiCtx: () => TreasuryApiContextInterface;
  ChainsCtx: () => ChainsContextInterface;
  SubscriptionsCtx: () => SubscriptionsContextInterface;
  IntervalSubscriptionsCtx: () => IntervalSubscriptionsContextInterface;
  IntervalTaskManageCtx: () => IntervalTasksManagerContextInterface;
  EventsCtx: () => EventsContextInterface;
  BootstrappingCtx: () => BootstrappingInterface;
  DataBackupCtx: () => DataBackupContextInterface;
  CogMenuCtx: () => CogMenuContextInterface;
  WalletConnectCtx: () => WalletConnectContextInterface;
  LedgerSigningCtx: () => LedgerSignerContextInterface;
  ManageCtx: () => ManageContextInterface;

  /** OpenGov */
  TracksCtx: () => TracksContextInterface;
  TreasuryCtx: () => TreasuryContextInterface;
  PolkassemblyCtx: () => PolkassemblyContextInterface;
  ReferendaCtx: () => ReferendaContextInterface;
  referendasubscriptionsCtx: () => ReferendaSubscriptionsContextInterface;
  TaskHandlerCtx: () => TaskHandlerContextInterface;

  /** Settings */
  SettingFlagsCtx: () => SettingFlagsContextInterface;

  /** Tabs */
  TabsCtx: () => TabsContextInterface;
}
