// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections, useHelp } from '@polkadot-live/contexts';
import * as Styles from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { useState } from 'react';
import { Overview } from './Overview';
import { Referenda } from './Referenda';
import { Tracks } from './Tracks';

export const OpenGov = () => {
  const { getOnlineMode } = useConnections();
  const { openHelp } = useHelp();
  const [section, setSection] = useState<number>(0);
  const [sectionContent, setSectionContent] = useState('');

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
            {!getOnlineMode() && (
              <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
            )}
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
      </UI.ModalMotionTwoSection>
    </UI.ModalSection>
  );
};
