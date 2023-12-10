// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  WrappedSubscriptionTask,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';

export const Permissions = ({ setSection, breadcrumb }: AnyJson) => {
  const { updateTask, updateRenderedSubscriptions, renderedSubscriptions } =
    useSubscriptions();

  /* 
   Handle a toggle, which sends a subscription task to the back-end
   and updates the front-end subscriptions state. 
   */

  const handleToggle = async (cached: WrappedSubscriptionTask) => {
    // Invert the task status.
    const newStatus = cached.task.status === 'enable' ? 'disable' : 'enable';

    // Reference to actionArgs.
    const args = cached.task.actionArgs;

    // Copy task and set new status.
    const newTask: SubscriptionTask = {
      ...cached.task,
      actionArgs: args ? [...args] : undefined,
      status: newStatus,
    };

    // Copy the wrapped subscription and set the new task.
    const newCached: WrappedSubscriptionTask = {
      ...cached,
      address: cached.address ? cached.address : undefined,
      task: {
        ...newTask,
        actionArgs: args ? [...args] : undefined,
        status: newStatus,
      },
    };

    // Send task and its associated data to backend.
    const result = await window.myAPI.invokeSubscriptionTask(newCached);

    if (result) {
      // Update subscriptions context state.
      cached.address
        ? updateTask(cached.type, newTask, cached.address)
        : updateTask(cached.type, newTask);

      // Update rendererd subscription tasks state.
      updateRenderedSubscriptions(newTask);
    }
  };

  const getKey = (
    type: string,
    action: string,
    chainId: string,
    address: string | undefined
  ) => {
    return address
      ? `${type}_${chainId}_${address}_${action}`
      : `${type}_${chainId}_${action}`;
  };

  // Renders a list of subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => {
    const { type, tasks, address } = renderedSubscriptions;

    return (
      <>
        {tasks.map((task: SubscriptionTask, i: number) => (
          <AccountWrapper
            whileHover={{ scale: 1.01 }}
            key={`${i}_${getKey(type, task.action, task.chainId, address)}`}
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
                  handleToggle={() => {
                    // Send an account or chain subscription task.
                    type === 'account'
                      ? handleToggle({ type, address, task })
                      : handleToggle({ type, task });
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
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                position: 'relative',
                left: '-0.5rem',
              }}
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
