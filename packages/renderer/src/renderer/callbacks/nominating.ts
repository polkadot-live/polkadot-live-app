// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { AccountId32 } from 'dedot/codecs';
import { formatPerbillPercent } from '@ren/utils/AccountUtils';
import { rmCommas } from '@w3ux/utils';
import type { RelayDedotClient } from '@polkadot-live/types/apis';
import type { Account } from '@ren/model/Account';
import type { AnyData } from '@polkadot-live/types/misc';
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
  api: RelayDedotClient,
  era: number
) => {
  const showDebug = false;

  const eraPayoutResult = await api.query.staking.erasValidatorReward(era);
  const eraTotalPayout = new BigNumber(eraPayoutResult!.toString());
  const eraRewardPoints = await api.query.staking.erasRewardPoints(era);
  const prefix = api.consts.system.ss58Prefix;

  // Cache the era's validator overviews.
  const validators = new Map<string, ValidatorOverviewData>();
  const overview = await api.query.staking.erasStakersOverview.entries(era);

  // [[number, AccountId32], SpStakingPagedExposureMetadata][]
  for (const [keys, value] of overview) {
    const vId = keys[1].address(prefix);
    const { total, own, nominatorCount, pageCount } = value;
    validators.set(vId, {
      total: total.toString(),
      own: own.toString(),
      nominatorCount: nominatorCount.toString(),
      pageCount: pageCount.toString(),
    });
  }

  // Get address staking data for this era.
  const validatorIds = Array.from(validators.keys());
  // [[number, AccountId32, number], SpStakingExposurePag][][]
  const pagedResults = await Promise.all(
    validatorIds.map((vId) =>
      api.query.staking.erasStakersPaged.entries(era, new AccountId32(vId))
    )
  );

  // Map data is <validatorId, stakedAmount[]>
  const addressStake = new Map<string, string[]>();
  const log = true;
  for (const pageResult of pagedResults) {
    // [[number, AccountId32, number], SpStakingExposurePag][]
    const [obj] = pageResult;
    const pageEra = obj[0][0];
    const pageValidator = obj[0][1].address(prefix);
    const page = obj[0][2];
    showDebug && log && console.log(pageEra, pageValidator, page);

    const pageTotal = obj[1].pageTotal;
    const others = obj[1].others;
    showDebug && log && console.log(pageTotal);

    for (const { who, value } of others) {
      showDebug && log && console.log(who, value);
      if (who.address(prefix) === address) {
        addressStake.has(pageValidator)
          ? addressStake.set(pageValidator, [
              ...addressStake.get(pageValidator)!,
              value.toString(),
            ])
          : addressStake.set(pageValidator, [value.toString()]);
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
    vids.map((vid) =>
      api.query.staking.erasValidatorPrefs([era, new AccountId32(vid)])
    )
  );

  for (let i = 0; i < prefResults.length; ++i) {
    commissions.set(vids[i], formatPerbillPercent(prefResults[i].commission));
  }

  // TODO: Remove `rmCommas` call
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
    const totalRewardPoints = new BigNumber(
      rmCommas(eraRewardPoints.total.toString())
    );

    const pointsData = eraRewardPoints.individual.find(
      (i) => i[0].address(prefix) === vid
    )!;
    const validatorRewardPoints = new BigNumber(pointsData[1]);

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
 * @name getAccountExposedWestend
 * @summary Return `true` if address is exposed in `era`. Return `false` otherwise.
 */
export const getAccountExposed = async (
  api: RelayDedotClient,
  era: number,
  account: Account,
  validatorData: ValidatorData[]
): Promise<boolean> => {
  const validators = validatorData.map((v) => v.validatorId);
  const prefix = api.consts.system.ss58Prefix;
  let exposed = false;

  // Check if target address is the validator.
  if (validators.find((vId) => account.address === vId)) {
    return true;
  }

  // Get paged data for each nominated validator.
  const results = await Promise.all(
    validators.map((vId) =>
      api.query.staking.erasStakersPaged.entries(era, vId)
    )
  );

  // Check if account is exposed in the current era.
  validatorLoop: for (const result of results) {
    for (const [, page] of result) {
      let counter = 0;
      for (const { who } of page.others) {
        // Move to next validator if account is not in top 512 stakers.
        if (counter > 512) {
          continue validatorLoop;
        }
        // Account is exposed in this era if its address is found.
        if (who.address(prefix) === account.address) {
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
  api: RelayDedotClient,
  account: Account
): Promise<AccountNominatingData | null> => {
  const nominators = await api.query.staking.nominators(account.address);

  // Return early if account is not nominating.
  if (!nominators) {
    return null;
  }

  // Get account's nominations.
  const submittedIn = nominators.submittedIn;
  const validators: ValidatorData[] = [];
  const era = (await api.query.staking.activeEra())!.index;
  const prefix = api.consts.system.ss58Prefix;

  for (const validatorId of nominators.targets) {
    const address = validatorId.address(prefix);
    const prefs = await api.query.staking.erasValidatorPrefs([era, address]);
    const commission: string = formatPerbillPercent(prefs.commission);
    validators.push({ validatorId: address, commission });
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
 * @todo Verify function is correct if used in future.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getPagedErasStakers = async (api: RelayDedotClient, era: string) => {
  const overview = await api.query.staking.erasStakersOverview.entries(
    Number(era)
  );

  const prefix = api.consts.system.ss58Prefix;
  const validators = overview.reduce(
    (prev: Record<string, AnyData>, [keys, value]) => {
      const validator = keys[1].address(prefix);
      const { own, total } = value;
      return {
        ...prev,
        [validator]: { own: own.toString(), total: total.toString() },
      };
    },
    {}
  );

  const validatorKeys = Object.keys(validators);
  const pagedResults = await Promise.all(
    validatorKeys.map((v) =>
      api.query.staking.erasStakersPaged.entries(
        Number(era),
        new AccountId32(v)
      )
    )
  );

  const result: AnyData[] = [];
  let i = 0;
  for (const pagedResult of pagedResults) {
    // [[number, AccountId32, number], SpStakingExposurePage]
    const validator = validatorKeys[i];
    const { own, total } = validators[validator];

    type Target = { who: string; value: string }[];
    const others: Target = pagedResult.reduce((prev: Target, [, v]) => {
      const o = v.others || [];
      return !o.length
        ? prev
        : prev.concat(
            o.map(({ who, value }) => ({
              who: who.address(prefix),
              value: rmCommas(value.toString()),
            }))
          );
    }, []);

    result.push({
      keys: [era, validator],
      val: {
        total: rmCommas(total),
        own: rmCommas(own),
        others,
      },
    });
    i++;
  }

  return result;
};
