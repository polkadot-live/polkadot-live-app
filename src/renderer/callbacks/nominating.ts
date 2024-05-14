// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { rmCommas } from '@w3ux/utils';
import type { Account } from '@/model/Account';
import type { AnyData } from '@/types/misc';
import type { ApiPromise } from '@polkadot/api';
import type { ChainID } from '@/types/chains';
import type { ValidatorData } from '@/types/accounts';

const MaxSupportedPayoutEras = 7;

const NetworksWithPagedRewards: ChainID[] = ['Westend'];

const PagedRewardsStartEra = new Map<ChainID, BigNumber | null>([
  ['Polkadot', new BigNumber(1420)],
  ['Kusama', new BigNumber(6514)],
  ['Westend', new BigNumber(7167)],
]);

interface LocalValidatorExposure {
  staked: string;
  total: string;
  isValidator: boolean;
  exposedPage?: number;
}

/**
 * @name isPagedRewardsActive
 * @summary Given an era, determine whether paged rewards are active.
 */
const isPagedRewardsActive = (era: BigNumber, chainId: ChainID): boolean => {
  const networkStartEra = PagedRewardsStartEra.get(chainId) || null;

  return !networkStartEra
    ? false
    : NetworksWithPagedRewards.includes(chainId) &&
        era.isGreaterThanOrEqualTo(networkStartEra);
};

/**
 * @name getErasInterval
 * @summary Calculate eras to check for pending payouts.
 */
const getErasInterval = (era: BigNumber) => {
  const startEra = era.minus(1);
  const endEra = BigNumber.max(
    startEra.minus(MaxSupportedPayoutEras).plus(1),
    1
  );

  return { startEra, endEra };
};

/**
 * @name getEraValidators
 * @summary Get list of validators that an account nominated during an era.
 */
const getEraValidatorsLegacy = async (
  api: ApiPromise,
  era: BigNumber,
  accountAddress: string
): Promise<string[]> => {
  // Fetch array of exposure data for each validator in the era.
  const result = await api.query.staking.erasStakers.entries(era.toNumber());
  const validators: string[] = [];

  for (const item of result) {
    // Check if account has nominated this validator during `era`.
    let counter = 0;

    for (const { who } of (item[1].toHuman() as AnyData).others) {
      if (counter >= 512) {
        break;
      } else {
        // Add validator ID to outer array if it was nominated by account in `era`.
        if ((who as string) === accountAddress) {
          const validatorId: string = (item[0].toHuman() as AnyData)[1];
          validators.push(validatorId);
          break;
        }
      }
      counter += 1;
    }
  }

  return validators;
};

/**
 * @name getEraValidatorsWestend
 * @summary Get list of validators that an account nominated during an era using new paged API.
 */
const getEraValidatorsPaged = async (
  api: ApiPromise,
  era: BigNumber,
  accountAddress: string
) => {
  const validators: string[] = [];

  // Get list of validators and pageCount for the era.
  const results: AnyData = await api.query.staking.erasStakersOverview.entries(
    era.toNumber()
  );

  // Counter for how many validators account has nomiated (max 16).
  let nominatedValidatorCount = 0;

  // Iterate the validators.
  validatorLoop: for (const item of results) {
    const validator = item[0].toHuman()[1];

    let counter = 0;
    let addressFound = false;

    // Use erasStakersPaged.entries() to iterate pages.
    const pagesData: AnyData = await api.query.staking.erasStakersPaged.entries(
      era.toNumber(),
      validator
    );

    for (const paged of pagesData) {
      for (const { who } of paged[1].toHuman().others) {
        if (counter >= 512) {
          continue validatorLoop;
        } else if ((who as string) === accountAddress) {
          validators.push(validator);
          nominatedValidatorCount += 1;
          addressFound = true;
          break;
        }

        counter += 1;
      }

      if (nominatedValidatorCount >= 16) {
        break validatorLoop;
      } else if (addressFound) {
        continue validatorLoop;
      }
    }
  }

  return validators;
};

/**
 * @name getLocalEraExposure
 * @summary Get exposure data for an account.
 */
const getLocalEraExposure = async (
  api: ApiPromise,
  era: string,
  accountAddress: string,
  validator: string
): Promise<LocalValidatorExposure | null> => {
  const result: AnyData = (
    await api.query.staking.erasStakers(era, validator)
  ).toHuman();

  // total, own others: { who, value }
  for (const { who, value } of result.others) {
    if (who === accountAddress) {
      return {
        staked: value as string,
        total: result.total as string,
        isValidator: accountAddress === validator,
      } as LocalValidatorExposure;
    }
  }

  return null;
};

/**
 * @name getLocalEraExposureWestend
 * @summary Get exposure data for an account using the new paged API.
 */
const getLocalEraExposureWestend = async (
  api: ApiPromise,
  era: string,
  accountAddress: string,
  validator: string
): Promise<LocalValidatorExposure | null> => {
  const result: AnyData = await api.query.staking.erasStakersPaged.entries(
    era,
    validator
  );

  for (const item of result) {
    for (const { who, value } of item[1].toHuman().others) {
      if ((who as string) === accountAddress) {
        const exposedPage = parseInt(rmCommas(item[0].toHuman()[2] as string));

        const overview: AnyData = (
          await api.query.staking.erasStakersOverview(era, validator)
        ).toHuman();

        return {
          staked: value as string,
          total: overview.total as string,
          isValidator: accountAddress === validator,
          exposedPage,
        } as LocalValidatorExposure;
      }
    }
  }

  return null;
};

/**
 * @name getUnclaimedPayouts
 * @summary Function to calculate an account's unclaimed payouts.
 */
export const getUnclaimedPayouts = async (
  address: string,
  api: ApiPromise,
  chainId: ChainID,
  showDebug = false
) => {
  /**
   * Get API instance and active era.
   */
  const era_res: AnyData = (await api.query.staking.activeEra()).toHuman();
  const activeEra: BigNumber = new BigNumber(
    parseInt((era_res.index as string).replace(/,/g, ''))
  );

  // Flag to determine whether to use paged or legacy API.
  const pagedRewardsActive: boolean = isPagedRewardsActive(activeEra, chainId);

  /**
   * Accumulate eras to check, and determine all validator ledgers to
   * fetch from exposures.
   */
  const erasValidators = [];
  const { startEra, endEra } = getErasInterval(activeEra);
  let erasToCheck: string[] = [];
  let currentEra = startEra;

  while (currentEra.isGreaterThanOrEqualTo(endEra)) {
    const validators = pagedRewardsActive
      ? await getEraValidatorsPaged(api, currentEra, address)
      : await getEraValidatorsLegacy(api, currentEra, address);

    erasValidators.push(...validators);
    erasToCheck.push(currentEra.toString());
    currentEra = currentEra.minus(1);
  }

  /**
   * Ensure no validator duplicates.
   */
  const uniqueValidators = [...new Set(erasValidators)];
  erasToCheck = erasToCheck.sort((a: string, b: string) =>
    new BigNumber(b).minus(a).toNumber()
  );

  // Sanity check.
  if (showDebug) {
    console.log('> getUnclaimedPayputs: erasToCheck');
    console.log(erasToCheck);
    console.log('> getUnclaimedPayouts: uniqueValidators');
    console.log(uniqueValidators);
  }

  /**
   * Helper function to check which eras a validator was exposed in.
   */
  const validatorExposedEras = async (validator: string): Promise<string[]> => {
    const exposedEras: string[] = [];

    for (const era of erasToCheck) {
      // Get list of exposed validators in `era`.
      const result = await api.query.staking.erasStakers.entries(era);

      // Iterate exposed validators and check if the passed validator was exposed in `era`.
      for (const item of result) {
        const validatorId: string = (item[0].toHuman() as AnyData)[1];
        if (validatorId === validator) {
          exposedEras.push(era);
          break;
        }
      }
    }

    return exposedEras;
  };

  /**
   * Fetch controllers in order to query ledgers (controllers of uniqueValidators array).
   */
  const bondedResults =
    await api.query.staking.bonded.multi<AnyData>(uniqueValidators);

  // Map of <ValidatorId, ValidatorControllerAccount>
  const validatorControllers = new Map<string, string>();

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < bondedResults.length; ++i) {
    const controller = bondedResults[i].unwrapOr(null);
    if (controller) {
      validatorControllers.set(uniqueValidators[i], controller.toHuman());
    }
  }

  // Sanity check.
  if (showDebug) {
    console.log('> getUnclaimedPayouts: validatorControllers:');
    console.log(validatorControllers);
  }

  /**
   * Unclaimed rewards by validator. Map<validator, eras[]>
   */
  const unclaimedRewards = new Map<string, string[]>();

  if (pagedRewardsActive) {
    // Accumulate calls to fetch unclaimed rewards for each era for all validators.
    const unclaimedRewardsEntries = erasToCheck
      .map((era) => uniqueValidators.map((v) => [era, v]))
      .flat();

    const results: AnyData = await Promise.all(
      unclaimedRewardsEntries.map(([era, v]) =>
        api.query.staking.claimedRewards<AnyData>(era, v)
      )
    );

    for (let i = 0; i < results.length; i++) {
      const pages = results[i].toHuman() || [];
      const era = unclaimedRewardsEntries[i][0];
      const validator = unclaimedRewardsEntries[i][1];
      const exposure = await getLocalEraExposureWestend(
        api,
        era,
        address,
        validator
      );

      // Add to `unclaimedRewards` if payout page has not yet been claimed.
      if (!pages.includes(exposure!.exposedPage)) {
        const fetched = unclaimedRewards.get(validator);

        if (fetched) {
          unclaimedRewards.set(validator, [...fetched, era]);
        } else {
          unclaimedRewards.set(validator, [era]);
        }
      }
    }
  } else {
    // DEPRECATION: Paged Rewards
    //
    // Use `staking.ledger` to get unclaimed reward eras. Read `LegacyClaimedRewards`.
    // Use `claimedRewards`.
    const ledgerResults = await api.query.staking.ledger.multi<AnyData>(
      Array.from(validatorControllers.values())
    );

    // Fetch ledgers to determine which eras have not yet been claimed per validator.
    // Only includes eras that are in `erasToCheck`.
    for (const ledgerResult of ledgerResults) {
      const ledger = ledgerResult.unwrapOr(null)?.toHuman();
      if (ledger) {
        // Get claimed eras within `erasToCheck`.
        const erasClaimed: string[] = ledger[
          pagedRewardsActive ? 'legacyClaimedRewards' : 'claimedRewards'
        ]
          .map((e: string) => rmCommas(e))
          .filter(
            (e: string) =>
              new BigNumber(e).isLessThanOrEqualTo(startEra) &&
              new BigNumber(e).isGreaterThanOrEqualTo(endEra)
          );

        // Filter eras yet to be claimed.
        const valExposedEras = await validatorExposedEras(ledger.stash);

        unclaimedRewards.set(
          ledger.stash,
          erasToCheck.filter(
            (era) => valExposedEras.includes(era) && !erasClaimed.includes(era)
          )
        );
      }
    }
  }

  // Sanity check,
  if (showDebug) {
    console.log(
      '> getUnclaimedPayouts: unclaimedRewards: <validatorId, erasUnclaimed>'
    );
    console.log(unclaimedRewards);
  }

  /**
   * Reformat `unclaimedRewards` to be <era: validators[]>
   */
  const unclaimedByEra = new Map<string, string[]>();

  erasToCheck.forEach((era) => {
    const eraValidators: string[] = [];
    for (const [validator, eras] of unclaimedRewards.entries()) {
      if (eras.includes(era)) {
        eraValidators.push(validator);
      }
    }
    if (eraValidators.length > 0) {
      unclaimedByEra.set(era, eraValidators);
    }
  });

  // Sanity check.
  if (showDebug) {
    console.log('> getUnclaimedPayouts: unclaimedByEra');
    console.log(unclaimedByEra);
  }

  /**
   * Accumulate calls needed to fetch data to accumulate rewards.
   */
  const calls: AnyData[] = [];
  for (const [era, validators] of unclaimedByEra.entries()) {
    if (validators.length > 0) {
      // Calls for era validaotor reward and era points.
      const subCalls: AnyData[] = [
        api.query.staking.erasValidatorReward<AnyData>(era),
        api.query.staking.erasRewardPoints<AnyData>(era),
      ];

      // Calls to get validator commissions.
      validators.map((validator) =>
        subCalls.push(
          api.query.staking.erasValidatorPrefs<AnyData>(era, validator)
        )
      );

      // Push calls to outer array.
      calls.push(Promise.all(subCalls));
    }
  }

  // Sanity check.
  if (showDebug) {
    console.log('> getUnclaimedPayouts: calls');
    console.log(calls);
  }

  /**
   * Iterate calls and determine unclaimed payouts.
   * `unclaimed: Map<era, Map<validator, unclaimedPayouts>>
   */
  const unclaimed = new Map<string, Map<string, [number, string]>>();

  let i = 0;
  for (const [reward, points, ...prefs] of await Promise.all(calls)) {
    const era = Array.from(unclaimedByEra.keys())[i];
    const eraTotalPayout = new BigNumber(rmCommas(reward.toHuman()));
    const eraRewardPoints = points.toHuman();
    const unclaimedValidators = Array.from(unclaimedByEra.values())[i];

    let j = 0;
    for (const pref of prefs) {
      const eraValidatorPrefs = pref.toHuman();
      const commission = new BigNumber(
        eraValidatorPrefs.commission.replace(/%/g, '')
      ).multipliedBy(0.01);

      // Get validator from era exposure data (`null` if not found).
      const validator = unclaimedValidators[j] || '';

      // Fetch exposure using the new paged or legacy API.
      const localExposed: LocalValidatorExposure | null = pagedRewardsActive
        ? await getLocalEraExposureWestend(api, era, address, validator)
        : await getLocalEraExposure(api, era, address, validator);

      const staked = localExposed?.staked
        ? new BigNumber(rmCommas(localExposed.staked))
        : new BigNumber(0);

      const total = localExposed?.total
        ? new BigNumber(rmCommas(localExposed?.total))
        : new BigNumber(0);

      const isValidator = localExposed?.isValidator || false;
      const exposedPage = localExposed?.exposedPage || 1;

      // Calculate the validator's share of total era payout.
      const totalRewardPoints = new BigNumber(rmCommas(eraRewardPoints.total));

      const validatorRewardPoints = new BigNumber(
        rmCommas(eraRewardPoints.individual?.[validator] || '0')
      );

      const avail = eraTotalPayout
        .multipliedBy(validatorRewardPoints)
        .dividedBy(totalRewardPoints);

      const valCut = commission.multipliedBy(avail);

      const unclaimedPayout = total.isZero()
        ? new BigNumber(0)
        : avail
            .minus(valCut)
            .multipliedBy(staked)
            .dividedBy(total)
            .plus(isValidator ? valCut : 0);

      if (!unclaimedPayout.isZero()) {
        const fetched = unclaimed.get(era) || new Map();
        fetched.set(validator, [exposedPage, unclaimedPayout.toString()]);
        unclaimed.set(era, fetched);
        j++;
      }
    }

    // Increment outer loop index.
    i++;
  }

  if (showDebug) {
    console.log(`> getUnclaimedPayouts: unclaimed`);
    console.log(unclaimed);
  }

  return unclaimed;
};

/**
 * @name getAccountExposed
 * @summary Return `true` if address is exposed in `era`. Return `false` otherwise.
 */
export const getAccountExposed = async (
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
export const getAccountExposedWestend = async (
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
