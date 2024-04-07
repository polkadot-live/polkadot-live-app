// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@app/library/Menu';
import { useLocation } from 'react-router-dom';
import { HeaderWrapper } from './Wrapper';
import type { HeaderProps } from './types';
import { getApiInstance } from '@/utils/ApiUtils';
import type { AnyData } from '@/types/misc';
import BigNumber from 'bignumber.js';
import type { ApiPromise } from '@polkadot/api';
import { rmCommas } from '@w3ux/utils';

export const Header = ({ showMenu, appLoading = false }: HeaderProps) => {
  const { pathname } = useLocation();

  // Determine active window by pathname.
  let activeWindow: string;
  switch (pathname) {
    case '/import':
      activeWindow = 'import';
      break;
    default:
      activeWindow = 'menu';
  }

  // Calculate eras to check for pending payouts.
  const getErasInterval = (era: BigNumber) => {
    const MaxSupportedPayoutEras = 7;

    const startEra = era.minus(1);
    const endEra = BigNumber.max(
      startEra.minus(MaxSupportedPayoutEras).plus(1),
      1
    );

    return { startEra, endEra };
  };

  // Get list of validators that an account nominated during an era.
  const getEraValidators = async (
    api: ApiPromise,
    era: BigNumber,
    accountAddress: string
  ): Promise<string[]> => {
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

  interface LocalValidatorExposure {
    staked: string;
    total: string;
    isValidator: boolean;
  }

  // Get exposure data for an account.
  const getLocalEraExposure = async (
    api: ApiPromise,
    era: string,
    account: string,
    validator: string
  ) => {
    const result: AnyData = (
      await api.query.staking.erasStakers(era, validator)
    ).toHuman();

    // total, own others: { who, value }
    for (const { who, value } of result.others) {
      if (who === account) {
        console.log('---------- STAKER FOUND ----------');
        return {
          staked: value as string,
          total: result.total as string,
          isValidator: account === validator,
        } as LocalValidatorExposure;
      }
    }

    return null;
  };
  // Function to calculate an account's unclaimed payouts.
  const getUnclaimedPayouts = async () => {
    const address = '13htYtmALyHWxz6s6zcEnDtwBmtL1Ay54U3i4TEM555HJEhL';

    /**
     * Get API instance and active era.
     */
    const { api } = await getApiInstance('Polkadot');
    const era_res: AnyData = (await api.query.staking.activeEra()).toHuman();
    const activeEra: BigNumber = new BigNumber(
      parseInt((era_res.index as string).replace(/,/g, ''))
    );

    /**
     * Accumulate eras to check, and determine all validator ledgers to
     * fetch from exposures.
     */
    const erasValidators = [];
    const { startEra, endEra } = getErasInterval(activeEra);
    let erasToCheck: string[] = [];
    let currentEra = startEra;

    while (currentEra.isGreaterThanOrEqualTo(endEra)) {
      const validators = await getEraValidators(api, currentEra, address);
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
    console.log('ERAS TO CHECK:');
    console.log(erasToCheck);

    console.log('UNIQUE VALIDATORS:');
    console.log(uniqueValidators);

    /**
     * Helper function to check which eras a validator was exposed in.
     */
    const validatorExposedEras = async (
      validator: string
    ): Promise<string[]> => {
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

    // Sanity check.
    console.log('EXPOSED ERAS:');
    console.log(
      await validatorExposedEras(
        '1zugcag7cJVBtVRnFxv5Qftn7xKAnR6YJ9x4x3XLgGgmNnS'
      )
    );

    /**
     * Fetch controllers in order to query ledgers (controllers of uniqueValidators array)
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
    console.log('VALIDATOR CONTROLLERS:');
    console.log(validatorControllers);

    /**
     * Unclaimed rewards by validator. Map<validator, eras[]>
     */
    const unclaimedRewards = new Map<string, string[]>();

    // DEPRECATION: Paged Rewards
    //
    // Use `staking.ledger` to get unclaimed reward eras. Read `LegacyClaimedRewards`.
    // Use `claimedRewards`.
    const ledgerResults: AnyData = await api.query.staking.ledger.multi(
      Array.from(validatorControllers.values())
    );

    // Fetch ledgers to determine which eras have not yet been claimed per validator.
    // Only includes eras that are in `erasToCheck`.
    for (const ledgerResult of ledgerResults) {
      const ledger = ledgerResult.unwrapOr(null)?.toHuman();
      if (ledger) {
        // Get claimed eras within `erasToCheck`.
        const erasClaimed: string[] = ledger.claimedRewards
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

    // Sanity check,
    console.log('UNCLAIMED REWARDS: <validatorId, eras_unclaimed>');
    console.log(unclaimedRewards);

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
    console.log('UNCLAIMED BY ERA:');
    console.log(unclaimedByEra);

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
    console.log('CALLS:');
    console.log(calls);

    /**
     * Iterate calls and determine unclaimed payouts.
     * `unclaimed:
     *   Map<era,
     *       Map<validator, unclaimedPayouts>>
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
        );

        // Get validator from era exposure data (`null` if not found).
        const validator = unclaimedValidators[j] || '';
        const localExposed: LocalValidatorExposure | null =
          await getLocalEraExposure(api, era, address, validator);

        const staked = new BigNumber(localExposed?.staked || '0');
        const total = new BigNumber(localExposed?.total || '0');
        const isValidator = localExposed?.isValidator || false;
        const exposedPage = 1; // TODO: change when integrating new API.

        // Calculate the validator's share of total era payout.
        const totalRewardPoints = new BigNumber(
          rmCommas(eraRewardPoints.total)
        );

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

        //------------------------------------------------------------
        // Debugging
        console.log('localExposed:');
        console.log(localExposed);
        console.log(`total reward points: ${totalRewardPoints.toString()}`);
        console.log(
          `validator reward points: ${validatorRewardPoints.toString()}`
        );
        console.log(`avail: ${avail}`);
        console.log(`staked: ${staked}`);
        console.log(`total: ${total}`);
        console.log(`commission: ${commission}`);
        console.log(`valCut: ${valCut}`);

        console.log('UNCLAIMED FOR VALIDATOR:');
        console.log(unclaimedPayout.toString());
        //------------------------------------------------------------

        if (!unclaimedPayout.isZero()) {
          const fetched = unclaimed.get(era) || new Map();
          fetched.set(validator, [exposedPage, unclaimedPayout.toString()]);
          unclaimed.set(era, fetched);
          j++;
        }
      }

      // TODO: Could set this data somewhere.
      console.log(era, address, unclaimed.get(era), endEra.toString());

      // Increment outer loop index.
      i++;
    }

    // TODO: Set this data somewhere.
    console.log(`UNCLAIMED:`);
    console.log(unclaimed);
  };

  return (
    <HeaderWrapper>
      <div />
      <div>
        {showMenu || activeWindow === 'menu' ? (
          <>
            <button
              type="button"
              disabled={appLoading}
              onClick={async () => await getUnclaimedPayouts()}
            >
              <FontAwesomeIcon icon={faToggleOn} transform="grow-3" />
            </button>
            <Menu />
          </>
        ) : (
          <button
            type="button"
            disabled={appLoading}
            onClick={() => window.myAPI.closeWindow(activeWindow)}
          >
            <FontAwesomeIcon icon={faTimes} transform="shrink-1" />
          </button>
        )}
      </div>
    </HeaderWrapper>
  );
};
