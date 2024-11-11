// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ActiveDefinition } from './Items/ActiveDefinition';
import { ButtonPrimaryInvert } from '@ren/renderer/kits/Buttons/ButtonPrimaryInvert';
import { CanvasContainer } from '@ren/renderer/kits/Overlay/structure/CanvasContainer';
import { CanvasScroll } from '@ren/renderer/kits/Overlay/structure/CanvasScroll';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ModalContent } from '@ren/renderer/kits/Overlay/structure/ModalContent';
import { useAnimation } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import { useHelp } from '@ren/renderer/contexts/common/Help';

export const Help = () => {
  const controls = useAnimation();
  const { setStatus, status, definition, closeHelp } = useHelp();

  const onFadeIn = useCallback(async () => {
    await controls.start('visible');
  }, []);

  const onFadeOut = useCallback(async () => {
    await controls.start('hidden');
    setStatus('closed');
  }, []);

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
