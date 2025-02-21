// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { useManage } from '@app/contexts/main/Manage';
import { CarouselWrapper } from '../Wrappers';
import { Accounts } from './Accounts';
import { Permissions } from './Permissions';
import { Wrapper } from './Wrappers';
import { MainHeading } from '@polkadot-live/ui/components';
import type { ManageProps } from './types';
import type { SubscriptionTaskType } from '@polkadot-live/types/subscriptions';

export const Manage = ({ addresses }: ManageProps) => {
  const { setRenderedSubscriptions, setDynamicIntervalTasks } = useManage();

  // Store the currently active manage tab.
  const [section, setSection] = useState<number>(0);

  // Outermost breadcrumb title.
  const [breadcrumb, setBreadcrumb] = useState<string>('');

  // Whether the user has clicked on an account or chain.
  const [typeClicked, setTypeClicked] = useState<SubscriptionTaskType>('');

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.75rem',
        padding: '2rem 0 1rem',
      }}
    >
      <MainHeading style={{ padding: '0 1rem 0' }}>Subscriptions</MainHeading>
      <CarouselWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.35,
          type: 'spring',
          bounce: 0.1,
        }}
        // Clear rendered subscriptions after transitioning to left section.
        // Doing this will remove the scrollbar on the right section.
        onTransitionEnd={() => {
          if (section === 0) {
            setRenderedSubscriptions({ type: '', tasks: [] });
            setDynamicIntervalTasks([], 'Polkadot');
          }
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
        <div className="scrollable" style={{ padding: '0 1rem' }}>
          {/* List of accounts and chains */}
          <Wrapper>
            <Accounts
              setSection={setSection}
              setBreadcrumb={setBreadcrumb}
              addresses={addresses}
              setTypeClicked={setTypeClicked}
              setSelectedAccount={setSelectedAccount}
            />
          </Wrapper>
        </div>
        <div className="scrollable" style={{ padding: '0 1rem' }}>
          {/* Subscription toggles for selected account or chain */}
          <Permissions
            setSection={setSection}
            section={section}
            selectedAccount={selectedAccount}
            breadcrumb={breadcrumb}
            typeClicked={typeClicked}
          />
        </div>
      </CarouselWrapper>
    </div>
  );
};
