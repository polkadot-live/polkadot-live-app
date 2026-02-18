// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections, useHelp } from '@polkadot-live/contexts';
import * as UI from '@polkadot-live/ui';
import { useEffect, useState } from 'react';
import { Home } from './Home';
import { ImportLedger } from './Ledger';
import { ImportReadOnly } from './ReadOnly';
import { ImportVault } from './Vault';
import { ImportWalletConnect } from './WalletConnect';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { ImportScreenProps } from './types';

export const ImportScreen = ({
  source,
  section,
  setSection,
}: ImportScreenProps) => {
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

export const Import = () => {
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

  return (
    <UI.ModalSection type="carousel" style={{ height: '100%' }}>
      <UI.ModalMotionTwoSection
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
            {!getOnlineMode() && (
              <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
            )}
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
              {!getOnlineMode() && (
                <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
              )}
              <ImportScreen
                source={source}
                section={section}
                setSection={setSection}
              />
              <UI.LinksFooter openHelp={openHelp} />
            </UI.ScrollableMax>
          )}
        </div>
      </UI.ModalMotionTwoSection>
    </UI.ModalSection>
  );
};
