// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import BigNumber from 'bignumber.js';
import { checkAccountWithProperties } from '@/utils/AccountUtils';
import { Config as RendererConfig } from '@/config/processes/renderer';
import { EventsController } from '@/controller/renderer/EventsController';
import {
  getAccountExposed_deprecated,
  getAccountNominatingData,
  getUnclaimedPayouts,
} from './nominating';
import { NotificationsController } from '@/controller/renderer/NotificationsController';
import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { rmCommas } from '@w3ux/utils';
import * as ApiUtils from '@/utils/ApiUtils';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { AnyData } from '@/types/misc';
import type { EventCallback } from '@/types/reporter';
import type { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { ValidatorData } from '@/types/accounts';

export class Callbacks {
  /**
   * @name callback_query_timestamp_now
   * @summary Callback for 'subscribe:chain:timestamp'.
   *
   * Get the timestamp of the target chain and render it as a notification on
   * the frontend.
   */
  static callback_query_timestamp_now(
    data: AnyData,
    entry: ApiCallEntry,
    wrapper: QueryMultiWrapper
  ) {
    try {
      const { action, chainId } = entry.task;
      const timeBuffer = 20;

      const newVal = new BigNumber(data);
      const curVal = new BigNumber(
        wrapper.getChainTaskCurrentVal(action, chainId)
      );

      // Return if value hasn't changed since last callback or time buffer hasn't passed.
      if (
        JSON.stringify(newVal) === JSON.stringify(curVal) ||
        newVal.minus(curVal).lte(timeBuffer)
      ) {
        return;
      }

      // Cache new value.
      wrapper.setChainTaskVal(entry, newVal, chainId);

      // Debugging.
      const now = new Date(data * 1000).toDateString();
      console.log(`Now: ${now} | ${data}`);

      // Send event and notification data to main process.
      const event = EventsController.getEvent(entry, String(newVal));
      window.myAPI.persistEvent(event, null);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_query_babe_currentSlot
   * @summary Callback for 'subscribe:chain:currentSlot'.
   *
   * Get the current slot of the target chain and render it as a notification
   * on the frontend.
   */
  static callback_query_babe_currentSlot(
    data: AnyData,
    entry: ApiCallEntry,
    wrapper: QueryMultiWrapper
  ) {
    try {
      const { action, chainId } = entry.task;
      const newVal = new BigNumber(data);
      const curVal = wrapper.getChainTaskCurrentVal(action, chainId);

      // Return if value hasn't changed since last callback.
      if (JSON.stringify(newVal) === JSON.stringify(curVal)) {
        return;
      }

      // Cache new value.
      wrapper.setChainTaskVal(entry, newVal, chainId);

      // Debugging.
      console.log(`Current Sot: ${newVal}`);

      // Send event and notification data to main process.
      const event = EventsController.getEvent(entry, String(newVal));
      window.myAPI.persistEvent(event, null);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_account_balance_free
   * @summary Handle callback for an account's free balance subscription.
   */
  static async callback_account_balance_free(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return;
      }

      // Get the received balance.
      const free = new BigNumber(rmCommas(String(data.data.free)));

      let isSame = false;
      if (account.balance.free) {
        isSame = free.eq(account.balance.free);
      }

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.free = free;
        account.balance.nonce = new BigNumber(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create event and parse into same format as persisted events.
      const event = EventsController.getEvent(entry, { free });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { free })
        : null;

      // Send event and notification data to main process.
      window.myAPI.persistEvent(parsed, notification, isOneShot);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_account_balance_frozen
   * @summary Handle callback for an account's frozen balance subscription.
   */
  static async callback_account_balance_frozen(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return;
      }

      // Get the received frozen balance.
      const frozen = new BigNumber(rmCommas(String(data.data.frozen)));

      let isSame = false;
      if (account.balance.frozen) {
        isSame = frozen.eq(account.balance.frozen);
      }

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.frozen = frozen;
        account.balance.nonce = new BigNumber(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create event and parse into same format as persisted events.
      const event = EventsController.getEvent(entry, { frozen });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { frozen })
        : null;

      // Send event and notification data to main process.
      window.myAPI.persistEvent(parsed, notification, isOneShot);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_account_balance_reserved
   * @summary Handle callback for an account's reserved balance subscription.
   */
  static async callback_account_balance_reserved(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return;
      }

      // Get the received reserved balance.
      const reserved = new BigNumber(rmCommas(String(data.data.reserved)));

      let isSame = false;
      if (account.balance.reserved) {
        isSame = reserved.eq(account.balance.reserved);
      }

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.reserved = reserved;
        account.balance.nonce = new BigNumber(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create an event and parse into same format as persisted event.
      const event = EventsController.getEvent(entry, { reserved });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notificaiton = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { reserved })
        : null;

      // Send event and notification data to main process.
      window.myAPI.persistEvent(parsed, notificaiton, isOneShot);
    } catch (err) {
      console.error(err);
      return;
    }
  }
  /**
   * @name callback_account_balance_spendable
   * @summary Handle callback for an account's spendable balance subscription.
   */
  static async callback_account_balance_spendable(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return;
      }

      // Get API instance.
      const origin = 'callback_account_balance_spendable';
      const { api } = await ApiUtils.getApiInstanceOrThrow(
        account.chain,
        origin
      );

      /*
        Spendable balance equation:
        spendable = free - max(max(frozen, reserved), ed)
      */
      const free = new BigNumber(rmCommas(String(data.data.free)));
      const frozen = new BigNumber(rmCommas(String(data.data.frozen)));
      const reserved = new BigNumber(rmCommas(String(data.data.reserved)));
      const ed = new BigNumber(
        rmCommas(String(api.consts.balances.existentialDeposit))
      );

      let spendable = free.minus(
        BigNumber.max(BigNumber.max(frozen, reserved), ed)
      );

      const zero = new BigNumber(0);
      if (spendable.lt(zero)) {
        spendable = new BigNumber(0);
      }

      // TODO: Remove check, we know the account has a balance.
      let isSame = false;
      if (account.balance) {
        const {
          free: accFree,
          frozen: accFroz,
          reserved: accRes,
        } = account.balance;

        let accSpendable = accFree.minus(
          BigNumber.max(BigNumber.max(accFroz, accRes), ed)
        );

        if (accSpendable.lt(zero)) {
          accSpendable = new BigNumber(0);
        }

        isSame = spendable.eq(accSpendable);
      }

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return;
      }

      // Update account nonce if balance has changed.
      if (!isSame) {
        account.balance.nonce = new BigNumber(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create an event and parse into same format as persisted event.
      const event = EventsController.getEvent(entry, { spendable });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notificaiton = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { spendable })
        : null;

      // Send event and notification to main process.
      window.myAPI.persistEvent(parsed, notificaiton, isOneShot);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nomination_pool_rewards
   * @summary Callback for 'subscribe:account:nominationPools:rewards'.
   *
   * When a nomination pool's free balance changes, check that the subscribed
   * account's pending rewards has changed. If pending rewards have changed,
   * send a notification to inform the user.
   *
   * We need to send a new event if the account has pending rewards.
   * Another process can then check if the event should be rendererd,
   * or whether it's a duplicate.
   */
  static async callback_nomination_pool_rewards(
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);
      const chainId = account.chain;
      const origin = 'callback_nomination_pool_rewards';
      const { api } = await ApiUtils.getApiInstanceOrThrow(chainId, origin);

      // Fetch pending rewards for the account.
      const pendingRewardsPlanck: BigNumber =
        await api.call.nominationPoolsApi.pendingRewards(account.address);

      const isSame =
        account.nominationPoolData!.poolPendingRewards.eq(pendingRewardsPlanck);

      // Return if pending rewards is zero or no change.
      if (
        (!isOneShot && isSame) ||
        (!isOneShot && pendingRewardsPlanck.eq(0))
      ) {
        return;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolPendingRewards = new BigNumber(
          pendingRewardsPlanck
        );
        await AccountsController.set(chainId, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            pendingRewardsPlanck: new BigNumber(pendingRewardsPlanck),
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, {
          pendingRewardsPlanck: new BigNumber(pendingRewardsPlanck),
        }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @name callback_nomination_pool_state
   * @summary Callback for 'subscribe:account:nominationPools:state'
   *
   * When a nomination pool's state changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_state(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool state.
      const receivedPoolState: string = data.toHuman().state;
      const prevState = account.nominationPoolData!.poolState;
      const isSame = prevState === receivedPoolState;

      if (!isOneShot && isSame) {
        return;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolState = receivedPoolState;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            prevState,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { prevState }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nomination_pool_renamed
   * @summary Callback for 'subscribe:account:nominationPools:renamed'
   *
   * When a nomination pool's name changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_renamed(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool name.
      const receivedPoolName: string = u8aToString(u8aUnwrapBytes(data));
      const prevName = account.nominationPoolData!.poolName;
      const isSame = prevName === receivedPoolName || receivedPoolName === '';

      if (!isOneShot && isSame) {
        return;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolName = receivedPoolName;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            prevName,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { prevName }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nomination_pool_roles
   * @summary Callback for 'subscribe:account:nominationPools:roles'
   *
   * When a nomination pool's name changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_roles(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool roles.
      interface Target {
        depositor: string;
        root: string;
        nominator: string;
        bouncer: string;
      }
      const humanData: AnyData = data.toHuman();
      const { depositor, root, nominator, bouncer }: Target = humanData.roles;

      // Return if roles have not changed.
      const poolRoles = account.nominationPoolData!.poolRoles;

      const isSame =
        poolRoles.depositor === depositor &&
        poolRoles.root === root &&
        poolRoles.nominator === nominator &&
        poolRoles.bouncer === bouncer;

      if (!isOneShot && isSame) {
        return;
      }

      // Update account and entry data.
      if (!isSame) {
        // eslint-disable-next-line prettier/prettier
        account.nominationPoolData!.poolRoles = { depositor, root, nominator, bouncer };
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            poolRoles,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { poolRoles }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nomination_pool_commission
   * @summary Callback for 'subscribe:account:nominationPools:commission'
   *
   * When a nomination pool's commission data changes, dispatch an event and notificaiton.
   */
  static async callback_nomination_pool_commission(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool commission.
      const humanData: AnyData = data.toHuman();
      const { changeRate, current, max, throttleFrom } = humanData.commission;

      // Return if roles have not changed.
      const poolCommission = account.nominationPoolData!.poolCommission;

      const isSame =
        // eslint-disable-next-line prettier/prettier
        JSON.stringify(poolCommission.changeRate) === JSON.stringify(changeRate) &&
        JSON.stringify(poolCommission.current) === JSON.stringify(current) &&
        poolCommission.throttleFrom === (throttleFrom as string | null) &&
        poolCommission.max === (max as string | null);

      if (!isOneShot && isSame) {
        return;
      }

      // Update account and entry data.
      if (!isSame) {
        // eslint-disable-next-line prettier/prettier
        account.nominationPoolData!.poolCommission = { changeRate, current, max, throttleFrom };
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            poolCommission,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { poolCommission }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /*
   * @name callback_nominating_pending_payouts
   * @summary Callback for 'subscribe:account:nominating:pendingPayouts'
   *
   * When an account's nominations receive rewards in previous era, dispatch an event and notificaiton.
   */
  static async callback_nominating_pending_payouts(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // Check if account has any nominating rewards from the previous era (current era - 1).
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const origin = 'callback_nomination_pending_payouts';
      const { api } = await ApiUtils.getApiInstanceOrThrow(
        account.chain,
        origin
      );

      // Map<era: string, Map<validator: string, payout: [number, string]>>
      const unclaimed = await getUnclaimedPayouts(
        account.address,
        api,
        account.chain,
        true
      );

      let pendingPayout = new BigNumber(0);

      for (const validatorToPayout of unclaimed.values()) {
        for (const payoutItem of validatorToPayout.values()) {
          const payout = payoutItem[1];
          pendingPayout = pendingPayout.plus(new BigNumber(payout as string));
        }
      }

      // Return if no pending payout.
      if (!isOneShot && pendingPayout.isZero()) {
        return;
      }

      // Handle notification and events in main process.
      const era = data.toHuman().index as string;

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            pendingPayout: new BigNumber(pendingPayout),
            chainId: account.chain,
          })
        : null;

      window.myAPI.persistEvent(
        EventsController.getEvent(entry, {
          pendingPayout: new BigNumber(pendingPayout),
          era,
        }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nominating_exposure
   * @summary Callback for 'subscribe:account:nominating:exposure'
   *
   * Dispatch an event and notificaiton informing whether a nominator is
   * exposed in the current era. A nominator is exposed if at least one
   * of their nominated validators is in the era's validator set.
   *
   * The nominating account needs to be in the top 512 nominators (have
   * enough stake) to earn rewards from a particular validator.
   *
   * @deprecated staking.erasStakers replaced with staking.erasStakersPaged
   */
  static async callback_nominating_exposure_deprecated(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if this era exposure is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return;
      }

      // Otherwise get exposure.
      const origin = 'callback_nominating_exposure';
      const { api } = await ApiUtils.getApiInstanceOrThrow(
        account.chain,
        origin
      );
      const exposed = await getAccountExposed_deprecated(api, era, account);

      // Update account data.
      if (account.nominatingData!.lastCheckedEra < era) {
        account.nominatingData!.exposed = exposed;
        account.nominatingData!.lastCheckedEra = era;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            era,
            exposed,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { era, exposed }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nominating_exposure
   * @summary Callback for 'subscribe:account:nominating:exposure'
   */
  static async callback_nominating_exposure(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if this era exposure is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return;
      }

      const origin = 'callback_nominating_exposure_westend';
      const { api } = await ApiUtils.getApiInstanceOrThrow(
        account.chain,
        origin
      );

      // Cache previous exposure.
      const { exposed: prevExposed } = account.nominatingData!;

      // Update account nominating data.
      const maybeNominatingData = await getAccountNominatingData(api, account);
      maybeNominatingData
        ? (account.nominatingData = { ...maybeNominatingData })
        : (account.nominatingData = null);

      await AccountsController.set(account.chain, account);
      entry.task.account = account.flatten();

      // Return if exposure has not changed.
      const exposed = maybeNominatingData ? maybeNominatingData.exposed : false;
      if (!isOneShot && prevExposed === exposed) {
        return;
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            era,
            exposed,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { era, exposed }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name callback_nominating_commission
   * @summary Callback for 'subscribe:account:nominating:commission'
   *
   * Dispatches an event and native OS notification if the account's nominated
   * validator's commission has changed.
   */
  static async callback_nominating_commission(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if nominator data for this era is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return;
      }

      // Get live nominator data and check to see if it has changed.
      const origin = 'callback_nominating_commission';
      const { api } = await ApiUtils.getApiInstanceOrThrow(
        account.chain,
        origin
      );

      const nominatorData: AnyData = (
        await api.query.staking.nominators(account.address)
      ).toHuman();

      // Return if account is no longer nominating.
      if (nominatorData === null) {
        account.nominatingData = null;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Return if retrieved `submittedIn` matches account data.
      const submittedIn: number = parseInt(
        (nominatorData.submittedIn as string).replace(/,/g, '')
      );

      const isSame = account.nominatingData!.submittedIn === submittedIn;
      if (!isOneShot && isSame) {
        return;
      }

      // Something may have changed, firstly get new validator info.
      const accumulated: ValidatorData[] = [];

      for (const validatorId of nominatorData.targets as string[]) {
        const prefs: AnyData = (
          await api.query.staking.erasValidatorPrefs(era, validatorId)
        ).toHuman();

        const commission: string = prefs.commission as string;
        accumulated.push({ validatorId, commission });
      }

      // Get an array of changed validators.
      const changedValidators: ValidatorData[] = [];

      const validatorData = account.nominatingData!.validators;
      const oldIds = validatorData.map((v) => v.validatorId);
      const newIds = accumulated.map((v) => v.validatorId);

      const idsInOld = newIds.filter((vid) => oldIds.includes(vid));
      const idsNew = newIds.filter((vid) => !oldIds.includes(vid));

      // Add old validators with commission changes.
      for (const vid of idsInOld) {
        const oldData = validatorData.find((v) => v.validatorId === vid);
        const newData = accumulated.find((v) => v.validatorId === vid);

        if (!oldData || !newData) {
          continue;
        } else if (oldData.commission !== newData.commission) {
          changedValidators.push(newData);
        }
      }

      // Add new validator commissions.
      for (const vid of idsNew) {
        const vData = accumulated.find((v) => v.validatorId === vid);
        if (vData) {
          changedValidators.push(vData);
        }
      }

      // Exit early if there are no commission changes.
      if (!isOneShot && changedValidators.length === 0) {
        return;
      }

      // Update account nominating data with new commissions.
      if (changedValidators.length > 0) {
        account.nominatingData!.validators = [...accumulated];
        account.nominatingData!.submittedIn = submittedIn;
        AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            updated: [...changedValidators],
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { updated: [...changedValidators] }),
        notification,
        isOneShot
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * @name showNotificationFlag
   * @summary Determine if the task should show a native OS notification.
   */
  private static getNotificationFlag = (
    entry: ApiCallEntry,
    isOneShot: boolean
  ) =>
    isOneShot
      ? true
      : !RendererConfig.silenceNotifications &&
        entry.task.enableOsNotifications;
}
