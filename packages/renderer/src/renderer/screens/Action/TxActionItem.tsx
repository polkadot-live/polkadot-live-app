// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ActionItem } from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

interface TxActionItemProps {
  action: keyof typeof ComponentFactory;
  actionData: AnyData;
  chainId: ChainID;
}

// Define a map of actions to markup content.
const ComponentFactory = {
  nominationPools_pendingRewards_bond: {
    title: <h3>Nomination Pools: Compound Rewards</h3>,
    description: (
      <p>
        Once submitted, your rewards will be bonded back into the pool. You own
        these additional bonded funds and will be able to withdraw them at any
        time.
      </p>
    ),
  },
  nominationPools_pendingRewards_withdraw: {
    title: <h3>Nomination Pools: Claim Rewards</h3>,
    description: (
      <p>
        Withdrawing rewards will immediately transfer them to your account as
        free balance.
      </p>
    ),
  },
};

export const TxActionItem = ({
  action,
  actionData,
  chainId,
}: TxActionItemProps) => {
  const getSubheading = () => {
    switch (action) {
      case 'nominationPools_pendingRewards_bond':
        return `Compound ${actionData.extra} ${chainCurrency(chainId)}`;
      case 'nominationPools_pendingRewards_withdraw':
        return `Claim ${actionData.extra} ${chainCurrency(chainId)}`;
    }
  };

  return (
    <>
      {ComponentFactory[action].title}
      <div className="body">
        <ActionItem text={getSubheading()} />
        {ComponentFactory[action].description}
      </div>
    </>
  );
};
