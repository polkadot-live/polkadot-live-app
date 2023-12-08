// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@/types/misc';
import { useState } from 'react';
import { NoAccounts } from '../NoAccounts';
import { CarouselWrapper } from '../Wrappers';
import { Accounts } from './Accounts';
import { Permissions } from './Permissions';
import { Wrapper } from './Wrappers';
import type { CachedSubscriptions } from '@/types/subscriptions';

export const Manage = ({ addresses }: AnyJson) => {
  // Store the currently active maange tab.
  const [section, setSection] = useState<number>(0);

  // Outermost breadcrumb title.
  const [breadcrumb, setBreadcrumb] = useState<string>('');

  // State to store the selected chain of account's subscriptions.
  const [subscriptionTasks, setSubscriptionTasks] =
    useState<CachedSubscriptions>({ type: '', tasks: [] });

  return (
    <>
      <CarouselWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.35,
          type: 'spring',
          bounce: 0.1,
        }}
        variants={{
          home: {
            left: 0,
          },
          next: {
            left: '-100%',
          },
        }}
      >
        <div>
          {addresses.length ? (
            <Wrapper className="scrollable">
              <Accounts
                setSection={setSection}
                setBreadcrumb={setBreadcrumb}
                setSubscriptionTasks={setSubscriptionTasks}
                addresses={addresses}
              />
            </Wrapper>
          ) : (
            <NoAccounts />
          )}
        </div>
        <div>
          <Permissions
            setSection={setSection}
            breadcrumb={breadcrumb}
            subscriptionTasks={subscriptionTasks}
          />
        </div>
      </CarouselWrapper>
    </>
  );
};
