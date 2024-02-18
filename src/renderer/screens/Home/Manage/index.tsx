// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@/types/misc';
import { useState } from 'react';
import { CarouselWrapper } from '../Wrappers';
import { Accounts } from './Accounts';
import { Permissions } from './Permissions';
import { Wrapper } from './Wrappers';

export const Manage = ({ addresses }: AnyJson) => {
  // Store the currently active maange tab.
  const [section, setSection] = useState<number>(0);

  // Outermost breadcrumb title.
  const [breadcrumb, setBreadcrumb] = useState<string>('');

  return (
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
        <Wrapper className="scrollable">
          <Accounts
            setSection={setSection}
            setBreadcrumb={setBreadcrumb}
            addresses={addresses}
          />
        </Wrapper>
      </div>
      <div>
        <Permissions
          setSection={setSection}
          section={section}
          breadcrumb={breadcrumb}
        />
      </div>
    </CarouselWrapper>
  );
};
