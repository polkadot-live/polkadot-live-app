// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  CachedSubscription,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';
import { v4 as uuidv4 } from 'uuid';

export const Permissions = ({
  setSection,
  subscriptionTasks,
  breadcrumb,
}: AnyJson) => {
  // Handle a toggle, which sends a subscription task to the back-end.
  const handleToggle = async (cached: CachedSubscription) => {
    // Invert the task status.
    cached.task.status = cached.task.status === 'enable' ? 'disable' : 'enable';

    // Send task and its associated data to backend.
    const result = await window.myAPI.invokeSubscriptionTask(cached);

    console.log('RESULT:');
    console.log(result);
  };

  // Renders a list of subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => {
    const { type, tasks, address } = subscriptionTasks;

    return (
      <>
        {tasks.map((task: SubscriptionTask, i: number) => (
          <AccountWrapper whileHover={{ scale: 1.01 }} key={`${i}_${uuidv4()}`}>
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
          {subscriptionTasks.tasks.length > 0 ? (
            renderSubscriptionTasks()
          ) : (
            <p>No subscriptions for this item.</p>
          )}
        </div>
      </AccountsWrapper>
    </>
  );
};
