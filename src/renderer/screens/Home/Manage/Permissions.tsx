// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type {
  SubscriptionTask,
  CachedSubscriptions,
  CachedSubscription,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';

export const Permissions = ({
  setSection,
  subscriptionTasks,
  breadcrumb,
}: AnyJson) => {
  // Handle a toggle, which sends a subscription task to the back-end.
  const handleToggle = async (cached: CachedSubscription) => {
    console.log('type:', cached.type);

    // Invert the task status.
    cached.task.status = cached.task.status === 'enable' ? 'disable' : 'enable';

    // Send task and its associated data to backend.
    const result = await window.myAPI.invokeSubscriptionTask(cached);

    console.log('RESULT:');
    console.log(result);
  };

  // Renders a list of subscription tasks that can be toggled.
  const renderSubscriptionTasks = (cached: CachedSubscriptions) => {
    return (
      <>
        {cached.tasks.map((subscription: SubscriptionTask, i: number) => (
          <AccountWrapper
            whileHover={{ scale: 1.01 }}
            key={`manage_permission_${i}`}
          >
            <div className="inner">
              <div>
                <span className="icon">
                  <FontAwesomeIcon icon={faUserGroup} />
                </span>
                <div className="content">
                  <h3>{subscription.label}</h3>
                </div>
              </div>
              <div>
                <Switch
                  type="secondary"
                  isOn={subscription.status === 'enable'}
                  handleToggle={() => {
                    const isAccountTask = cached.type === 'account';

                    // Send an account or chain subscription task.
                    if (isAccountTask) {
                      handleToggle({
                        type: 'account',
                        address: cached.address,
                        task: subscription,
                      });
                    } else {
                      handleToggle({ type: 'chain', task: subscription });
                    }
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
            renderSubscriptionTasks(subscriptionTasks)
          ) : (
            <p>No subscriptions for this item</p>
          )}
        </div>
      </AccountsWrapper>
    </>
  );
};
