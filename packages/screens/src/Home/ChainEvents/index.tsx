// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useChainEvents } from '@polkadot-live/contexts';
import {
  CarouselWrapper,
  FlexColumn,
  FlexColumnWrap,
} from '@polkadot-live/styles';
import { MainHeading } from '@polkadot-live/ui';
import { useState } from 'react';
import { Networks } from './Networks';
import { Subscriptions } from './Subscriptions';

export const ChainEvents = () => {
  const { setActiveChain, activeChain, subscriptions } = useChainEvents();
  const [breadcrumb, setBreadcrumb] = useState<string>('');
  const [section, setSection] = useState<number>(0);

  return (
    <FlexColumn
      $rowGap={'1rem'}
      style={{ height: '100%', padding: '2rem 0rem 0' }}
    >
      <MainHeading style={{ padding: '0 1rem' }}>
        Chain Subscriptions
      </MainHeading>
      <CarouselWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.35,
          type: 'spring',
          bounce: 0.1,
        }}
        onTransitionEnd={() => {
          /* empty */
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
          <FlexColumnWrap>
            <Networks
              setBreadcrumb={setBreadcrumb}
              setSection={setSection}
              setActiveChain={setActiveChain}
            />
          </FlexColumnWrap>
        </div>
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem 1rem' }}
        >
          <Subscriptions
            breadcrumb={breadcrumb}
            setSection={setSection}
            subscriptions={
              activeChain ? (subscriptions.get(activeChain) ?? []) : []
            }
          />
        </div>
      </CarouselWrapper>
    </FlexColumn>
  );
};
