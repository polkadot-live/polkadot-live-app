// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { useManage } from '@ren/contexts/main';
import { CarouselWrapper } from '../Wrappers';
import { Accounts } from './Accounts';
import { FlexColumn } from '@polkadot-live/ui/styles';
import { Permissions } from './Permissions';
import { Wrapper } from './Wrappers';
import { MainHeading } from '@polkadot-live/ui/components';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ManageProps } from './types';
import type { SubscriptionTaskType } from '@polkadot-live/types/subscriptions';

export const Manage = ({ addresses }: ManageProps) => {
  const { setRenderedSubscriptions } = useManage();

  // Store the currently active manage tab.
  const [section, setSection] = useState<number>(0);

  // Outermost breadcrumb title.
  const [breadcrumb, setBreadcrumb] = useState<string>('');
  const [tasksChainId, setTasksChainId] = useState<ChainID | null>(null);

  // Whether the user has clicked on an account or chain.
  const [typeClicked, setTypeClicked] = useState<SubscriptionTaskType>('');

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
    <FlexColumn
      $rowGap={'1rem'}
      style={{ height: '100%', padding: '2rem 0rem 1rem' }}
    >
      <MainHeading style={{ padding: '0 1rem' }}>
        Account Subscriptions
      </MainHeading>

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
          }
        }}
        variants={{
          home: { left: 0 },
          next: { left: '-100%' },
        }}
      >
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem' }}
        >
          {/* List of accounts and chains */}
          <Wrapper>
            <Accounts
              addresses={addresses}
              setTasksChainId={setTasksChainId}
              setSection={setSection}
              setBreadcrumb={setBreadcrumb}
              setTypeClicked={setTypeClicked}
              setSelectedAccount={setSelectedAccount}
            />
          </Wrapper>
        </div>
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem 1rem' }}
        >
          {/* Subscription toggles for selected account or chain */}
          <Permissions
            setSection={setSection}
            section={section}
            selectedAccount={selectedAccount}
            breadcrumb={breadcrumb}
            tasksChainId={tasksChainId}
            typeClicked={typeClicked}
          />
        </div>
      </CarouselWrapper>
    </FlexColumn>
  );
};
