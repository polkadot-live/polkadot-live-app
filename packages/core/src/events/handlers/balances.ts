// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
    default: {
      throw new Error(`EventNotRecognised: ${eventName}`);
    }
  }
};
