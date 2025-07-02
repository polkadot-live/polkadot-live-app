// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManage } from '@ren/contexts/main';
import { useState } from 'react';
import { CarouselWrapper } from '../Wrappers';
import { MainHeading } from '@polkadot-live/ui/components';
import { Wrapper } from '../Manage/Wrappers';
import { Networks } from './Networks';
import { Subscriptions } from './Subscriptions';

export const OpenGov = () => {
  const { setDynamicIntervalTasks } = useManage();
  const [section, setSection] = useState<number>(0);
  const [breadcrumb, setBreadcrumb] = useState<string>('');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.75rem',
        height: '100%',
      }}
    >
      <MainHeading style={{ padding: '2rem 1rem 0' }}>
        OpenGov Subscriptions
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
            setDynamicIntervalTasks([], 'Polkadot');
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
          <Wrapper style={{ alignContent: 'start' }}>
            <Networks setBreadcrumb={setBreadcrumb} setSection={setSection} />
          </Wrapper>
        </div>
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem 1rem' }}
        >
          <Subscriptions breadcrumb={breadcrumb} setSection={setSection} />
        </div>
      </CarouselWrapper>
    </div>
  );
};
