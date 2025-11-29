// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@polkadot-live/consts/chains';
import { ellipsisFn } from '@w3ux/utils';
import { getBalanceText } from '../../library';
import { handleEvent } from '../../callbacks/utils';
import { makeChainEvent } from './utils';
import type { PalletStakingEvent } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export const handleStakingEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletStakingEvent
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getStakingChainEvent(chainId, palletEvent),
        notification: getStakingNotification(chainId, palletEvent),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getStakingPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const prefix = ChainList.get(chainId)?.prefix ?? 42;
  switch (eventName) {
    case 'Rewarded': {
      const { dest } = miscData;
      return dest.type === 'Account'
        ? [dest.value.address(prefix).toString()]
        : [];
    }
    case 'Slashed':
      return [miscData.staker.address(prefix).toString()];
    case 'Kicked':
      return [miscData.nominator.address(prefix).toString()];
    case 'Bonded':
    case 'Unbonded':
    case 'Chilled':
      return [miscData.stash.address(prefix).toString()];
    default:
      return [];
  }
};

const getStakingNotification = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'EraPaid': {
      const { eraIndex, validatorPayout, remainder } = miscData;
      const payout = getBalanceText(validatorPayout, chainId);
      const rem = getBalanceText(remainder, chainId);
      return {
        title: 'Era Paid',
        subtitle: `Era ${eraIndex}`,
        body: `${payout} validator payout with ${rem} remainder`,
      };
    }
    case 'Rewarded': {
      const { /* stash, dest, */ amount } = miscData;
      return {
        title: 'Nominator Rewarded',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Slashed': {
      const { /* staker, */ amount } = miscData;
      return {
        title: 'Staker Slashed',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Bonded': {
      const { /* stash, */ amount } = miscData;
      return {
        title: `Bonded`,
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unbonded': {
      const { /* stash, */ amount } = miscData;
      return {
        title: `Unbonded`,
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Kicked': {
      const { nominator /*, stash */ } = miscData;
      return {
        title: `Nominator Kicked`,
        subtitle: `${chainId}`,
        body: `${ellipsisFn(nominator.address().toString(), 5)}`,
      };
    }
    case 'Chilled': {
      const { stash } = miscData;
      return {
        title: `Account Chilled`,
        subtitle: `${chainId}`,
        body: `${ellipsisFn(stash.address().toString(), 5)}`,
      };
    }
    case 'ValidatorPrefsSet': {
      /* const {  stash, prefs  } = miscData; */
      return {
        title: `Validator Preferences Set`,
        subtitle: `${chainId}`,
        body: `Validator preferences set`,
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getStakingChainEvent = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'staking' });

  switch (eventName) {
    case 'EraPaid': {
      const { validatorPayout, remainder } = miscData;
      const payout = getBalanceText(validatorPayout, chainId);
      const rem = getBalanceText(remainder, chainId);
      ev.title = 'Era Paid';
      ev.subtitle = `${payout} validator payout with ${rem} remainder`;
      return ev;
    }
    case 'Rewarded': {
      const { /* stash, dest, */ amount } = miscData;
      ev.title = 'Nominator Rewarded';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Slashed': {
      const { /* staker, */ amount } = miscData;
      ev.title = `Staker Slashed`;
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Bonded': {
      const { /* stash, */ amount } = miscData;
      ev.title = `Bonded`;
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Unbonded': {
      const { /* stash, */ amount } = miscData;
      ev.title = `Unbonded`;
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Kicked': {
      const { nominator /*, stash */ } = miscData;
      ev.title = `Nominator Kicked`;
      ev.subtitle = `${ellipsisFn(nominator.address().toString(), 5)}`;
      return ev;
    }
    case 'Chilled': {
      const { stash } = miscData;
      ev.title = `Account Chilled`;
      ev.subtitle = `${ellipsisFn(stash.address().toString(), 5)}`;
      return ev;
    }
    case 'ValidatorPrefsSet': {
      /* const { stash, prefs } = miscData; */
      ev.title = `Validator Preferences Set`;
      ev.subtitle = `Validator preferences set`;
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
