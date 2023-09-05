// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnyJson } from '@polkadot-live/types';
import { useState } from 'react';
import { NoAccounts } from '../NoAccounts';
import { CarouselWrapper } from '../Wrappers';
import { Accounts } from './Accounts';
import { Permissions } from './Permissions';
import { Wrapper } from './Wrappers';

export const Manage = ({ addresses }: AnyJson) => {
  // Store the currently active maange tab.
  const [section, setSection] = useState<number>(0);

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
        {addresses.length ? (
          <Wrapper className="scrollable">
            <Accounts setSection={setSection} addresses={addresses} />
          </Wrapper>
        ) : (
          <NoAccounts />
        )}
      </div>
      <div>
        <Permissions setSection={setSection} />
      </div>
    </CarouselWrapper>
  );
};
