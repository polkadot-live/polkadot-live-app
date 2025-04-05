// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@ren/controller/AccountsController';
import { APIsController } from '@ren/controller/APIsController';
import BigNumber from 'bignumber.js';
import { checkAccountWithProperties } from '@ren/utils/AccountUtils';
import { Config as RendererConfig } from '@ren/config/processes/renderer';
import { EventsController } from '@ren/controller/EventsController';
import {
  areArraysEqual,
  getAccountExposed_deprecated,
  getAccountNominatingData,
  getEraRewards,
} from './nominating';
import { NotificationsController } from '@ren/controller/NotificationsController';
import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { rmCommas } from '@w3ux/utils';
import type { ApiCallEntry } from '@polkadot-live/types/subscriptions';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { QueryMultiWrapper } from '@ren/model/QueryMultiWrapper';
import type { NominationPoolRoles } from '@polkadot-live/types/accounts';

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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event, notification: null, isOneShot: false },
      });
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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event, notification: null, isOneShot: false },
      });
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
  ): Promise<boolean> {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return false;
      }

      // Get the received balance.
      const free = BigInt(rmCommas(String(data.data.free)));
      const b = account.balance;
      const isSame = b.free ? free === b.free : false;

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return true;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.free = free;
        account.balance.nonce = BigInt(rmCommas(String(data.nonce)));
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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event: parsed, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return false;
      }

      // Get the received frozen balance.
      const frozen = BigInt(rmCommas(String(data.data.frozen)));
      const b = account.balance;
      const isSame = b.frozen ? frozen === b.frozen : false;

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return true;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.frozen = frozen;
        account.balance.nonce = BigInt(rmCommas(String(data.nonce)));
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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event: parsed, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return false;
      }

      // Get the received reserved balance.
      const reserved = BigInt(rmCommas(String(data.data.reserved)));
      const b = account.balance;
      const isSame = b.reserved ? reserved === b.reserved : false;

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return true;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance.reserved = reserved;
        account.balance.nonce = BigInt(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create an event and parse into same format as persisted event.
      const event = EventsController.getEvent(entry, { reserved });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { reserved })
        : null;

      // Send event and notification data to main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event: parsed, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // Get account.
      const account = AccountsController.get(
        entry.task.chainId,
        entry.task.account!.address
      );

      if (!account || !account.balance) {
        return false;
      }

      // Get API instance.
      const { api } = await this.getApiOrThrow(account.chain);

      /**
       * Spendable balance equation:
       * spendable = free - max(max(frozen, reserved), ed)
       */
      const free = BigInt(rmCommas(String(data.data.free)));
      const frozen = BigInt(rmCommas(String(data.data.frozen)));
      const reserved = BigInt(rmCommas(String(data.data.reserved)));
      const ed = BigInt(
        rmCommas(String(api.consts.balances.existentialDeposit))
      );

      const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);
      let spendable = free - max(max(frozen, reserved), ed);
      if (spendable < 0n) {
        spendable = 0n;
      }

      // Check if spendable balance has changed.
      const b = account.balance;
      const cur = max(b.free - max(max(b.frozen, b.reserved), ed), 0n);
      const isSame = spendable === cur;

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return true;
      }

      // Update account nonce if balance has changed.
      if (!isSame) {
        account.balance.nonce = BigInt(rmCommas(String(data.nonce)));
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create an event and parse into same format as persisted event.
      const event = EventsController.getEvent(entry, { spendable });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { spendable })
        : null;

      // Send event and notification to main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event: parsed, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);
      const { api } = await this.getApiOrThrow(account.chain);

      // Fetch pending rewards for the account.
      const pending: bigint = await api.call.nominationPoolsApi.pendingRewards(
        account.address
      );

      const cur = account.nominationPoolData!.poolPendingRewards;
      const isSame = cur === pending;

      // Return if pending rewards is zero or no change.
      if ((!isOneShot && isSame) || (!isOneShot && pending === 0n)) {
        return true;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolPendingRewards = pending;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get event and notification.
      const event = EventsController.getEvent(entry, { pending });
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { pending })
        : null;

      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool state.
      const state: string = data.toHuman().state;
      const cur = account.nominationPoolData!.poolState;
      const isSame = cur === state;

      if (!isOneShot && isSame) {
        return true;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolState = state;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { prev: cur })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { prev: cur }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool name.
      const poolName: string = u8aToString(u8aUnwrapBytes(data));
      const cur = account.nominationPoolData!.poolName;
      const isSame = cur === poolName || poolName === '';

      if (!isOneShot && isSame) {
        return true;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolName = poolName;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { prev: cur })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { prev: cur }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool roles.
      const humanData: AnyData = data.toHuman();
      const roles: NominationPoolRoles = humanData.roles;

      // Return if roles have not changed.
      const cur = account.nominationPoolData!.poolRoles;

      const isSame =
        cur.depositor === roles.depositor &&
        cur.root === roles.root &&
        cur.nominator === roles.nominator &&
        cur.bouncer === roles.bouncer;

      if (!isOneShot && isSame) {
        return true;
      }

      // Update account and entry data.
      if (!isSame) {
        // eslint-disable-next-line prettier/prettier
        account.nominationPoolData!.poolRoles = { ...roles };
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, { prev: cur })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { roles }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      const account = checkAccountWithProperties(entry, ['nominationPoolData']);

      // Get the received pool commission.
      const humanData: AnyData = data.toHuman();
      const { changeRate, current, max, throttleFrom } = humanData.commission;

      // Return if roles have not changed.
      const poolCommission = account.nominationPoolData!.poolCommission;

      const isSame =
        // eslint-disable-next-line prettier/prettier
        JSON.stringify(poolCommission.changeRate) ===
          JSON.stringify(changeRate) &&
        JSON.stringify(poolCommission.current) === JSON.stringify(current) &&
        poolCommission.throttleFrom === (throttleFrom as string | null) &&
        poolCommission.max === (max as string | null);

      if (!isOneShot && isSame) {
        return true;
      }

      // Update account and entry data.
      if (!isSame) {
        account.nominationPoolData!.poolCommission = {
          changeRate,
          current,
          max,
          throttleFrom,
        };
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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { poolCommission }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /*
   * @name callback_nominating_era_rewards
   * @summary Callback for 'subscribe:account:nominating:pendingPayouts'
   */
  static async callback_nominating_era_rewards(
    entry: ApiCallEntry,
    isOneShot = false
  ): Promise<boolean> {
    try {
      // Check if account has nominating rewards from the previous era.
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const { api } = await this.getApiOrThrow(account.chain);

      // Fetch previous era.
      const eraResult: AnyData = (
        await api.query.staking.activeEra()
      ).toHuman();

      const era =
        BigInt(parseInt((eraResult.index as string).replace(/,/g, ''))) - 1n;

      // Calculate rewards.
      const eraRewards = await getEraRewards(account.address, api, Number(era));

      // Get notification and event.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            rewards: eraRewards.toString(),
            chainId: account.chain,
          })
        : null;

      const event = EventsController.getEvent(entry, {
        rewards: eraRewards.toString(),
        era: era.toString(),
      });

      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: { event, notification, isOneShot },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt(
        (data.toHuman().index as string).replace(/,/g, '')
      );
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if this era exposure is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return true;
      }

      // Otherwise get exposure.
      const { api } = await this.getApiOrThrow(account.chain);
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
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { era, exposed }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt(
        (data.toHuman().index as string).replace(/,/g, '')
      );
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if this era exposure is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return true;
      }

      // Cache previous exposure.
      const { api } = await this.getApiOrThrow(account.chain);
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
        return true;
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            era,
            exposed,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { era, exposed }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
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
  ): Promise<boolean> {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt(
        (data.toHuman().index as string).replace(/,/g, '')
      );
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if nominator data for this era is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return true;
      }

      // Get live nominator data and check to see if it has changed.
      const { api } = await this.getApiOrThrow(account.chain);

      // Cache previous commissions.
      const prev = account.nominatingData!.validators.map((v) => v.commission);
      let hasChanged = false;

      // Update account nominating data.
      const maybeNominatingData = await getAccountNominatingData(api, account);
      maybeNominatingData
        ? (account.nominatingData = { ...maybeNominatingData })
        : (account.nominatingData = null);

      await AccountsController.set(account.chain, account);
      entry.task.account = account.flatten();

      // Return if commissions haven't changed.
      if (maybeNominatingData) {
        const cur = maybeNominatingData.validators.map((v) => v.commission);
        const areEqual = areArraysEqual(prev, cur);

        if (!areEqual) {
          hasChanged = true;
        } else if (!isOneShot && areEqual) {
          return true;
        }
      } else {
        // Commission changes if account no longer nominating.
        hasChanged = true;
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            hasChanged,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { era, hasChanged }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * @name callback_nominating_nominations
   * @summary Callback for 'subscribe:account:nominating:nominations'
   *
   * Dispatches an event and native OS notification if the account's nominated
   * validator set has changed.
   */
  static async callback_nominating_nominations(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ): Promise<boolean> {
    try {
      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt(
        (data.toHuman().index as string).replace(/,/g, '')
      );
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const alreadyKnown = account.nominatingData!.lastCheckedEra >= era;

      // Exit early if nominator data for this era is already known for this account.
      if (!isOneShot && alreadyKnown) {
        return true;
      }

      // Get live nominator data and check to see if it has changed.
      const { api } = await this.getApiOrThrow(account.chain);

      // Cache previous nominations.
      const prev = account.nominatingData!.validators.map((v) => v.validatorId);
      let hasChanged = false;

      // Update account nominating data.
      const maybeNominatingData = await getAccountNominatingData(api, account);
      maybeNominatingData
        ? (account.nominatingData = { ...maybeNominatingData })
        : (account.nominatingData = null);

      await AccountsController.set(account.chain, account);
      entry.task.account = account.flatten();

      // Return if nominations haven't changed.
      if (maybeNominatingData) {
        const cur = maybeNominatingData.validators.map((v) => v.validatorId);
        const areEqual = areArraysEqual(prev, cur);

        if (!areEqual) {
          hasChanged = true;
        } else if (!isOneShot && areEqual) {
          return true;
        }
      } else {
        // Nominations have changed if account no longer nominating.
        hasChanged = true;
      }

      // Get notification.
      const notification = this.getNotificationFlag(entry, isOneShot)
        ? NotificationsController.getNotification(entry, account, {
            hasChanged,
          })
        : null;

      // Handle notification and events in main process.
      window.myAPI.sendEventTask({
        action: 'events:persist',
        data: {
          event: EventsController.getEvent(entry, { era, hasChanged }),
          notification,
          isOneShot,
        },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * @name getApiOrThrow
   * @summary Get an API instance of throw.
   */
  private static getApiOrThrow = async (chainId: ChainID) =>
    await APIsController.getConnectedApiOrThrow(chainId);

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
