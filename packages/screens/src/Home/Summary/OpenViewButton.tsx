// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections } from '@polkadot-live/contexts';
import { FlexColumn } from '@polkadot-live/styles';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { HoverGradient, OpenViewButtonWrapper } from './Wrappers';
import type { OpenViewButtonProps } from './types';

export const OpenViewButton = ({
  title,
  icon,
  target,
  umamiEvent,
}: OpenViewButtonProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { cacheGet, openTab } = useConnections();
  const darkMode = cacheGet('mode:dark');

  return (
    <OpenViewButtonWrapper
      $active={isHovering}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => openTab(target, { event: umamiEvent, data: null })}
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
