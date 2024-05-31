// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as RendererConfig } from '@/config/processes/renderer';
import BigNumber from 'bignumber.js';
import { getApiInstance } from '@/utils/ApiUtils';
import { isObject } from '@polkadot/util';
import { rmCommas } from '@w3ux/utils';
import type { AnyData } from '@/types/misc';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import { NotificationsController } from '@/controller/renderer/NotificationsController';

/// Debugging function.
const logOneShot = (task: IntervalSubscription) => {
  const { action, chainId, referendumId } = task;
  console.log(
    `---> Execute: ${action} for ref ${referendumId} on chain ${chainId}`
  );
};

export const executeIntervaledOneShot = async (task: IntervalSubscription) => {
  const { action, referendumId } = task;

  // Return early if referendum ID is undefined (should not happen).
  if (!referendumId) {
    return false;
  }

  switch (action) {
    case 'subscribe:interval:openGov:referendumVotes': {
      const result = await oneShot_openGov_referendumVotes(task);
      return result;
    }
    case 'subscribe:interval:openGov:decisionPeriod': {
      logOneShot(task);
      return true;
    }
    case 'subscribe:interval:openGov:referendumThresholds': {
      logOneShot(task);
      return true;
    }
    default: {
      return false;
    }
  }
};

/**
 * @name oneShot_openGov_referendumVotes
 * @summary One-shot call to fetch a referendum's votes.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const oneShot_openGov_referendumVotes = async (
  task: IntervalSubscription
): Promise<boolean> => {
  const { chainId, referendumId } = task;
  const instance = await getApiInstance(chainId);

  if (!instance || !referendumId) {
    return false;
  }

  const { api } = instance;
  const result = await api.query.referenda.referendumInfoFor(referendumId);
  const info: AnyData = result.toHuman();

  if (isObject(info) && 'Ongoing' in info) {
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

    if (!RendererConfig.silenceNotifications) {
      window.myAPI.showNotification(
        NotificationsController.getIntervalNotification(task, {
          percentAyes,
          percentNays,
        })
      );
    }

    return true;
  } else {
    return false;
  }
};
