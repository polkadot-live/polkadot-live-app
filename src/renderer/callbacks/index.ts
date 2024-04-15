// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import BigNumber from 'bignumber.js';
import { checkAccountWithProperties } from '@/utils/AccountUtils';
import { EventsController } from '@/controller/renderer/EventsController';
import { NotificationsController } from '@/controller/renderer/NotificationsController';
import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import * as ApiUtils from '@/utils/ApiUtils';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { AnyData } from '@/types/misc';
import type { EventCallback } from '@/types/reporter';
import type { QueryMultiWrapper } from '@/model/QueryMultiWrapper';
import type { AccountBalance, ValidatorData } from '@/types/accounts';
import { getUnclaimedPayouts } from './nominating';

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
   * @name callback_query_system_account
   * @summary Callback for 'subscribe:account:balance'.
   *
   * Get the balance of the task target account on the target chain. Returns
   * the balance's nonce, free and reserved values.
   */
  static async callback_query_system_account(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['balance']);

      // Get the received balance.
      const received: AccountBalance = {
        free: new BigNumber(data.data.free),
        reserved: new BigNumber(data.data.reserved),
        frozen: new BigNumber(data.data.frozen),
        nonce: new BigNumber(data.nonce),
      };

      let isSame = false;
      if (account.balance) {
        isSame =
          received.free.eq(account.balance.free) &&
          received.reserved.eq(account.balance.reserved) &&
          received.frozen.eq(account.balance.frozen) &&
          received.nonce.eq(account.balance.nonce);
      }

      // Exit early if nothing has changed.
      if (!isOneShot && isSame) {
        return;
      }

      // Update account data if balance has changed.
      if (!isSame) {
        account.balance = received;
        await AccountsController.set(account.chain, account);
        entry.task.account = account.flatten();
      }

      // Create event and parse into same format as persisted events.
      const event = EventsController.getEvent(entry, { received });
      const parsed: EventCallback = JSON.parse(JSON.stringify(event));

      // Get notification.
      const notification =
        entry.task.enableOsNotifications || isOneShot
          ? NotificationsController.getNotification(entry, account, {
              received,
            })
          : null;

      // Send event and notification data to main process.
      window.myAPI.persistEvent(parsed, notification, isOneShot);
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
      const { api } = await ApiUtils.getApiInstance(chainId);

      // Fetch pending rewards for the account.
      const pendingRewardsPlanck: BigNumber =
        await api.call.nominationPoolsApi.pendingRewards(account.address);

      // Return if pending rewards is zero.
      if (!isOneShot && pendingRewardsPlanck.eq(0)) {
        return;
      }

      // Update account and entry data.
      account.nominationPoolData!.poolPendingRewards = pendingRewardsPlanck;
      await AccountsController.set(chainId, account);
      entry.task.account = account.flatten();

      // Get notification.
      const notification =
        entry.task.enableOsNotifications || isOneShot
          ? NotificationsController.getNotification(entry, account, {
              pendingRewardsPlanck,
            })
          : null;

      // Handle notification and events in main process.
      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { pendingRewardsPlanck }),
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
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
      const isSame = prevName === receivedPoolName;

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
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
      const { depositor, root, nominator, bouncer } = data.toHuman().roles;

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
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
      const { changeRate, current, max, throttleFrom } =
        data.toHuman().commission;

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
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
      const { api } = await ApiUtils.getApiInstance(account.chain);

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
      const notification =
        entry.task.enableOsNotifications || isOneShot
          ? NotificationsController.getNotification(entry, account, {
              pendingPayout,
              chainId: account.chain,
            })
          : null;

      window.myAPI.persistEvent(
        EventsController.getEvent(entry, { pendingPayout, era }),
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
   */
  static async callback_nominating_exposure(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const { api } = await ApiUtils.getApiInstance(account.chain);

      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));
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

      // Get notification.
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
   * @name callback_nominating_exposure_westend
   * @summary Callback for 'subscribe:account:nominating:exposure' on 'Westend'
   */
  static async callback_nominating_exposure_westend(
    data: AnyData,
    entry: ApiCallEntry,
    isOneShot = false
  ) {
    try {
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const { api } = await ApiUtils.getApiInstance(account.chain);

      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));
      const validators = account.nominatingData!.validators.map(
        (v) => v.validatorId
      );

      let exposed = false;

      // Iterate validators account is nominating.
      validatorLoop: for (const vId of validators) {
        // Check if target address is the validator.
        if (account.address === vId) {
          exposed = true;
          break;
        }

        // Iterate validator paged exposures.
        const result: AnyData =
          await api.query.staking.erasStakersPaged.entries(era, vId);

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

      // Get notification.
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
      // Check if account has any nominating rewards from the previous era (current era - 1).
      const account = checkAccountWithProperties(entry, ['nominatingData']);
      const { api } = await ApiUtils.getApiInstance(account.chain);

      // eslint-disable-next-line prettier/prettier
      const era: number = parseInt((data.toHuman().index as string).replace(/,/g, ''));

      // Get an array of changed validators.
      const validatorData = account.nominatingData!.validators;
      const changedValidators: ValidatorData[] = [];

      for (const { validatorId, commission } of validatorData) {
        const prefs: AnyData = (
          await api.query.staking.erasValidatorPrefs(era, validatorId)
        ).toHuman();

        const nextCommission: string = prefs.commission as string;
        if (commission !== nextCommission) {
          changedValidators.push({ validatorId, commission: nextCommission });
        }
      }

      // Exit early if there are no commission changes.
      if (changedValidators.length > 0 && !isOneShot) {
        return;
      }

      // Update account nominating data with new commissions.
      const updated = account.nominatingData!.validators.map((v) => {
        const changed = changedValidators.find(
          (x) => x.validatorId === v.validatorId
        );

        return changed !== undefined
          ? ({ ...v, commission: changed.commission } as ValidatorData)
          : v;
      });

      // Persist updated data.
      account.nominatingData = { validators: [...updated] };
      await AccountsController.set(account.chain, account);

      // Get notification.
      const notification =
        entry.task.enableOsNotifications || isOneShot
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
}
