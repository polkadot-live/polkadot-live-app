// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getRefUriActions, makeChainEvent } from './utils';
import { handleEvent } from '../../callbacks/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { PalletReferendaEvent as PolkadotAssetHubReferendaEvent } from '@dedot/chaintypes/polkadot-asset-hub';
import type { PalletReferendaEvent as KusamaAssetHubReferendaEvent } from '@dedot/chaintypes/kusama-asset-hub';

/**
 * Types.
 */
type PalletReferendaEvent =
  | PolkadotAssetHubReferendaEvent
  | KusamaAssetHubReferendaEvent;

/**
 * Handler.
 */
export const handleReferendaEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletReferendaEvent
) => {
  handleEvent({
    action: 'events:persist',
    data: {
      event: getReferendaChainEvent(chainId, palletEvent),
      notification: getReferendaNotification(chainId, palletEvent),
      showNotification: { isOneShot: false, isEnabled: osNotify },
    },
  });
};

/**
 * Get notification.
 */
export const getReferendaNotification = (
  chainId: ChainID,
  palletEvent: PalletReferendaEvent
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Approved': {
      const { index: refId } = miscData;
      return {
        title: 'Referendum Approved',
        body: `Referendum ${refId} has been approved.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'Cancelled': {
      const { index: refId /*, tally */ } = miscData;
      return {
        title: 'Referendum Canceled',
        body: `Referendum ${refId} has been canceled.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'ConfirmAborted': {
      const { index: refId } = miscData;
      return {
        title: 'Confirmation Aborted',
        body: `Confirmation aborted for referendum ${refId}.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'ConfirmStarted': {
      const { index: refId } = miscData;
      return {
        title: 'Confirmation Started',
        body: `Confirmation started for referendum ${refId}.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'Confirmed': {
      const { index: refId /*, tally */ } = miscData;
      return {
        title: 'Referendum Confirmed',
        body: `Referendum ${refId} confirmation phase complete.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'DecisionDepositPlaced': {
      const { index: refId /*, who, amount */ } = miscData;
      return {
        title: 'Decision Deposit Placed',
        body: `Referendum ${refId} decision deposit placed.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'DecisionDepositRefunded': {
      const { index: refId /*, who, amount */ } = miscData;
      return {
        title: 'Decision Deposit Refunded',
        body: `Referendum ${refId} decision deposit refunded.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'DecisionStarted': {
      const { index: refId /*, track, proposal, tally */ } = miscData;
      return {
        title: 'Decision Phase Started',
        body: `Referendum ${refId} deciding phase started.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'DepositSlashed': {
      const { amount /*, who, */ } = miscData;
      return {
        title: 'Deposit Slashed',
        body: `Deposit slashed of ${amount}.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'Killed': {
      const { index: refId /*, tally */ } = miscData;
      return {
        title: 'Referendum Killed',
        body: `Referendum ${refId} has been killed.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'Rejected': {
      const { index: refId /*, tally */ } = miscData;
      return {
        title: 'Referendum Rejected',
        body: `Referendum ${refId} has been rejected.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'SubmissionDepositRefunded': {
      const { index: refId /*, who, amount */ } = miscData;
      return {
        title: 'Submission Deposit Refunded',
        body: `Referendum ${refId} submission deposit has been refunded.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'Submitted': {
      const { index: refId /*, track, proposal */ } = miscData;
      return {
        title: 'Referendum Submitted',
        body: `Referendum ${refId} has been submitted.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    case 'TimedOut': {
      const { index: refId /*, tally */ } = miscData;
      return {
        title: 'Referendum Timed Out',
        body: `Referendum ${refId} has timed out.`,
        subtitle: `${chainId} OpenGov`,
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

/**
 * Get event.
 */
export const getReferendaChainEvent = (
  chainId: ChainID,
  palletEvent: PalletReferendaEvent
): EventCallback => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'referenda' });

  switch (eventName) {
    case 'Approved': {
      const { index: refId } = miscData;
      ev.title = 'Referendum Approved';
      ev.subtitle = `Referendum ${refId} has been approved.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'Cancelled': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Canceled';
      ev.subtitle = `Referendum ${refId} has been canceled.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'ConfirmAborted': {
      const { index: refId } = miscData;
      ev.title = `Confirmation Aborted`;
      ev.subtitle = `Confirmation aborted for referendum ${refId}.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'ConfirmStarted': {
      const { index: refId } = miscData;
      ev.title = 'Confirmation Started';
      ev.subtitle = `Confirmation started for referendum ${refId}.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'Confirmed': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Confirmed';
      ev.subtitle = `Referendum ${refId} confirmation phase complete.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'DecisionDepositPlaced': {
      const { index: refId /*, who, amount */ } = miscData;
      ev.title = 'Decision Deposit Placed';
      ev.subtitle = `Referendum ${refId} decision deposit placed.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'DecisionDepositRefunded': {
      const { index: refId /*, who, amount */ } = miscData;
      ev.title = 'Decision Deposit Refunded';
      ev.subtitle = `Referendum ${refId} decision deposit refunded.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'DecisionStarted': {
      const { index: refId /*, track, proposal, tally */ } = miscData;
      ev.title = 'Deciding Phase Started';
      ev.subtitle = `Referendum ${refId} Deciding phase started.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'DepositSlashed': {
      const { amount /*, who, */ } = miscData;
      ev.title = 'Deposit Slashed';
      ev.subtitle = `Deposit slashed of ${amount.toString().substring(0, 5)}...`;
      return ev;
    }
    case 'Killed': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Killed';
      ev.subtitle = `Referendum ${refId} has been killed.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'Rejected': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Rejected';
      ev.subtitle = `Referendum ${refId} has been rejected.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'SubmissionDepositRefunded': {
      const { index: refId /*, who, amount */ } = miscData;
      ev.title = 'Submission Deposit Refunded';
      ev.subtitle = `Referendum ${refId} submission deposit has been refunded.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'Submitted': {
      const { index: refId /*, track, proposal */ } = miscData;
      ev.title = 'Referendum Submitted';
      ev.subtitle = `Referendum ${refId} has been submitted.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    case 'TimedOut': {
      const { index: refId /*, tally */ } = miscData;
      ev.title = 'Referendum Timed Out';
      ev.subtitle = `Referendum ${refId} has timed out.`;
      ev.uriActions = getRefUriActions(chainId, refId);
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
