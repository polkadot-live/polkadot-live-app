// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import * as Kits from '@polkadot-live/ui/kits/overlay';
import { useState } from 'react';
import { useContextProxy } from '@polkadot-live/contexts';
import { Overview } from './Overview';
import { Referenda } from './Referenda';
import { Tracks } from './Tracks';

export const OpenGov = () => {
  const { useCtx } = useContextProxy();
  const { getOnlineMode } = useCtx('ConnectionsCtx')();
  const { openHelp } = useCtx('HelpCtx')();
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
      </Kits.ModalMotionTwoSection>
    </Kits.ModalSection>
  );
};
