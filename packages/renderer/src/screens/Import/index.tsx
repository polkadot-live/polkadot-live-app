// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import React, { useEffect, useState } from 'react';
import { Home } from './Home';
import { ImportLedger } from './Ledger';
import { ImportVault } from './Vault';
import {
  ModalMotionTwoSection,
  ModalSection,
} from '@polkadot-live/ui/kits/overlay';
import { ImportReadOnly } from './ReadOnly';
import { ImportWalletConnect } from './WalletConnect';
import { useImportMessagePorts } from '@ren/hooks/useImportMessagePorts';
import { useDebug } from '@ren/hooks/useDebug';
import { useConnections } from '@ren/contexts/common';
import { useHelp } from '@polkadot-live/ui/contexts';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import type { AccountSource } from '@polkadot-live/types/accounts';

export const FadeImport = () => {
  // Set up port communication for `import` window.
  useImportMessagePorts();
  useDebug(window.myAPI.getWindowId());
  const { stateLoaded } = useConnections();

  return (
    <FadeInWrapper show={stateLoaded}>
      <Import />
    </FadeInWrapper>
  );
};

export const Import: React.FC = () => {
  const { openHelp } = useHelp();
  const { getOnlineMode } = useConnections();

  // Active section
  const [section, setSection] = useState<number>(0);
  const [source, setSource] = useState<AccountSource | null>(null);

  useEffect(() => {
    if (section === 0) {
      setSource(null);
    }
  }, [section]);

  const renderImportScreen = () => {
    switch (source) {
      case 'ledger':
        return <ImportLedger setSection={setSection} />;
      case 'read-only':
        return <ImportReadOnly setSection={setSection} />;
      case 'vault':
        return <ImportVault section={section} setSection={setSection} />;
      case 'wallet-connect':
        return <ImportWalletConnect setSection={setSection} />;
      default:
        return <p>Source not selected.</p>;
    }
  };

  return (
    <ModalSection type="carousel" style={{ height: '100%' }}>
      <ModalMotionTwoSection
        style={{ height: '100%' }}
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
            display: 'flex',
            flexBasis: '50%',
            minWidth: '50%',
            height: '100%',
            flexGrow: 1,
          }}
        >
          <UI.ScrollableMax>
            {!getOnlineMode() && <UI.OfflineBanner />}
            <Home setSection={setSection} setSource={setSource} />
            <UI.LinksFooter openHelp={openHelp} />
          </UI.ScrollableMax>
        </div>
        <div
          style={{
            display: 'flex',
            flexBasis: '50%',
            minWidth: '50%',
            height: '100%',
            flexGrow: 1,
          }}
        >
          {section === 1 && (
            <UI.ScrollableMax>
              {!getOnlineMode() && <UI.OfflineBanner />}
              {renderImportScreen()}
              <UI.LinksFooter openHelp={openHelp} />
            </UI.ScrollableMax>
          )}
        </div>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
