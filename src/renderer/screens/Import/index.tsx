// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { Home } from './Home';
import { ImportLedger } from './Ledger';
import { ImportVault } from './Vault';
import { ModalSection } from '@/renderer/kits/Overlay/structure/ModalSection';
import { ModalMotionTwoSection } from '@/renderer/kits/Overlay/structure/ModalMotionTwoSection';
import { ImportReadOnly } from './ReadOnly';
import { useImportMessagePorts } from '@/renderer/hooks/useImportMessagePorts';
import type { AccountSource } from '@/types/accounts';
import { useDebug } from '@/renderer/hooks/useDebug';

export const Import: React.FC = () => {
  // Set up port communication for `import` window.
  useImportMessagePorts();
  useDebug(window.myAPI.getWindowId());

  const [source, setSource] = useState<AccountSource | null>(null);

  // Active section
  const [section, setSection] = useState<number>(0);

  useEffect(() => {
    if (section === 0) {
      setSource(null);
    }
  }, [section]);

  const getShowClass = (target: AccountSource) =>
    source ? (source === target ? 'show' : 'hide') : 'hide';

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
          <div className={getShowClass('ledger')}>
            <ImportLedger setSection={setSection} curSource={source} />
          </div>
          <div className={getShowClass('vault')}>
            <ImportVault section={section} setSection={setSection} />
          </div>
          <div className={getShowClass('read-only')}>
            <ImportReadOnly section={section} setSection={setSection} />
          </div>
        </div>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
