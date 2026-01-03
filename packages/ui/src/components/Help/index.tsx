// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { ActiveDefinition } from './Items/ActiveDefinition';

/** Kits */
import { ButtonPrimaryInvert } from '../../kits/buttons/ButtonPrimaryInvert';
import { CanvasContainer } from '../../kits/overlay/structure/CanvasContainer';
import { CanvasScroll } from '../../kits/overlay/structure/CanvasScroll';
import { ModalContent } from '../../kits/overlay/structure/ModalContent';
import type { HelpProps } from './types';

export const Help = ({
  status,
  definition,
  closeHelp,
  setStatus,
}: HelpProps) => {
  const controls = useAnimation();

  const onFadeIn = async () => {
    await controls.start('visible');
  };

  const onFadeOut = async () => {
    await controls.start('hidden');
    setStatus('closed');
  };

  // Control canvas fade.
  useEffect(() => {
    if (status === 'open') {
      onFadeIn();
    } else if (status === 'closing') {
      onFadeOut();
    }
  }, [status]);

  // Return early if help not open.
  if (status === 'closed') {
    return null;
  }

  return (
    <CanvasContainer
      initial={{
        opacity: 0,
        scale: 1.05,
      }}
      animate={controls}
      transition={{
        duration: 0.2,
      }}
      variants={{
        hidden: {
          opacity: 0,
          scale: 1.05,
        },
        visible: {
          opacity: 1,
          scale: 1,
        },
      }}
      style={{
        zIndex: 20,
      }}
    >
      <CanvasScroll>
        <ModalContent>
          <div className="header-wrapper">
            <div className="title-wrapper">
              <h1>{definition?.title || ''}</h1>
            </div>
            <div className="buttons">
              <ButtonPrimaryInvert
                lg
                text={'Close'}
                iconLeft={faTimes}
                onClick={() => closeHelp()}
              />
            </div>
          </div>
          <ActiveDefinition description={definition?.definition || []} />
        </ModalContent>
      </CanvasScroll>
      <button type="button" className="close" onClick={() => closeHelp()}>
        &nbsp;
      </button>
    </CanvasContainer>
  );
};
