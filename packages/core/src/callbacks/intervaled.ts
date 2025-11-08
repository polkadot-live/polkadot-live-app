// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Utils from '../library/OpenGovLib';
import BigNumber from 'bignumber.js';
import { rmCommas } from '@w3ux/utils';
import { formatBlocksToTime } from '../library/TimeLib';
import { getApiOrThrow, handleEvent } from './utils';
import {
  APIsController,
  EventsController,
  NotificationsController,
} from '../controllers';
import type { DedotOpenGovClient } from '@polkadot-live/types/apis';
import type { NotificationData } from '@polkadot-live/types/reporter';
import type {
  OneShotReturn,
  RefDeciding,
  ReferendumStatus,
} from '@polkadot-live/types/openGov';
import type {
  IntervalSubscription,
  NotificationPolicy,
} from '@polkadot-live/types/subscriptions';
import type { PalletReferendaTrackDetails } from '@dedot/chaintypes/substrate';

/// Debugging function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logOneShot = (task: IntervalSubscription) => {
  const { action, chainId, referendumId } = task;
  console.log(
    `---> Execute: ${action} for ref ${referendumId} on chain ${chainId}`
  );
};

/**
 * @name executeIntervaledOneShot
 * @summary Public function to execute a one-shot for an interval subscription task.
 */
export const executeIntervaledOneShot = async (
  task: IntervalSubscription,
  policy: NotificationPolicy = 'default'
): Promise<OneShotReturn> => {
  try {
    const { action, chainId, referendumId } = task;

    // Return early if referendum ID is undefined (should not happen).
    if (!referendumId) {
      return { success: false, message: 'Undefined referendum ID' };
    }
    // Return early if network failed to connect.
    if (APIsController.getFailedChainIds().includes(task.chainId)) {
      return { success: false };
    }
    const api = (await getApiOrThrow(chainId)) as DedotOpenGovClient;
    switch (action) {
      case 'subscribe:interval:openGov:referendumVotes': {
        return await oneShot_openGov_referendumVotes(task, policy, api);
      }
      case 'subscribe:interval:openGov:decisionPeriod': {
        return await oneShot_openGov_decisionPeriod(task, policy, api);
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        return await oneShot_openGov_thresholds(task, policy, api);
      }
      default: {
        return { success: false, message: 'One-shot action not found.' };
      }
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Unknown error.' };
  }
};

/**
 * @name oneShot_openGov_referendumVotes
 * @summary One-shot call to fetch a referendum's votes.
 */
const oneShot_openGov_referendumVotes = async (
  task: IntervalSubscription,
  policy: NotificationPolicy = 'default',
  api: DedotOpenGovClient
): Promise<OneShotReturn> => {
  const { referendumId } = task;
  if (!referendumId) {
    return { success: false, message: 'Undefined referendum ID.' };
  }
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  if (!result || result.type !== 'Ongoing') {
    return { success: false, message: 'Referendum is not ongoing.' };
  }

  const info = Utils.serializeReferendumInfo(result.value as ReferendumStatus);
  const { ayes, nays } = info.tally;
  const bnAyes = new BigNumber(rmCommas(String(ayes)));
  const bnNays = new BigNumber(rmCommas(String(nays)));
  const bnTotal = bnAyes.plus(bnNays);

  const percentAyes = bnAyes
    .dividedBy(bnTotal)
    .multipliedBy(100)
    .decimalPlaces(1)
    .toString();

  const percentNays = bnNays
    .dividedBy(bnTotal)
    .multipliedBy(100)
    .decimalPlaces(1)
    .toString();

  handleEvent({
    action: 'events:persist',
    data: {
      event: EventsController.getIntervalEvent(task, {
        percentAyes,
        percentNays,
      }),
      notification: NotificationsController.getIntervalNotification(task, {
        percentAyes,
        percentNays,
      }),
      showNotification: getNotificationFlags(task, policy),
    },
  });
  return { success: true };
};

/**
 * @name oneShot_openGov_decisionPeriod
 * @summary One-shot call to remaining decision period time.
 */
const oneShot_openGov_decisionPeriod = async (
  task: IntervalSubscription,
  policy: NotificationPolicy = 'default',
  api: DedotOpenGovClient
): Promise<OneShotReturn> => {
  const { chainId, referendumId } = task;
  if (!referendumId) {
    return { success: false, message: 'Undefined referendum ID.' };
  }
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  if (!result || result.type !== 'Ongoing') {
    return { success: false, message: 'Referendum is not ongoing.' };
  }

  // Data for rendering.
  let formattedTime = '';
  const notificationData: NotificationData = {
    title: `Referendum ${referendumId}`,
    body: '',
    subtitle: 'Decision Period',
  };

  const info = Utils.serializeReferendumInfo(
    result.value as ReferendumStatus
  ) as RefDeciding;
  if (!info.deciding) {
    return { success: false, message: 'Referendum not in decision period.' };
  }
  const lastHeader = await api.rpc.chain_getHeader();
  const bnCurrentBlock = new BigNumber(lastHeader!.number);
  const { confirming } = info.deciding;

  if (confirming) {
    const bnConfirmBlock = new BigNumber(rmCommas(String(confirming)));
    const bnRemainingBlocks = bnConfirmBlock.minus(bnCurrentBlock);
    formattedTime = formatBlocksToTime(chainId, bnRemainingBlocks.toString());
    notificationData.body = `Confirmaing. Ends in ${formattedTime}.`;
  } else {
    const { since } = info.deciding;

    // Get origin and its decision period in number of blocks.
    type T = [number, PalletReferendaTrackDetails][];
    const originName = info.origin;
    const tracks = api.consts.referenda.tracks;
    const tracksData = Utils.getTracks(Utils.getSerializedTracks(tracks as T));
    const trackId = Utils.getOriginIdFromName(originName);
    const track = tracksData.find((t) => t.trackId === trackId);
    if (!track) {
      return { success: false, message: 'Referendum track not found.' };
    }

    // Prefix `dp` meaning `Decision Period`.
    const bnDp = new BigNumber(rmCommas(String(track.decisionPeriod)));
    const bnDpSince = new BigNumber(rmCommas(String(since)));
    const bnDpEndBlock = bnDpSince.plus(bnDp);
    const bnRemainingBlocks = bnDpEndBlock.minus(bnCurrentBlock);

    formattedTime = formatBlocksToTime(chainId, bnRemainingBlocks.toString());
    notificationData.body = `Ends in ${formattedTime}.`;
  }

  handleEvent({
    action: 'events:persist',
    data: {
      event: EventsController.getIntervalEvent(task, {
        formattedTime,
        subtext: notificationData.body,
      }),
      notification: notificationData,
      showNotification: getNotificationFlags(task, policy),
    },
  });
  return { success: true };
};

/**
 * @name oneShot_openGov_thresholds
 * @summary One-shot call to referendum current thresholds.
 */
const oneShot_openGov_thresholds = async (
  task: IntervalSubscription,
  policy: NotificationPolicy = 'default',
  api: DedotOpenGovClient
): Promise<OneShotReturn> => {
  const { referendumId } = task;
  if (!referendumId) {
    return { success: false, message: 'Undefined referendum ID.' };
  }
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  if (!result || result.type !== 'Ongoing') {
    return { success: false, message: 'Referendum is not ongoing.' };
  }
  const info = Utils.serializeReferendumInfo(
    result.value as ReferendumStatus
  ) as RefDeciding;
  if (!info.deciding) {
    return { success: false, message: 'Referendum not being decided.' };
  }

  // Get track data for decision period.
  type T = [number, PalletReferendaTrackDetails][];
  const originName = info.origin;
  const tracks = api.consts.referenda.tracks;
  const tracksData = Utils.getTracks(Utils.getSerializedTracks(tracks as T));
  const trackId = Utils.getOriginIdFromName(originName);
  const track = tracksData.find((t) => t.trackId === trackId);
  if (!track) {
    return { success: false, message: 'Referendum track not found.' };
  }
  // Get current approval and support thresholds.
  const thresholds = await Utils.getMinApprovalSupport(
    api,
    { refId: referendumId, refStatus: 'Deciding', info },
    track
  );

  if (!thresholds) {
    return { success: false, message: 'Threshold data error.' };
  }
  const formattedApp = new BigNumber(Utils.rmChars(thresholds.minApproval))
    .multipliedBy(100)
    .toFixed(2)
    .toString();

  const formattedSup = new BigNumber(Utils.rmChars(thresholds.minSupport))
    .multipliedBy(100)
    .toFixed(2)
    .toString();

  handleEvent({
    action: 'events:persist',
    data: {
      event: EventsController.getIntervalEvent(task, {
        formattedApp,
        formattedSup,
      }),
      notification: NotificationsController.getIntervalNotification(task, {
        formattedApp,
        formattedSup,
      }),
      showNotification: getNotificationFlags(task, policy),
    },
  });
  return { success: true };
};

/**
 * @name getNotificationFlag
 * @summary Returns `true` if a notification should be rendered, `false` otherwise.
 */
const getNotificationFlags = (
  task: IntervalSubscription,
  policy: NotificationPolicy
): { isOneShot: boolean; isEnabled: boolean } => ({
  isOneShot: policy === 'one-shot',
  isEnabled: task.enableOsNotifications,
});
