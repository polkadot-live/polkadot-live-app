// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  SubscriptionTaskType,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
  HeadingWrapper,
} from './Wrappers';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import { useEffect } from 'react';
import { useOnlineStatus } from '@/renderer/contexts/OnlineStatus';
import { useManage } from './provider';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { Switch } from '@app/library/Switch';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { AccountsController } from '@/controller/renderer/AccountsController';
import * as ApiUtils from '@/utils/ApiUtils';
import { useChains } from '@/renderer/contexts/Chains';
import { APIsController } from '@/controller/renderer/APIsController';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { executeOneShot } from '@/renderer/callbacks/oneshots';

export const Permissions = ({ setSection, section, breadcrumb }: AnyJson) => {
  const { updateTask } = useSubscriptions();
  const { updateRenderedSubscriptions, renderedSubscriptions } = useManage();
  const { online: isOnline } = useOnlineStatus();
  const { addChain } = useChains();

  useEffect(() => {
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    }
  }, [renderedSubscriptions]);

  /// Handle a toggle, which sends a subscription task to the back-end
  /// and updates the front-end subscriptions state.
  const handleToggle = async (cached: WrappedSubscriptionTasks) => {
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
        // Subscribe to task.
        await SubscriptionsController.subscribeChainTask(newWrapped.tasks[0]);

        // Update chain tasks in store.
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
          console.log('no account found');
          result = false;
          break;
        }

        // Subscribe to the task.
        await SubscriptionsController.subscribeAccountTask(
          newWrapped.tasks[0],
          account
        );

        // Update account tasks in store.
        await window.myAPI.updatePersistedAccountTask(
          JSON.stringify(newWrapped.tasks[0]),
          JSON.stringify(account.flatten())
        );

        break;
      }
      default: {
        console.log('Something went wrong...');
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
  const handleOneShot = async (task: SubscriptionTask) => {
    await executeOneShot(task);
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
              <AccountWrapper
                whileHover={{ scale: 1.01 }}
                key={`${i}_${getKey(category, task.action, task.chainId, task.account?.address)}`}
              >
                <div className="inner">
                  <div>
                    <div className="content">
                      <h3>{task.label}</h3>
                    </div>
                  </div>
                  <div>
                    <ButtonMono
                      text="show"
                      disabled={getDisabled(task)}
                      onClick={async () => await handleOneShot(task)}
                    />
                    <Switch
                      type="secondary"
                      size="lg"
                      isOn={task.status === 'enable'}
                      disabled={getDisabled(task)}
                      handleToggle={async () => {
                        // Send an account or chain subscription task.
                        await handleToggle({
                          type: getTaskType(task),
                          tasks: [
                            {
                              ...task,
                              actionArgs: task.actionArgs
                                ? [...task.actionArgs]
                                : undefined,
                            },
                          ],
                        });
                      }}
                    />
                  </div>
                </div>
              </AccountWrapper>
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
