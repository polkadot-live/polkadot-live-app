// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import * as Kits from '@polkadot-live/ui/kits/overlay';
import { ConfigOpenGov } from '@polkadot-live/core';
import { useOpenGovMessagePorts } from '@ren/hooks/useOpenGovMessagePorts';
import { useEffect, useState } from 'react';
import { useConnections } from '@ren/contexts/common';
import { useHelp } from '@polkadot-live/ui/contexts';
import { useDebug } from '@ren/hooks/useDebug';
import { useTreasury } from '@ren/contexts/openGov';
import { Overview } from './Overview';
import { Referenda } from './Referenda';
import { Tracks } from './Tracks';
import { FadeInWrapper } from '@polkadot-live/ui/utils';

export const FadeOpenGov = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();
  useDebug(window.myAPI.getWindowId());

  const { getOnlineMode, stateLoaded } = useConnections();
  const { treasuryChainId, initTreasury } = useTreasury();

  // Initialize treasury data when window opens.
  useEffect(() => {
    if (ConfigOpenGov._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, []);

  // Initialize treasury data when port is received.
  useEffect(() => {
    if (ConfigOpenGov._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, [ConfigOpenGov._portExists]);

  // Reload treasury data if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode() && ConfigOpenGov._portExists) {
      initTreasury(treasuryChainId);
    }
  }, [getOnlineMode()]);

  return (
    <FadeInWrapper show={stateLoaded}>
      <OpenGov />
    </FadeInWrapper>
  );
};

export const OpenGov: React.FC = () => {
  const { getOnlineMode } = useConnections();
  const { openHelp } = useHelp();
  const [section, setSection] = useState<number>(0);
  const [sectionContent, setSectionContent] = useState('');

  return (
    <Kits.ModalSection type="carousel" style={{ height: '100%' }}>
      <Kits.ModalMotionTwoSection
        style={{ height: '100%' }}
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.5,
          type: 'spring',
          bounce: 0.1,
        }}
        variants={{
          home: { left: 0 },
          next: { left: '-100%' },
        }}
      >
        {/* Section 1 */}
        <section
          className="carousel-section-wrapper"
          style={{ height: '100%' }}
        >
          <UI.ScrollableMax>
            {!getOnlineMode() && <UI.OfflineBanner />}
            <Styles.PadWrapper>
              <Overview
                setSection={setSection}
                setSectionContent={setSectionContent}
              />
            </Styles.PadWrapper>
            <UI.LinksFooter openHelp={openHelp} />
          </UI.ScrollableMax>
        </section>

        {/* Section 2 */}
        <section
          className="carousel-section-wrapper"
          style={{ height: '100%' }}
        >
          {sectionContent === 'tracks' && <Tracks setSection={setSection} />}
          {sectionContent === 'referenda' && (
            <Referenda setSection={setSection} />
          )}
        </section>
      </Kits.ModalMotionTwoSection>
    </Kits.ModalSection>
  );
};
