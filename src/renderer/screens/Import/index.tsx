// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { Home } from './Home';
import { ImportLedger } from './Ledger';
import { ImportVault } from './Vault';
import type { AccountSource } from '@/types/accounts';
import { ModalSection } from '@/renderer/kits/Overlay/structure/ModalSection';
import { ModalMotionTwoSection } from '@/renderer/kits/Overlay/structure/ModalMotionTwoSection';

export const Import: React.FC = () => {
  const [source, setSource] = useState<AccountSource | undefined>('ledger');

  // active section
  const [section, setSection] = useState<number>(0);

  useEffect(() => {
    if (section === 0) {
      setSource(undefined);
    }
  }, [section]);

  return (
    <ModalSection type="carousel">
      <ModalMotionTwoSection
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.5,
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
        <div
          style={{
            flexBasis: '50%',
            minWidth: '50%',
            height: 'auto',
            flexGrow: 1,
          }}
        >
          <Home setSection={setSection} setSource={setSource} />
        </div>
        <div
          style={{
            flexBasis: '50%',
            minWidth: '50%',
            height: 'auto',
            flexGrow: 1,
          }}
        >
          {source === 'ledger' && (
            <ImportLedger section={section} setSection={setSection} />
          )}
          {source === 'vault' && (
            <ImportVault section={section} setSection={setSection} />
          )}
        </div>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
