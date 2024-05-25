// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { getApiInstance } from '@/utils/ApiUtils';
import { isObject } from '@polkadot/util';
import { rmCommas } from '@w3ux/utils';
import type { AnyData } from '@/types/misc';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { ChainID } from '@/types/chains';

// TODO: Provide IntervalSubscription data.
export const executeIntervaledOneShot = async (task: string) => {
  switch (task) {
    default: {
      const chainId = 'Polkadot';
      const referendumId = 801;
      const result = await oneShot_openGov_referendumVotes(
        chainId,
        referendumId
      );

      return result;
    }
  }
};

/**
 * @name oneShot_openGov_referendumVotes
 * @summary One-shot call to fetch a referendum's votes.
 */

// TODO: Provide IntervalSubscription data.
const oneShot_openGov_referendumVotes = async (
  chainId: ChainID,
  referendumId: number
) => {
  const instance = await getApiInstance(chainId);
  if (!instance) {
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

    const { ayes, nays, support } = referendumInfo.Ongoing.tally;
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

    console.log(`Ayes: ${percentAyes.toString()}%`);
    console.log(`Nays: ${percentNays.toString()}%`);
    console.log(`Support: ${support}`);

    return true;
  }
};
