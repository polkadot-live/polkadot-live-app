// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as Kits from '@polkadot-live/ui/kits/overlay';

import { Config as ConfigOpenGov } from '@ren/config/openGov';
import { useOpenGovMessagePorts } from '@app/hooks/useOpenGovMessagePorts';
import { useEffect, useState } from 'react';
import { useConnections } from '@app/contexts/common/Connections';
import { useDebug } from '@app/hooks/useDebug';
import { useTreasury } from '@app/contexts/openGov/Treasury';
import { LinksFooter } from '@ren/utils/RenderingUtils';
import { Overview } from './Overview';
import { Referenda } from './Referenda';
import { Tracks } from './Tracks';

export const OpenGov: React.FC = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();
  useDebug(window.myAPI.getWindowId());

  const { getOnlineMode } = useConnections();
  const { treasuryChainId, initTreasury } = useTreasury();

  const [section, setSection] = useState<number>(0);
  const [sectionContent, setSectionContent] = useState('');

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
            <Styles.PadWrapper>
              <Overview
                setSection={setSection}
                setSectionContent={setSectionContent}
              />
            </Styles.PadWrapper>
            <LinksFooter />
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
