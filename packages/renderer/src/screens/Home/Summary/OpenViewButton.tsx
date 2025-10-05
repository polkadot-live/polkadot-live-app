// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FlexColumn } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HoverGradient, OpenViewButtonWrapper } from './Wrappers';
import type { OpenViewButtonProps } from './types';

export const OpenViewButton = ({
  title,
  icon,
  target,
  umamiEvent,
}: OpenViewButtonProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { cacheGet } = useConnections();
  const darkMode = cacheGet('mode:dark');

  return (
    <OpenViewButtonWrapper
      $active={isHovering}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        window.myAPI.openWindow(target);
        window.myAPI.umamiEvent(umamiEvent, null);
      }}
    >
      <FlexColumn>
        <FontAwesomeIcon className="icon" icon={icon} />
        <h2>{title}</h2>
      </FlexColumn>
      <AnimatePresence>
        {isHovering && (
          <HoverGradient
            $dark={darkMode}
            initial={{
              opacity: 0.2,
              backgroundPosition: 'left center',
            }}
            animate={{
              opacity: 1,
              backgroundPosition: 'right center',
            }}
            transition={{ duration: 0.35 }}
            exit={{ opacity: 0, backgroundPosition: 'left center' }}
          />
        )}
      </AnimatePresence>
    </OpenViewButtonWrapper>
  );
};
