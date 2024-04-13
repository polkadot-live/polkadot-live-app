// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import { faAngleLeft, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import {
  AccountsWrapper,
  BreadcrumbsWrapper,
  HeadingWrapper,
} from './Wrappers';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { executeOneShot } from '@/renderer/callbacks/oneshots';
import { PermissionRow } from './PermissionRow';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import { useChains } from '@/renderer/contexts/Chains';
import { useEffect } from 'react';
import { useOnlineStatus } from '@/renderer/contexts/OnlineStatus';
import { useManage } from './provider';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { TaskQueue } from '@/orchestrators/TaskQueue';
import * as ApiUtils from '@/utils/ApiUtils';
import type { AnyFunction } from '@w3ux/utils/types';

export const Permissions = ({ setSection, section, breadcrumb }: AnyJson) => {
  const { updateTask } = useSubscriptions();
  const { updateRenderedSubscriptions, renderedSubscriptions } = useManage();
  const { addChain } = useChains();
  const { online: isOnline } = useOnlineStatus();

  useEffect(() => {
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    }
  }, [renderedSubscriptions]);

  const handleQueuedToggle = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => {
    const p = async () => await handleToggle(cached, setNativeChecked);
    TaskQueue.add(p);
  };

  /// Handle a toggle, which sends a subscription task to the back-end
  /// and updates the front-end subscriptions state.
  const handleToggle = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => {
    // Invert the task status.
    const newStatus =
      cached.tasks[0].status === 'enable' ? 'disable' : 'enable';

    // Reference to actionArgs.
    const args = cached.tasks[0].actionArgs;

    // Copy task and set new status.
    const newTask: SubscriptionTask = {
      ...cached.tasks[0],
      actionArgs: args ? [...args] : undefined,
      status: newStatus,
      enableOsNotifications: false,
    };

    // Copy the wrapped subscription and set the new task.
    const newWrapped: WrappedSubscriptionTasks = {
      ...cached,
      tasks: [
        {
          ...newTask,
          actionArgs: args ? [...args] : undefined,
          status: newStatus,
        },
      ],
    };

    // Send task and its associated data to backend.
    let result = true;

    switch (newWrapped.type) {
      case 'chain': {
        // Subscribe to and persist task.
        await SubscriptionsController.subscribeChainTask(newWrapped.tasks[0]);
        await window.myAPI.updatePersistedChainTask(newWrapped.tasks[0]);
        break;
      }
      case 'account': {
        // Fetch account task belongs to.
        const account = AccountsController.get(
          newWrapped.tasks[0].chainId,
          newWrapped.tasks[0].account?.address
        );

        if (!account) {
          result = false;
          break;
        }

        // Subscribe to and persist the task.
        await SubscriptionsController.subscribeAccountTask(
          newWrapped.tasks[0],
          account
        );

        // Render checbox correctly.
        setNativeChecked(false);

        await window.myAPI.updatePersistedAccountTask(
          JSON.stringify(newWrapped.tasks[0]),
          JSON.stringify(account.flatten())
        );

        // Update react state.
        updateTask(
          'account',
          newWrapped.tasks[0],
          newWrapped.tasks[0].account?.address
        );

        break;
      }
      default: {
        result = false;
        return;
      }
    }

    // Disconnect from API instance if there are no tasks that require it.
    await ApiUtils.checkAndHandleApiDisconnect(newWrapped.tasks[0]);

    // Update chain state.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }

    if (result) {
      // Update subscriptions context state.
      cached.tasks[0].account?.address
        ? updateTask(cached.type, newTask, cached.tasks[0].account.address)
        : updateTask(cached.type, newTask);

      // Update rendererd subscription tasks state.
      updateRenderedSubscriptions(newTask);
    }
  };

  /// TODO: Add `toggleable` field on subscription task type.
  /// Determine whether the toggle should be disabled based on the
  /// task and account data.
  const getDisabled = (task: SubscriptionTask) => {
    if (!isOnline) {
      return true;
    }

    switch (task.action) {
      case 'subscribe:account:nominationPools:rewards':
      case 'subscribe:account:nominationPools:state':
      case 'subscribe:account:nominationPools:renamed':
      case 'subscribe:account:nominationPools:roles':
      case 'subscribe:account:nominationPools:commission': {
        return task.account?.nominationPoolData ? false : true;
      }
      case 'subscribe:account:nominating:pendingPayouts':
      case 'subscribe:account:nominating:exposure':
      case 'subscribe:account:nominating:commission': {
        return task.account?.nominatingData ? false : true;
      }
      default: {
        return false;
      }
    }
  };

  /// Get unique key for the task row component.
  const getKey = (
    type: string,
    action: string,
    chainId: string,
    address: string | undefined
  ) =>
    address
      ? `${type}_${chainId}_${address}_${action}`
      : `${type}_${chainId}_${action}`;

  /// Return subscription tasks mapped by category.
  const getCategorised = (): Map<string, SubscriptionTask[]> => {
    const { tasks } = renderedSubscriptions;

    const map = new Map<string, SubscriptionTask[]>();

    tasks.forEach((t) => {
      const category = t.category;

      if (map.has(category)) {
        const cur = map.get(category);
        if (cur !== undefined) {
          map.set(category, [...cur, { ...t }]);
        } else {
          map.set(category, [{ ...t }]);
        }
      } else {
        map.set(category, [{ ...t }]);
      }
    });

    return map;
  };

  /// Return the type of subscription based on its action string.
  const getTaskType = (task: SubscriptionTask): SubscriptionTaskType =>
    task.action.startsWith('subscribe:account') ? 'account' : 'chain';

  /// Handle a one-shot event.
  const handleOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);

    task.enableOsNotifications = nativeChecked;
    await executeOneShot(task);

    // Wait some time to avoid the spinner snapping.
    setTimeout(() => {
      setOneShotProcessing(false);
    }, 550);
  };

  /// Handle clicking the native check.
  const handleNativeCheckbox = async (
    e: React.ChangeEvent<HTMLInputElement>,
    task: SubscriptionTask,
    setNativeChecked: AnyFunction
  ) => {
    // Update checkbox state.
    const checked: boolean = e.target.checked;
    setNativeChecked(checked);

    if (task.account) {
      // Update received task.
      task.enableOsNotifications = checked;

      // Update persisted task data.
      await window.myAPI.updatePersistedAccountTask(
        JSON.stringify(task),
        JSON.stringify(task.account!)
      );

      // Update react state for tasks.
      updateTask('account', task, task.account.address);

      // Update cached task in account's query multi wrapper.
      const account = AccountsController.get(
        task.chainId,
        task.account.address
      );

      if (account) {
        account.queryMulti?.setOsNotificationsFlag(task);
      }
    }
  };

  /// Renders a list of categorised subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => (
    <>
      {Array.from(getCategorised().entries()).map(([category, tasks], j) => (
        <div key={`${category}_${j}`}>
          <HeadingWrapper>
            <h5>
              <FontAwesomeIcon icon={faToggleOn} transform="grow-3" />
              <span>{category}</span>
            </h5>
          </HeadingWrapper>

          {tasks
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((task: SubscriptionTask, i: number) => (
              <PermissionRow
                key={`${i}_${getKey(category, task.action, task.chainId, task.account?.address)}`}
                task={task}
                handleToggle={handleQueuedToggle}
                handleOneShot={handleOneShot}
                handleNativeCheckbox={handleNativeCheckbox}
                getDisabled={getDisabled}
                getTaskType={getTaskType}
              />
            ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      <BreadcrumbsWrapper>
        <ul>
          <li>
            <ButtonText
              text="Back"
              onClick={() => setSection(0)}
              iconLeft={faAngleLeft}
              iconTransform="shrink-3"
            />
          </li>
          <li>/</li>
          <li>{breadcrumb}</li>
        </ul>
      </BreadcrumbsWrapper>
      <AccountsWrapper>
        <div style={{ padding: '0 0.75rem' }}>
          {renderedSubscriptions.tasks.length > 0 ? (
            renderSubscriptionTasks()
          ) : (
            <p>No subscriptions for this item.</p>
          )}
        </div>
      </AccountsWrapper>
    </>
  );
};
