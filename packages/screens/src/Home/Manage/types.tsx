// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { SubscriptionTaskType } from '@polkadot-live/types/subscriptions';

export interface ManageProps {
  addresses: FlattenedAccountData[];
}

export interface AccountsProps {
  addresses: FlattenedAccountData[];
  setBreadcrumb: (s: string) => void;
  setTasksChainId: React.Dispatch<React.SetStateAction<ChainID | null>>;
  setSection: (n: number) => void;
  setTypeClicked: (t: SubscriptionTaskType) => void;
}
