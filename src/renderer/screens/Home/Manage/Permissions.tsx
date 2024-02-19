// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import { useEffect } from 'react';
import { useManage } from './provider';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';

export const Permissions = ({ setSection, section, breadcrumb }: AnyJson) => {
  const { updateTask } = useSubscriptions();
  const { updateRenderedSubscriptions, renderedSubscriptions } = useManage();

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
    const result = await window.myAPI.invokeSubscriptionTask(newWrapped);

    if (result) {
      // Update subscriptions context state.
      cached.tasks[0].account?.address
        ? updateTask(cached.type, newTask, cached.tasks[0].account.address)
        : updateTask(cached.type, newTask);

      // Update rendererd subscription tasks state.
      updateRenderedSubscriptions(newTask);
    }
  };

  /// Determine whether the toggle should be disabled based on the
  /// task and account data.
  const getDisabled = (task: SubscriptionTask) => {
    switch (task.action) {
      case 'subscribe:nominationPools:query.system.account': {
        return task.account?.nominationPoolData ? false : true;
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

  /// Renders a list of subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => {
    const { type, tasks } = renderedSubscriptions;

    return (
      <>
        {tasks.map((task: SubscriptionTask, i: number) => (
          <AccountWrapper
            whileHover={{ scale: 1.01 }}
            key={`${i}_${getKey(type, task.action, task.chainId, task.account?.address)}`}
          >
            <div className="inner">
              <div>
                <span className="icon">
                  <FontAwesomeIcon icon={faUserGroup} />
                </span>
                <div className="content">
                  <h3>{task.label}</h3>
                </div>
              </div>
              <div>
                <Switch
                  type="secondary"
                  isOn={task.status === 'enable'}
                  disabled={getDisabled(task)}
                  handleToggle={() => {
                    // Send an account or chain subscription task.
                    handleToggle({
                      type,
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
      </>
    );
  };

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
