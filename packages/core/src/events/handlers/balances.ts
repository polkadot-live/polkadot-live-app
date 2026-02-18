// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSs58Prefix } from '@polkadot-live/consts/chains';
import { encodeRecord } from '@polkadot-live/encoder';
import { handleEvent } from '../../callbacks/utils';
import { getBalanceText } from '../../library';
import { makeChainEvent, notifyTitle } from './utils';
import type { EventCallback, PalletBalancesEvent } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WhoMeta } from '../types';

export const handleBalancesEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletBalancesEvent,
  whoMeta?: WhoMeta,
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getBalancesChainEvent(chainId, palletEvent, whoMeta),
        notification: getBalancesNotification(chainId, palletEvent, whoMeta),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getBalancesPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletBalancesEvent,
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const ss58Prefix = getSs58Prefix(chainId);
  switch (eventName) {
    case 'Transfer': {
      const { from, to } = miscData;
      return [
        from.address(ss58Prefix).toString(),
        to.address(ss58Prefix).toString(),
      ];
    }
    case 'Reserved':
    case 'Unreserved':
    case 'Deposit':
    case 'Withdraw':
    case 'Slashed':
    case 'Suspended':
    case 'Restored':
    case 'Locked':
    case 'Unlocked':
    case 'Frozen':
    case 'Thawed': {
      return [miscData.who.address(ss58Prefix).toString()];
    }
    default:
      return [];
  }
};

const getBalancesNotification = (
  chainId: ChainID,
  palletEvent: PalletBalancesEvent,
  whoMeta?: WhoMeta,
) => {
  const { name: eventName, data: miscData } = palletEvent;

  switch (eventName) {
    case 'Transfer': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Transfer', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Reserved': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Reserved', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unreserved': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Unreserved', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Deposit': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Deposit', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Withdraw': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Withdraw', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Slashed': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Slashed', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Suspended': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Suspended', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Restored': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Restored', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Locked': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Locked', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unlocked': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Unlocked', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Frozen': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Frozen', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Thawed': {
      const { amount } = miscData;
      return {
        title: notifyTitle('Thawed', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    default: {
      console.log(palletEvent);
      throw new Error(`EventNotRecognised: ${eventName}`);
    }
  }
};

const getBalancesChainEvent = (
  chainId: ChainID,
  palletEvent: PalletBalancesEvent,
  whoMeta?: WhoMeta,
): EventCallback => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'Balances' }, whoMeta);
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Transfer': {
      const { amount, from, to } = miscData;
      ev.title = 'Transfer';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        From: [from, { ss58Prefix }],
        To: [to, { ss58Prefix }],
      });
      return ev;
    }
    case 'Reserved': {
      const { who, amount } = miscData;
      ev.title = 'Reserved';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Unreserved': {
      const { who, amount } = miscData;
      ev.title = 'Unreserved';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Deposit': {
      const { who, amount } = miscData;
      ev.title = 'Deposit';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Withdraw': {
      const { who, amount } = miscData;
      ev.title = 'Withdraw';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Slashed': {
      const { who, amount } = miscData;
      ev.title = 'Slashed';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Suspended': {
      const { who, amount } = miscData;
      ev.title = 'Suspended';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Restored': {
      const { who, amount } = miscData;
      ev.title = 'Restored';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Locked': {
      const { who, amount } = miscData;
      ev.title = 'Locked';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Unlocked': {
      const { who, amount } = miscData;
      ev.title = 'Unlocked';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Frozen': {
      const { who, amount } = miscData;
      ev.title = 'Frozen';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Thawed': {
      const { who, amount } = miscData;
      ev.title = 'Thawed';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    default: {
      throw new Error(`EventNotRecognised: ${eventName}`);
    }
  }
};
