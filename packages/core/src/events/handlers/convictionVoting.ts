// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSs58Prefix } from '@polkadot-live/consts/chains';
import { encodeRecord } from '@polkadot-live/encoder';
import { ellipsisFn } from '@w3ux/utils';
import { handleEvent } from '../../callbacks/utils';
import { makeChainEvent, notifyTitle } from './utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { PalletConvictionVotingEvent } from '@polkadot-live/types';
import type { WhoMeta } from '../types';

export const handleConvictionVotingEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletConvictionVotingEvent,
  whoMeta?: WhoMeta
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getConvictionVotingChainEvent(chainId, palletEvent, whoMeta),
        notification: getConvictionVotingNotification(
          chainId,
          palletEvent,
          whoMeta
        ),
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
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Delegated': {
      const [account] = miscData;
      return [account.address(ss58Prefix).toString()];
    }
    case 'Undelegated': {
      if (Array.isArray(miscData)) {
        const [account] = miscData;
        return [account.address(ss58Prefix).toString()];
      } else {
        return [miscData.address(ss58Prefix).toString()];
      }
    }
    case 'Voted':
    case 'VoteRemoved':
    case 'VoteUnlocked': {
      return [miscData.who.address(ss58Prefix).toString()];
    }
    default:
      return [];
  }
};

const getConvictionVotingNotification = (
  chainId: ChainID,
  palletEvent: PalletConvictionVotingEvent,
  whoMeta?: WhoMeta
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Delegated': {
      const [, target] = miscData;
      return {
        title: notifyTitle('Vote Delegated', whoMeta),
        subtitle: `${chainId}`,
        body: `Vote delegated to ${ellipsisFn(target.address().toString())}`,
      };
    }
    case 'Undelegated': {
      return {
        title: notifyTitle('Vote Undelegated', whoMeta),
        subtitle: `${chainId}`,
        body: 'Vote undelegated from account',
      };
    }
    case 'Voted': {
      return {
        title: notifyTitle('Voted', whoMeta),
        subtitle: `${chainId}`,
        body: 'An account has voted',
      };
    }
    case 'VoteRemoved': {
      return {
        title: notifyTitle('Vote Removed', whoMeta),
        subtitle: `${chainId}`,
        body: 'A vote has been removed',
      };
    }
    case 'VoteUnlocked': {
      return {
        title: notifyTitle('Vote Unlocked', whoMeta),
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
  palletEvent: PalletConvictionVotingEvent,
  whoMeta?: WhoMeta
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'voting' }, whoMeta);
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Delegated': {
      const [who, target] = miscData;
      ev.title = 'Vote Delegated';
      ev.subtitle = `Vote delegated to ${ellipsisFn(target.address().toString())}`;
      ev.encodedInfo = encodeRecord({
        Who: [who, { ss58Prefix }],
        Target: [target, { ss58Prefix }],
      });
      return ev;
    }
    case 'Undelegated': {
      const account = miscData;
      ev.title = 'Vote Undelegated';
      ev.subtitle = 'Vote undelegated from account';
      ev.encodedInfo = encodeRecord({ Who: [account, { ss58Prefix }] });
      return ev;
    }
    case 'Voted': {
      const { who /*, vote */ } = miscData;
      ev.title = 'Voted';
      ev.subtitle = 'An account has voted';
      ev.encodedInfo = encodeRecord({ Who: [who, { ss58Prefix }] });
      return ev;
    }
    case 'VoteRemoved': {
      const { who /*, vote */ } = miscData;
      ev.title = 'Vote Removed';
      ev.subtitle = 'A vote has been removed';
      ev.encodedInfo = encodeRecord({ Who: [who, { ss58Prefix }] });
      return ev;
    }
    case 'VoteUnlocked': {
      const { who } = miscData;
      ev.title = 'Vote Unlocked';
      ev.subtitle = 'Conviction vote lockup period has expired';
      ev.encodedInfo = encodeRecord({ Who: [who, { ss58Prefix }] });
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
