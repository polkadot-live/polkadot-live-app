// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainList } from '@polkadot-live/consts/chains';
import { getBalanceText } from '../../library';
import { handleEvent } from '../../callbacks/utils';
import { makeChainEvent } from './utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback, PalletBalancesEvent } from '@polkadot-live/types';

export const handleBalancesEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletBalancesEvent
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getBalancesChainEvent(chainId, palletEvent),
        notification: getBalancesNotification(chainId, palletEvent),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getBalancesPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletBalancesEvent
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const prefix = ChainList.get(chainId)?.prefix ?? 42;
  switch (eventName) {
    case 'Transfer': {
      const { from, to } = miscData;
      return [from.address(prefix).toString(), to.address(prefix).toString()];
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
      return [miscData.who.address(prefix).toString()];
    }
    default:
      return [];
  }
};

const getBalancesNotification = (
  chainId: ChainID,
  palletEvent: PalletBalancesEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Transfer': {
      const { amount /*, from, to */ } = miscData;
      return {
        title: 'Transfer',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Reserved': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Reserved',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unreserved': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Unreserved',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Deposit': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Deposit',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Withdraw': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Withdraw',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Slashed': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Slashed',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Suspended': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Suspended',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Restored': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Restored',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Locked': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Locked',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Unlocked': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Unlocked',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Frozen': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Frozen',
        subtitle: `${chainId}`,
        body: `${getBalanceText(amount, chainId)}`,
      };
    }
    case 'Thawed': {
      const { /* who, */ amount } = miscData;
      return {
        title: 'Thawed',
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
  palletEvent: PalletBalancesEvent
): EventCallback => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'balances' });
  switch (eventName) {
    case 'Transfer': {
      const { amount /*, from, to */ } = miscData;
      ev.title = 'Transfer';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Reserved': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Reserved';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Unreserved': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Unreserved';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Deposit': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Deposit';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Withdraw': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Withdraw';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Slashed': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Slashed';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Suspended': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Suspended';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Restored': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Restored';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Locked': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Locked';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Unlocked': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Unlocked';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Frozen': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Frozen';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    case 'Thawed': {
      const { /* who, */ amount } = miscData;
      ev.title = 'Thawed';
      ev.subtitle = `${getBalanceText(amount, chainId)}`;
      return ev;
    }
    default: {
      throw new Error(`EventNotRecognised: ${eventName}`);
    }
  }
};
