// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSs58Prefix } from '@polkadot-live/consts/chains';
import { encodeRecord } from '@polkadot-live/encoder';
import { getBalanceText } from '../../library';
import { getRefUriActions, makeChainEvent } from './utils';
import { handleEvent } from '../../callbacks/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { PalletReferendaEvent } from '@polkadot-live/types';
import type { WhoMeta } from '../types';

export const handleReferendaEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletReferendaEvent,
  whoMeta?: WhoMeta
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getReferendaChainEvent(chainId, palletEvent, whoMeta),
        notification: getReferendaNotification(chainId, palletEvent),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

const getReferendaNotification = (
  chainId: ChainID,
  palletEvent: PalletReferendaEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Approved': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Approved',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} approved`,
      };
    }
    case 'Cancelled': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Canceled',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} canceled`,
      };
    }
    case 'ConfirmAborted': {
      const { index: refId } = miscData;
      return {
        title: 'Confirmation Aborted',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} confirmation aborted`,
      };
    }
    case 'ConfirmStarted': {
      const { index: refId } = miscData;
      return {
        title: 'Confirmation Started',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} confirmation started`,
      };
    }
    case 'Confirmed': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Confirmed',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} confirmed`,
      };
    }
    case 'DecisionDepositPlaced': {
      const { index: refId } = miscData;
      return {
        title: 'Decision Deposit Placed',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} decision deposit placed`,
      };
    }
    case 'DecisionDepositRefunded': {
      const { index: refId } = miscData;
      return {
        title: 'Decision Deposit Refunded',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} decision deposit refunded`,
      };
    }
    case 'DecisionStarted': {
      const { index: refId } = miscData;
      return {
        title: 'Decision Phase Started',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} deciding phase started`,
      };
    }
    case 'DepositSlashed': {
      const { amount } = miscData;
      return {
        title: 'Deposit Slashed',
        subtitle: `${chainId} OpenGov`,
        body: `Deposit of ${getBalanceText(amount, chainId)} slashed`,
      };
    }
    case 'Killed': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Killed',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} killed`,
      };
    }
    case 'Rejected': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Rejected',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} rejected`,
      };
    }
    case 'SubmissionDepositRefunded': {
      const { index: refId } = miscData;
      return {
        title: 'Submission Deposit Refunded',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} submission deposit refunded`,
      };
    }
    case 'Submitted': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Submitted',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} submitted`,
      };
    }
    case 'TimedOut': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Timed Out',
        subtitle: `${chainId} OpenGov`,
        body: `Referendum ${refId} timed out`,
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getReferendaChainEvent = (
  chainId: ChainID,
  palletEvent: PalletReferendaEvent,
  whoMeta?: WhoMeta
): EventCallback => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'OpenGov' }, whoMeta);
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Approved': {
      const { index: refId } = miscData;
      ev.title = 'Referendum Approved';
      ev.subtitle = `Referendum ${refId} approved`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'Cancelled': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Canceled';
      ev.subtitle = `Referendum ${refId} canceled`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'ConfirmAborted': {
      const { index: refId } = miscData;
      ev.title = `Confirmation Aborted`;
      ev.subtitle = `Referendum ${refId} confirmation aborted`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'ConfirmStarted': {
      const { index: refId } = miscData;
      ev.title = 'Confirmation Started';
      ev.subtitle = `Referendum ${refId} confirmation started`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'Confirmed': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Confirmed';
      ev.subtitle = `Referendum ${refId} confirmed`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'DecisionDepositPlaced': {
      const { index: refId, who, amount } = miscData;
      ev.title = 'Decision Deposit Placed';
      ev.subtitle = `Referendum ${refId} decision deposit placed`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Referendum: [refId],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'DecisionDepositRefunded': {
      const { index: refId, who, amount } = miscData;
      ev.title = 'Decision Deposit Refunded';
      ev.subtitle = `Referendum ${refId} decision deposit refunded`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Referendum: [refId],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'DecisionStarted': {
      const { index: refId /*, track, proposal, tally */ } = miscData;
      ev.title = 'Deciding Phase Started';
      ev.subtitle = `Referendum ${refId} deciding phase started`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'DepositSlashed': {
      const { amount, who } = miscData;
      ev.title = 'Deposit Slashed';
      ev.subtitle = `Deposit of ${getBalanceText(amount, chainId)} slashed`;
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Killed': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Killed';
      ev.subtitle = `Referendum ${refId} killed`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'Rejected': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Rejected';
      ev.subtitle = `Referendum ${refId} rejected`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'SubmissionDepositRefunded': {
      const { index: refId, who, amount } = miscData;
      ev.title = 'Submission Deposit Refunded';
      ev.subtitle = `Referendum ${refId} submission deposit refunded`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({
        Amount: [amount],
        Referendum: [refId],
        Who: [who, { ss58Prefix }],
      });
      return ev;
    }
    case 'Submitted': {
      const { index: refId /*, track, proposal */ } = miscData;
      ev.title = 'Referendum Submitted';
      ev.subtitle = `Referendum ${refId} submitted`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    case 'TimedOut': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Timed Out';
      ev.subtitle = `Referendum ${refId} timed out`;
      ev.uriActions = getRefUriActions(chainId, refId);
      ev.encodedInfo = encodeRecord({ Referendum: [refId] });
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
