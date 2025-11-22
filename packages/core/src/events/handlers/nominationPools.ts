// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getBalanceText } from '../../library';
import { handleEvent } from '../../callbacks/utils';
import { makeChainEvent } from './utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { PalletNominationPoolsEvent } from '@polkadot-live/types';

export const handleNominationPoolsEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletNominationPoolsEvent
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getNominationPoolsChainEvent(chainId, palletEvent),
        notification: getNominationPoolsNotification(chainId, palletEvent),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

const getNominationPoolsNotification = (
  chainId: ChainID,
  palletEvent: PalletNominationPoolsEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Created': {
      const { /* depositor, */ poolId } = miscData;
      return {
        title: 'Created',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} created`,
      };
    }
    case 'Bonded': {
      const { /* member, */ poolId /*, bonded, joined */ } = miscData;
      return {
        title: 'Bonded',
        subtitle: `${chainId}`,
        body: `Member bonded to pool ${poolId}`,
      };
    }
    case 'PaidOut': {
      const { /* member, */ poolId, payout } = miscData;
      return {
        title: 'Paid Out',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} paid out ${getBalanceText(payout, chainId)}`,
      };
    }
    case 'Unbonded': {
      const { /* member, */ poolId, balance /*, points, era */ } = miscData;
      return {
        title: 'Unbonded',
        subtitle: `${chainId}`,
        body: `${getBalanceText(balance, chainId)} unbonded from pool ${poolId}`,
      };
    }
    case 'Withdrawn': {
      const { /* member, */ poolId, balance /*, points */ } = miscData;
      return {
        title: 'Withdrawn',
        subtitle: `${chainId}`,
        body: `${getBalanceText(balance, chainId)} withdrawn from pool ${poolId}`,
      };
    }
    case 'Destroyed': {
      const { poolId } = miscData;
      return {
        title: 'Destroyed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'StateChanged': {
      const { poolId, newState } = miscData;
      return {
        title: 'State Changed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} state changed to ${newState}`,
      };
    }
    case 'MemberRemoved': {
      const { poolId /* ,member  releasedBalance */ } = miscData;
      return {
        title: 'Pool Member Removed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolSlashed': {
      const { poolId, balance } = miscData;
      return {
        title: 'Pool Slashed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} slashed ${getBalanceText(balance, chainId)}`,
      };
    }
    case 'UnbondingPoolSlashed': {
      const { poolId /*, era */, balance } = miscData;
      return {
        title: 'Unbonding Pool Slashed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} slashed ${getBalanceText(balance, chainId)}`,
      };
    }
    case 'PoolCommissionUpdated': {
      const { poolId /*, current */ } = miscData;
      return {
        title: 'Pool Commission Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionChangeRateUpdated': {
      const { poolId /*, changeRate */ } = miscData;
      return {
        title: 'Pool Commission Change Rate Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionClaimPermissionUpdated': {
      const { poolId /*, permission */ } = miscData;
      return {
        title: 'Pool Commission Claim Permission Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionClaimed': {
      const { poolId /*, commission */ } = miscData;
      return {
        title: 'Pool Commission Claimed',
        subtitle: `Pool ${poolId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'MetadataUpdated': {
      const { poolId /*, caller */ } = miscData;
      return {
        title: 'Pool Metadata Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getNominationPoolsChainEvent = (
  chainId: ChainID,
  palletEvent: PalletNominationPoolsEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'nominationPools' });

  switch (eventName) {
    case 'Created': {
      const { /* depositor, */ poolId } = miscData;
      ev.title = 'Created';
      ev.subtitle = `Pool ${poolId} created`;
      return ev;
    }
    case 'Bonded': {
      const { /* member, */ poolId, bonded /*, joined */ } = miscData;
      ev.title = 'Bonded';
      ev.subtitle = `${getBalanceText(bonded, chainId)} bonded to pool ${poolId}`;
      return ev;
    }
    case 'PaidOut': {
      const { /* member, */ poolId, payout } = miscData;
      ev.title = 'Pool Payout';
      ev.subtitle = `Pool ${poolId} paid out ${getBalanceText(payout, chainId)}`;
      return ev;
    }
    case 'Unbonded': {
      const { /* member, */ poolId, balance /*, points, era */ } = miscData;
      ev.title = 'Unbonded';
      ev.subtitle = `${getBalanceText(balance, chainId)} unbonded from pool ${poolId}`;
      return ev;
    }
    case 'Withdrawn': {
      const { /* member, */ poolId, balance /*, points */ } = miscData;
      ev.title = 'Withdrawn';
      ev.subtitle = `${getBalanceText(balance, chainId)} withdrawn from pool ${poolId}`;
      return ev;
    }
    case 'Destroyed': {
      const { poolId } = miscData;
      ev.title = 'Destroyed';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'StateChanged': {
      const { poolId, newState } = miscData;
      ev.title = 'State Changed';
      ev.subtitle = `Pool ${poolId} state changed to ${newState}`;
      return ev;
    }
    case 'MemberRemoved': {
      const { poolId /*, member, releasedBalance */ } = miscData;
      ev.title = 'Member Removed';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'PoolSlashed': {
      const { poolId, balance } = miscData;
      ev.title = 'Pool Slashed';
      ev.subtitle = `Pool ${poolId} slashed with new balance ${getBalanceText(balance, chainId)}`;
      return ev;
    }
    case 'UnbondingPoolSlashed': {
      const { poolId /*, era */, balance } = miscData;
      ev.title = 'Unbonding Pool Slashed';
      ev.subtitle = `Pool ${poolId} slashed with new balance ${getBalanceText(balance, chainId)}`;
      return ev;
    }
    case 'PoolCommissionUpdated': {
      const { poolId /*, current */ } = miscData;
      ev.title = 'Pool Commission Updated';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'PoolCommissionChangeRateUpdated': {
      const { poolId /*, changeRate */ } = miscData;
      ev.title = 'Pool Commission Change Rate Updated';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'PoolCommissionClaimPermissionUpdated': {
      const { poolId /*, permission */ } = miscData;
      ev.title = 'Pool Commission Claim Permission Updated';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'PoolCommissionClaimed': {
      const { poolId /*, commission */ } = miscData;
      ev.title = 'Pool Commission Claimed';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    case 'MetadataUpdated': {
      const { poolId /*, caller */ } = miscData;
      ev.title = 'Pool Metadata Updated';
      ev.subtitle = `Pool ${poolId}`;
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
