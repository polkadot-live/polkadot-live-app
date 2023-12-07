// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type {
  SubscriptionNextStatus,
  SubscriptionTask,
} from '@/types/subscriptions';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';

/*-------------------------------------------------- 
 TEMP: Default chain subscription state for front-end
 --------------------------------------------------*/

// TODO: Make dynamic by querying persisted state for
// initial subscription settings.
const initialChainSubscriptions: SubscriptionTask[] = [
  {
    chainId: 'Polkadot' as ChainID,
    action: 'subscribe:query.timestamp.now',
    status: 'disable' as SubscriptionNextStatus,
    label: 'Timestamps',
  },
  {
    chainId: 'Polkadot' as ChainID,
    action: 'subscribe:query.babe.currentSlot',
    status: 'disable' as SubscriptionNextStatus,
    label: 'Current Slot',
  },
  {
    chainId: 'Westend' as ChainID,
    action: 'subscribe:query.timestamp.now',
    status: 'disable' as SubscriptionNextStatus,
    label: 'Timestamps',
  },
  {
    chainId: 'Westend' as ChainID,
    action: 'subscribe:query.babe.currentSlot',
    status: 'disable' as SubscriptionNextStatus,
    label: 'Current Slot',
  },
];

export const Permissions = ({ setSection, breadcrumb }: AnyJson) => {
  const initialChainSubs: SubscriptionTask[] = [...initialChainSubscriptions];

  // TODO: Put data in context.
  // Currently a temporary solution to visualize app behavior.
  const getPermissionsForBreadcrumb = () => {
    switch (breadcrumb) {
      case 'Polkadot': {
        return initialChainSubs.filter(({ chainId }) => chainId === 'Polkadot');
      }
      case 'Westend': {
        return initialChainSubs.filter(({ chainId }) => chainId === 'Westend');
      }
      default: {
        // Render placeholder permission for now.
        return [
          {
            action: 'subscribe:query.system.account',
            actionArgs: ['<address>'],
            chainId: 'Polkadot',
            status: 'disable',
            label: 'Transfers',
          },
          {
            action: 'subscribe:query.system.account',
            actionArgs: ['<address>'],
            chainId: 'Polkadot',
            status: 'disable',
            label: 'Pool Rewards',
          },
        ];
      }
    }
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
          {getPermissionsForBreadcrumb().map((subscription, i) => (
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
                    />
                  )}
                  {subscription.chainId === 'Westend' && (
                    <Switch
                      type="secondary"
                      isOn={subscription.status === 'enable'}
                      disabled
                    />
                  )}
                </div>
              </div>
            </AccountWrapper>
          ))}
        </div>
      </AccountsWrapper>
    </>
  );
};
