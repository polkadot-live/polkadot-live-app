// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type { SubscriptionTask } from '@/types/subscriptions';
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
  // Renders a list of subscription tasks that can be toggled.
  const renderSubscriptionTasks = (tasks: SubscriptionTask[]) => {
    return (
      <>
        {tasks.map((subscription: SubscriptionTask, i: number) => (
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
                {/* TEMP: Disable Westend toggle switches */}
                {subscription.chainId !== 'Westend' && (
                  <Switch
                    type="secondary"
                    isOn={subscription.status === 'enable'}
                    handleToggle={() => console.log(subscription)}
                  />
                )}
                {subscription.chainId === 'Westend' && (
                  <Switch
                    type="secondary"
                    isOn={subscription.status === 'enable'}
                    handleToggle={() => console.log(subscription)}
                    disabled
                  />
                )}
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
          {renderSubscriptionTasks(subscriptionTasks)}
        </div>
      </AccountsWrapper>
    </>
  );
};
