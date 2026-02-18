// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSs58Prefix } from '@polkadot-live/consts/chains';
import { encodeRecord } from '@polkadot-live/encoder';
import { ellipsisFn } from '@w3ux/utils';
import { handleEvent } from '../../callbacks/utils';
import { getBalanceText } from '../../library';
import { makeChainEvent, notifyTitle } from './utils';
import type { PalletStakingEvent } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WhoMeta } from '../types';

export const handleStakingEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletStakingEvent,
  whoMeta?: WhoMeta,
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getStakingChainEvent(chainId, palletEvent, whoMeta),
        notification: getStakingNotification(chainId, palletEvent, whoMeta),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getStakingPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent,
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Rewarded': {
      const { dest } = miscData;
      return dest.type === 'Account'
        ? [dest.value.address(ss58Prefix).toString()]
        : [];
    }
    case 'Slashed':
      return [miscData.staker.address(ss58Prefix).toString()];
    case 'Kicked':
      return [miscData.nominator.address(ss58Prefix).toString()];
    case 'Bonded':
    case 'Unbonded':
    case 'Chilled':
      return [miscData.stash.address(ss58Prefix).toString()];
    default:
      return [];
  }
};

const getStakingNotification = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent,
  whoMeta?: WhoMeta,
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
      const { amount } = miscData;
      return {
        title: notifyTitle('Nominator Rewarded', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Slashed': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Staker Slashed', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Bonded': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Bonded', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unbonded': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Unbonded', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Kicked': {
      const { nominator } = miscData;
      return {
        title: notifyTitle('Nominator Kicked', whoMeta),
        subtitle: `${chainId}`,
        body: `${ellipsisFn(nominator.address().toString(), 5)}`,
      };
    }
    case 'Chilled': {
      const { stash } = miscData;
      return {
        title: notifyTitle('Account Chilled', whoMeta),
        subtitle: `${chainId}`,
        body: `${ellipsisFn(stash.address().toString(), 5)}`,
      };
    }
    case 'ValidatorPrefsSet': {
      return {
        title: 'Validator Preferences Set',
        subtitle: `${chainId}`,
        body: 'Validator preferences set',
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getStakingChainEvent = (
  chainId: ChainID,
  palletEvent: PalletStakingEvent,
  whoMeta?: WhoMeta,
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'Nominating' }, whoMeta);
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'EraPaid': {
      const { eraIndex, validatorPayout, remainder } = miscData;
      const payout = getBalanceText(validatorPayout, chainId);
      const rem = getBalanceText(remainder, chainId);
      ev.title = 'Era Paid';
      ev.subtitle = `${payout} validator payout with ${rem} remainder`;
      ev.encodedInfo = encodeRecord({
        Era: [eraIndex],
        Payout: [validatorPayout],
        Remainder: [remainder],
      });
      return ev;
    }
    case 'Rewarded': {
      const { stash, /*, dest */ amount } = miscData;
      ev.title = 'Nominator Rewarded';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Stash: [stash, { ss58Prefix }],
      });
      return ev;
    }
    case 'Slashed': {
      const { staker, amount } = miscData;
      ev.title = 'Staker Slashed';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Staker: [staker, { ss58Prefix }],
      });
      return ev;
    }
    case 'Bonded': {
      const { stash, amount } = miscData;
      ev.title = 'Bonded';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Stash: [stash, { ss58Prefix }],
      });
      return ev;
    }
    case 'Unbonded': {
      const { stash, amount } = miscData;
      ev.title = 'Unbonded';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Stash: [stash, { ss58Prefix }],
      });
      return ev;
    }
    case 'Kicked': {
      const { nominator, stash } = miscData;
      ev.title = 'Nominator Kicked';
      ev.subtitle = `${ellipsisFn(nominator.address().toString(), 5)}`;
      ev.encodedInfo = encodeRecord({
        Nominator: [nominator, { ss58Prefix }],
        Stash: [stash, { ss58Prefix }],
      });
      return ev;
    }
    case 'Chilled': {
      const { stash } = miscData;
      ev.title = 'Account Chilled';
      ev.subtitle = `${ellipsisFn(stash.address().toString(), 5)}`;
      ev.encodedInfo = encodeRecord({ Stash: [stash, { ss58Prefix }] });
      return ev;
    }
    case 'ValidatorPrefsSet': {
      const { stash /*, prefs */ } = miscData;
      ev.title = 'Validator Preferences Set';
      ev.subtitle = 'Validator preferences set';
      ev.encodedInfo = encodeRecord({ Stash: [stash, { ss58Prefix }] });
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
