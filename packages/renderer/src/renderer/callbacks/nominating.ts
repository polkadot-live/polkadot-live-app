// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { rmCommas } from '@w3ux/utils';
import type { Account } from '@/model/Account';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ApiPromise } from '@polkadot/api';
import type {
  AccountNominatingData,
  ValidatorData,
} from '@polkadot-live/types/accounts';

interface ValidatorOverviewData {
  total: string;
  own: string;
  nominatorCount: string;
  pageCount: string;
}

/**
 * @name getEraRewards
 * @summary Get an address' total nominating rewards in a given era.
 */
export const getEraRewards = async (
  address: string,
  api: ApiPromise,
  era: number
) => {
  const showDebug = true;
  const r1 = await api.query.staking.erasValidatorReward<AnyData>(era);
  const r2 = await api.query.staking.erasRewardPoints<AnyData>(era);

  const eraTotalPayout = new BigNumber(rmCommas(r1.toHuman()));
  const eraRewardPoints = r2.toHuman(); // total, individual

  // Cache the era's validator overviews.
  const validators = new Map<string, ValidatorOverviewData>();
  const overview = await api.query.staking.erasStakersOverview.entries(era);
  for (const [keys, value] of overview) {
    const vid = (keys.toHuman() as AnyData)[1] as string;
    const { total, own, nominatorCount, pageCount }: AnyData = value.toHuman();
    validators.set(vid, { total, own, nominatorCount, pageCount });
  }

  // Get address staking data for this era.
  const validatorIds = Array.from(validators.keys());
  const pagedResults = await Promise.all(
    validatorIds.map((vid) =>
      api.query.staking.erasStakersPaged.entries(era, vid)
    )
  );

  // Map data is <validatorId, stakedAmount[]>
  const addressStake = new Map<string, string[]>();
  const show = false;
  for (const pagedResult of pagedResults) {
    if (pagedResult[0] === undefined) {
      continue;
    }

    const [obj] = pagedResult;
    const pageEra = (obj[0].toHuman() as AnyData)[0] || '0';
    const pageValidator = (obj[0].toHuman() as AnyData)[1];
    const page = (obj[0].toHuman() as AnyData)[2];
    showDebug && show && console.log(pageEra, pageValidator, page);

    const pageTotal = (obj[1].toHuman() as AnyData).pageTotal;
    const others = (obj[1].toHuman() as AnyData).others;
    showDebug && show && console.log(pageTotal);

    for (const { who, value } of others) {
      showDebug && show && console.log(who, value);
      if ((who as string) === address) {
        addressStake.has(pageValidator)
          ? addressStake.set(pageValidator, [
              ...addressStake.get(pageValidator)!,
              value,
            ])
          : addressStake.set(pageValidator, [value]);
      }
    }
  }

  if (showDebug) {
    console.log(`Stake for ${address}:`);
    console.log(addressStake);
  }

  // Get nominated validator commissions.
  const commissions = new Map<string, string>();
  const vids = Array.from(addressStake.keys());
  const prefResults = await Promise.all(
    vids.map((vid) => api.query.staking.erasValidatorPrefs<AnyData>(era, vid))
  );

  for (let i = 0; i < prefResults.length; ++i) {
    commissions.set(vids[i], prefResults[i].toHuman().commission);
  }

  // Calculate unclaimed rewards for each nominated validator.
  let totalRewards = new BigNumber(0);
  for (const vid of vids) {
    // Parse commission to big number.
    const commission = new BigNumber(
      commissions.get(vid)!.replace(/%/g, '')
    ).multipliedBy(0.01);

    // Get total staked amount by the address.
    const staked = addressStake
      .get(vid)!
      .reduce((acc, cur) => acc.plus(rmCommas(cur)), new BigNumber(0));

    // Get validator's total stake.
    const { total: vTotal } = validators.get(vid)!;
    const total = new BigNumber(rmCommas(vTotal));

    // Calculate available validator rewards for the era based on reward points.
    const totalRewardPoints = new BigNumber(rmCommas(eraRewardPoints.total));
    const validatorRewardPoints = new BigNumber(
      rmCommas(eraRewardPoints.individual[String(vid)])
    );

    const avail = eraTotalPayout
      .multipliedBy(validatorRewardPoints)
      .dividedBy(totalRewardPoints);

    // Calculate rewards for this era.
    const valCut = commission.multipliedBy(avail);
    const eraRewardsForValidator = total.isZero()
      ? new BigNumber(0)
      : avail
          .minus(valCut)
          .multipliedBy(staked)
          .dividedBy(total)
          .plus(address === vid ? valCut : 0);

    showDebug && console.log(`${vid}: ${eraRewardsForValidator.toString()}`);
    totalRewards = totalRewards.plus(eraRewardsForValidator);
  }

  return totalRewards;
};

/**
 * @name getAccountExposed
 * @summary Return `true` if address is exposed in `era`. Return `false` otherwise.
 * @deprecated staking.erasStakers replaced with staking.erasStakersPaged
 */
export const getAccountExposed_deprecated = async (
  api: ApiPromise,
  era: number,
  account: Account
): Promise<boolean> => {
  const result: AnyData = await api.query.staking.erasStakers.entries(era);

  let exposed = false;
  for (const val of result) {
    // Check if account address is the validator.
    if (val[0].toHuman() === account.address) {
      exposed = true;
      break;
    }

    // Check if account address is nominating this validator.
    let counter = 0;
    for (const { who } of val[1].toHuman().others) {
      if (counter >= 512) {
        break;
      } else if (who === account.address) {
        exposed = true;
        break;
      }
      counter += 1;
    }

    // Break if the inner loop found exposure.
    if (exposed) {
      break;
    }
  }

  return exposed;
};

/**
 * @name getAccountExposedWestend
 * @summary Return `true` if address is exposed in `era`. Return `false` otherwise.
 */
export const getAccountExposed = async (
  api: ApiPromise,
  era: number,
  account: Account,
  validatorData: ValidatorData[]
): Promise<boolean> => {
  const validators = validatorData.map((v) => v.validatorId);
  let exposed = false;

  // Iterate validators account is nominating.
  validatorLoop: for (const vId of validators) {
    // Check if target address is the validator.
    if (account.address === vId) {
      exposed = true;
      break;
    }

    // Iterate validator paged exposures.
    const result: AnyData = await api.query.staking.erasStakersPaged.entries(
      era,
      vId
    );

    let counter = 0;

    for (const item of result) {
      for (const { who } of item[1].toHuman().others) {
        // Move to next validator if account is not in top 512 stakers for this validator.
        if (counter >= 512) {
          continue validatorLoop;
        }
        // We know the account is exposed for this era if their address is found.
        if ((who as string) === account.address) {
          exposed = true;
          break validatorLoop;
        }
        counter += 1;
      }
    }
  }

  return exposed;
};

/**
 * @name getAccountNominatingData
 * @summary Get an account's live nominating data.
 */
export const getAccountNominatingData = async (
  api: ApiPromise,
  account: Account
): Promise<AccountNominatingData | null> => {
  // eslint-disable-next-line prettier/prettier
  const nominatorData: AnyData = await api.query.staking.nominators(account.address);
  const nominators = nominatorData.toHuman();

  // Return early if account is not nominating.
  if (nominators === null) {
    return null;
  }

  // Get submitted in era.
  const submittedIn: number = parseInt(
    (nominators.submittedIn as string).replace(/,/g, '')
  );

  // Get account's nominations.
  const validators: ValidatorData[] = [];
  const eraData: AnyData = (await api.query.staking.activeEra()).toHuman();
  const era: number = parseInt((eraData.index as string).replace(/,/g, ''));

  for (const validatorId of nominators.targets as string[]) {
    const prefs: AnyData = (
      await api.query.staking.erasValidatorPrefs(era, validatorId)
    ).toHuman();

    const commission: string = prefs.commission as string;
    validators.push({ validatorId, commission });
  }

  // Get exposed flag.
  const exposed: boolean = await getAccountExposed(
    api,
    era,
    account,
    validators
  );

  return {
    exposed,
    lastCheckedEra: era,
    submittedIn,
    validators,
  } as AccountNominatingData;
};

/**
 * @name areArraysEqual
 * @summary Checks if two string arrays are equal, returns `true` or `false`.
 */
export const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * @name getPagedErasStakers
 * @summary Get an era validator and staker data.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getPagedErasStakers = async (api: ApiPromise, era: string) => {
  const overview: AnyData =
    await api.query.staking.erasStakersOverview.entries(era);

  const validators = overview.reduce(
    (prev: Record<string, AnyData>, [keys, value]: AnyData) => {
      const validator = keys.toHuman()[1];
      const { own, total } = value.toHuman();
      return { ...prev, [validator]: { own, total } };
    },
    {}
  );

  const validatorKeys = Object.keys(validators);
  const pagedResults = await Promise.all(
    validatorKeys.map((v) => api.query.staking.erasStakersPaged.entries(era, v))
  );

  const result: AnyData[] = [];
  let i = 0;
  for (const pagedResult of pagedResults) {
    const validator = validatorKeys[i];
    const { own, total } = validators[validator];
    const others = pagedResult.reduce((prev: AnyData[], [, v]: AnyData) => {
      const o = v.toHuman()?.others || [];
      if (!o.length) {
        return prev;
      }
      return prev.concat(o);
    }, []);

    result.push({
      keys: [rmCommas(era), validator],
      val: {
        total: rmCommas(total),
        own: rmCommas(own),
        others: others.map(({ who, value }) => ({
          who,
          value: rmCommas(value),
        })),
      },
    });
    i++;
  }
  return result;
};
