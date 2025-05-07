// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { perbillToPercent } from '../CommonLib';
import { AccountId32 } from 'dedot/codecs';
import { rmCommas } from '@w3ux/utils';
import type { Account } from '../../model/Account';
import type { RelayDedotClient } from '@polkadot-live/types/apis';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  AccountNominatingData,
  ValidatorData,
} from '@polkadot-live/types/accounts';
import type {
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@dedot/chaintypes/substrate';

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

  // Asynchronously cache validator metadata in map.
  const asyncAddValidatorInfo = async (
    keys: [number, AccountId32],
    info: SpStakingPagedExposureMetadata
  ) => {
    validators.set(keys[1].address(prefix), {
      total: info.total.toString(),
      own: info.own.toString(),
      nominatorCount: info.nominatorCount.toString(),
      pageCount: info.pageCount.toString(),
    });
  };

  await Promise.all(
    overview.map(([keys, value]) => asyncAddValidatorInfo(keys, value))
  );

  // Map <validatorId, stakedAmount[]>
  const addressStake = new Map<string, string[]>();
  const validatorIds = Array.from(validators.keys());

  // [[era, validatorId, zeroIndexPageCount], ...}][]
  type PageResult = [[number, AccountId32, number], SpStakingExposurePage][];

  const asyncFindStakeInOthers = async (other: {
    who: AccountId32;
    value: bigint;
  }): Promise<string[]> => {
    const { who, value } = other;
    return who.address(prefix) === address ? [value.toString()] : [];
  };

  const asyncSetValidatorAddressStake = async (pageResult: PageResult) => {
    for (const page of pageResult) {
      const [, { others: os }] = page;
      const vs = await Promise.all(os.map((o) => asyncFindStakeInOthers(o)));
      return vs.flat();
    }
    return [];
  };

  // Dedot implements batching from version 0.9.5 for processing hundreds of async queries.
  const eraStakersPaged = await Promise.all(
    validatorIds.map((v) => api.query.staking.erasStakersPaged.entries(era, v))
  );

  // Check if account has stake for each validator.
  const valToStake = await Promise.all(
    eraStakersPaged.map(async (page) => {
      const vs = await asyncSetValidatorAddressStake(page);
      return { vid: page[0][0][1].address(prefix), stake: vs };
    })
  );

  // Set account stake in map.
  for (const { vid, stake } of valToStake) {
    if (stake.length > 0) {
      addressStake.set(vid, stake);
    }
  }

  if (showDebug) {
    console.log(`Stake for ${address}:`);
    console.log(addressStake);
  }

  // Get nominated validator commissions.
  const commissions = new Map<string, string>();
  const vs = Array.from(addressStake.keys());
  const prefs = await Promise.all(
    vs.map((v) => api.query.staking.erasValidatorPrefs([era, v]))
  );
  prefs.forEach((p, i) =>
    commissions.set(vs[i], perbillToPercent(p.commission))
  );

  // Calculate unclaimed rewards for each nominated validator.
  let totalRewards = new BigNumber(0);
  for (const v of vs) {
    // Parse commission to big number.
    const commission = new BigNumber(
      commissions.get(v)!.replace(/%/g, '')
    ).multipliedBy(0.01);

    // Get total staked amount by the address.
    const staked = addressStake
      .get(v)!
      .reduce((acc, cur) => acc.plus(cur), new BigNumber(0));

    // Get validator's total stake.
    const { total: vTotal } = validators.get(v)!;
    const total = new BigNumber(vTotal);

    // Calculate available validator rewards for the era based on reward points.
    const totalRewardPoints = new BigNumber(eraRewardPoints.total.toString());
    const pointsData = eraRewardPoints.individual.find(
      (i) => i[0].address(prefix) === v
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
          .plus(address === v ? valCut : 0);

    showDebug && console.log(`${v}: ${eraRewardsForValidator.toString()}`);
    totalRewards = totalRewards.plus(eraRewardsForValidator);
  }

  return totalRewards;
};

/**
 * @name getAccountExposed
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
    let counter = 0;
    for (const [, page] of result) {
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
    const commission: string = perbillToPercent(prefs.commission);
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
