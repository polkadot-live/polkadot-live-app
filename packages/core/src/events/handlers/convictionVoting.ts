// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@polkadot-live/consts/chains';
import { ellipsisFn } from '@w3ux/utils';
import { handleEvent } from '../../callbacks/utils';
import { makeChainEvent } from './utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { PalletConvictionVotingEvent } from '@polkadot-live/types';

export const handleConvictionVotingEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletConvictionVotingEvent
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getConvictionVotingChainEvent(chainId, palletEvent),
        notification: getConvictionVotingNotification(chainId, palletEvent),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getConvictionVotingPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletConvictionVotingEvent
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const prefix = ChainList.get(chainId)?.prefix ?? 42;
  switch (eventName) {
    case 'Delegated': {
      const [account] = miscData;
      return [account.address(prefix).toString()];
    }
    case 'Undelegated': {
      if (Array.isArray(miscData)) {
        const [account] = miscData;
        return [account.address(prefix).toString()];
      } else {
        return [miscData.address(prefix).toString()];
      }
    }
    case 'Voted':
    case 'VoteRemoved':
    case 'VoteUnlocked': {
      return [miscData.who.address(prefix).toString()];
    }
    default:
      return [];
  }
};

const getConvictionVotingNotification = (
  chainId: ChainID,
  palletEvent: PalletConvictionVotingEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Delegated': {
      const [, target] = miscData;
      return {
        title: 'Vote Delegated',
        subtitle: `${chainId}`,
        body: `Vote delegated to ${ellipsisFn(target.address().toString())}`,
      };
    }
    case 'Undelegated': {
      /* const account = miscData; */
      return {
        title: 'Vote Undelegated',
        subtitle: `${chainId}`,
        body: 'Vote undelegated from account',
      };
    }
    case 'Voted': {
      /* const { who, vote } = miscData; */
      return {
        title: 'Voted',
        subtitle: `${chainId}`,
        body: 'An account has voted',
      };
    }
    case 'VoteRemoved': {
      /* const { who, vote } = miscData; */
      return {
        title: 'Vote Removed',
        subtitle: `${chainId}`,
        body: 'A vote has been removed',
      };
    }
    case 'VoteUnlocked': {
      /* const { who } = miscData; */
      return {
        title: 'Vote Unlocked',
        subtitle: `${chainId}`,
        body: 'Conviction vote lockup period has expired',
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getConvictionVotingChainEvent = (
  chainId: ChainID,
  palletEvent: PalletConvictionVotingEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'voting' });

  switch (eventName) {
    case 'Delegated': {
      const [, target] = miscData;
      ev.title = 'Vote Delegated';
      ev.subtitle = `Vote delegated to ${ellipsisFn(target.address().toString())}`;
      return ev;
    }
    case 'Undelegated': {
      /* const account = miscData; */
      ev.title = 'Vote Undelegated';
      ev.subtitle = 'Vote undelegated from account';
      return ev;
    }
    case 'Voted': {
      /* const { who, vote } = miscData; */
      ev.title = 'Voted';
      ev.subtitle = 'An account has voted';
      return ev;
    }
    case 'VoteRemoved': {
      /* const { who , vote } = miscData; */
      ev.title = 'Vote Removed';
      ev.subtitle = 'A vote has been removed';
      return ev;
    }
    case 'VoteUnlocked': {
      /* const { who } = miscData; */
      ev.title = 'Vote Unlocked';
      ev.subtitle = 'Conviction vote lockup period has expired';
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
