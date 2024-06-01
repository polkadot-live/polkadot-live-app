// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { getApiInstance } from '@/utils/ApiUtils';
import { isObject } from '@polkadot/util';
import { rmCommas } from '@w3ux/utils';
import { EventsController } from '@/controller/renderer/EventsController';
import { NotificationsController } from '@/controller/renderer/NotificationsController';
import { formatBlocksToTime } from '../utils/timeUtils';
import {
  getMinApprovalSupport,
  getTracks,
  getOriginIdFromName,
  rmChars,
} from '../utils/openGovUtils';
import type { AnyData } from '@/types/misc';
import type { ActiveReferendaInfo, OneShotReturn } from '@/types/openGov';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { NotificationData } from '@/types/reporter';

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
  isOneShot = false
): Promise<OneShotReturn> => {
  const { action, referendumId } = task;

  // Return early if referendum ID is undefined (should not happen).
  if (!referendumId) {
    return { success: false, message: 'Undefined referendum ID' };
  }

  switch (action) {
    case 'subscribe:interval:openGov:referendumVotes': {
      const result = await oneShot_openGov_referendumVotes(task, isOneShot);
      return result;
    }
    case 'subscribe:interval:openGov:decisionPeriod': {
      const result = await oneShot_openGov_decisionPeriod(task, isOneShot);
      return result;
    }
    case 'subscribe:interval:openGov:referendumThresholds': {
      const result = await oneShot_openGov_thresholds(task);
      return result;
    }
    default: {
      return { success: false, message: 'One-shot action not found.' };
    }
  }
};

/**
 * @name oneShot_openGov_referendumVotes
 * @summary One-shot call to fetch a referendum's votes.
 */
const oneShot_openGov_referendumVotes = async (
  task: IntervalSubscription,
  isOneShot = false
): Promise<OneShotReturn> => {
  const { chainId, referendumId } = task;
  const instance = await getApiInstance(chainId);

  if (!instance || !referendumId) {
    return !instance
      ? { success: false, message: 'API instance not found.' }
      : { success: false, message: 'Undefined referendum ID.' };
  }

  const { api } = instance;
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  const info: AnyData = result.toHuman();

  if (!isObject(info) && 'Ongoing' in info) {
    return { success: false, message: 'Referendum not ongoing.' };
  }

  const referendumInfo: ActiveReferendaInfo = {
    referendaId: referendumId,
    Ongoing: {
      ...info.Ongoing,
    },
  };

  const { ayes, nays } = referendumInfo.Ongoing.tally;
  const ayesBn = new BigNumber(rmCommas(String(ayes)));
  const naysBn = new BigNumber(rmCommas(String(nays)));
  const totalBn = ayesBn.plus(naysBn);

  const percentAyes = ayesBn
    .dividedBy(totalBn)
    .multipliedBy(100)
    .decimalPlaces(1);

  const percentNays = naysBn
    .dividedBy(totalBn)
    .multipliedBy(100)
    .decimalPlaces(1);

  const event = EventsController.getIntervalEvent(task, {
    ayeVotes: percentAyes.toString(),
    nayVotes: percentNays.toString(),
  });

  const notification = getNotificationFlag(task, isOneShot)
    ? NotificationsController.getIntervalNotification(task, {
        percentAyes,
        percentNays,
      })
    : null;

  window.myAPI.persistEvent(event, notification, isOneShot);
  return { success: true };
};

/**
 * @name oneShot_openGov_decisionPeriod
 * @summary One-shot call to remaining decision period time.
 */
const oneShot_openGov_decisionPeriod = async (
  task: IntervalSubscription,
  isOneShot = false
): Promise<OneShotReturn> => {
  const { chainId, referendumId } = task;
  const instance = await getApiInstance(chainId);

  if (!instance || !referendumId) {
    return !instance
      ? { success: false, message: 'API instance not found.' }
      : { success: false, message: 'Undefined referendum ID.' };
  }

  const { api } = instance;
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  const info: AnyData = result.toHuman();

  if (!isObject(info) && 'Ongoing' in info) {
    return { success: false, message: 'Referendum not being decided.' };
  }

  // Data for rendering.
  let formattedTime = '';
  const notificationData: NotificationData = {
    title: `Referendum ${referendumId}`,
    body: '',
  };

  const referendumInfo: ActiveReferendaInfo = {
    referendaId: referendumId,
    Ongoing: {
      ...info.Ongoing,
    },
  };

  if (!referendumInfo.Ongoing.deciding) {
    return { success: false, message: 'Referendum not in decision period.' };
  }

  const lastHeader = await api.rpc.chain.getHeader();
  const currentBlockBn = new BigNumber(lastHeader.number.toNumber());
  const { confirming } = referendumInfo.Ongoing.deciding;

  if (confirming) {
    const confirmBlockBn = new BigNumber(rmCommas(String(confirming)));
    const remainingBlocksBn = confirmBlockBn.minus(currentBlockBn);
    formattedTime = formatBlocksToTime(chainId, remainingBlocksBn.toString());
    notificationData.body = `Confirmaing. Ends in ${formattedTime}.`;
  } else {
    const { since } = referendumInfo.Ongoing.deciding;

    // Get origin and its decision period in number of blocks.
    const originData = referendumInfo.Ongoing.origin;
    const originName =
      'system' in originData
        ? String(originData.system)
        : String(originData.Origins);

    const trackId = getOriginIdFromName(originName);
    const tracksResult: AnyData = api.consts.referenda.tracks.toHuman();
    const tracksData = getTracks(tracksResult);
    const track = tracksData.find((t) => t.trackId === trackId);
    if (!track) {
      return { success: false, message: 'Referendum track not found.' };
    }

    // Prefix `dp` meaning `Decision Period`.
    const dpBn = new BigNumber(rmCommas(String(track.decisionPeriod)));
    const dpSinceBn = new BigNumber(rmCommas(String(since)));
    const dpEndBlockBn = dpSinceBn.plus(dpBn);
    const remainingBlocksBn = dpEndBlockBn.minus(currentBlockBn);

    formattedTime = formatBlocksToTime(chainId, remainingBlocksBn.toString());
    notificationData.body = `Decision period ends in ${formattedTime}.`;
  }

  const event = EventsController.getIntervalEvent(task, {
    formattedTime,
    subtext: notificationData.body,
  });

  const notification = getNotificationFlag(task, isOneShot)
    ? notificationData
    : null;

  window.myAPI.persistEvent(event, notification, isOneShot);
  return { success: true };
};

/**
 * @name oneShot_openGov_thresholds
 * @summary One-shot call to referendum current thresholds.
 */
const oneShot_openGov_thresholds = async (
  task: IntervalSubscription
): Promise<OneShotReturn> => {
  const { chainId, referendumId } = task;
  const instance = await getApiInstance(chainId);

  if (!instance || !referendumId) {
    return !instance
      ? { success: false, message: 'API instance not found.' }
      : { success: false, message: 'Undefined referendum ID.' };
  }

  const { api } = instance;
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  const info: AnyData = result.toHuman();

  // Confirm result is a referendum that is ongoing.
  if (!(isObject(info) && 'Ongoing' in info)) {
    return { success: false, message: 'Referendum not ongoing.' };
  }

  // Guarentee that the referendum is still in its deciding phase.
  const referendumInfo: ActiveReferendaInfo = {
    referendaId: referendumId,
    Ongoing: {
      ...info.Ongoing,
    },
  };

  if (!referendumInfo.Ongoing.deciding) {
    return { success: false, message: 'Referendum not being decided.' };
  }

  // Get track data for decision period.
  const originData = referendumInfo.Ongoing.origin;
  const originName =
    'system' in originData
      ? String(originData.system)
      : String(originData.Origins);

  const trackId = getOriginIdFromName(originName);
  const tracksResult: AnyData = api.consts.referenda.tracks.toHuman();
  const tracksData = getTracks(tracksResult);
  const track = tracksData.find((t) => t.trackId === trackId);
  if (!track) {
    return { success: false, message: 'Referendum track not found.' };
  }

  // Get current approval and support thresholds.
  const thresholds = await getMinApprovalSupport(api, referendumInfo, track);
  if (!thresholds) {
    return { success: false, message: 'Threshold data error.' };
  }

  // Render native OS notification if enabled.
  if (!RendererConfig.silenceNotifications) {
    const { minApproval, minSupport } = thresholds;

    const formattedApp = new BigNumber(rmChars(minApproval))
      .multipliedBy(100)
      .toFixed(2);

    const formattedSup = new BigNumber(rmChars(minSupport))
      .multipliedBy(100)
      .toFixed(2);

    window.myAPI.showNotification({
      title: `Referendum ${referendumId}`,
      body: `Approval thresold at ${formattedApp}% and support threshold at ${formattedSup}%`,
    });
  }

  return { success: true };
};

/**
 * @name getNotificationFlag
 * @summary Returns `true` if a notification should be rendered, `false` otherwise.
 */
const getNotificationFlag = (task: IntervalSubscription, isOneShot: boolean) =>
  !RendererConfig.silenceNotifications &&
  (task.enableOsNotifications || isOneShot);
