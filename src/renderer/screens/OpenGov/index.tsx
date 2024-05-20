// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { useState } from 'react';
import { ModalSection } from '@/renderer/kits/Overlay/structure/ModalSection';
import { ModalMotionTwoSection } from '@/renderer/kits/Overlay/structure/ModalMotionTwoSection';
import { Tracks } from './Tracks';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { faCaretRight } from '@fortawesome/pro-solid-svg-icons';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  /// Active section.
  const [section, setSection] = useState<number>(0);

  /// Open origins and tracks information.
  const handleOpenTracks = () => {
    // Request tracks data from main renderer.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:tracks:get',
      data: {
        chainId: 'Polkadot',
      },
    });

    setSection(1);
  };

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
        {/* Section 1 */}
        <section className="carousel-section-wrapper">
          <HeaderWrapper>
            <div className="content">
              <DragClose windowName="openGov" />
              <h3>Explore Open Gov</h3>
            </div>
          </HeaderWrapper>
          <ContentWrapper style={{ paddingTop: '1.75rem' }}>
            <ButtonPrimaryInvert
              text={'Origins and Tracks'}
              iconLeft={faCaretRight}
              style={{ padding: '0.3rem 1.25rem' }}
              onClick={() => handleOpenTracks()}
            />
          </ContentWrapper>
        </section>

        {/* Section 2 */}
        <section className="carousel-section-wrapper">
          <Tracks setSection={setSection} />
        </section>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
