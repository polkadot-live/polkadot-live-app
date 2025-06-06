// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono } from '../../kits/Buttons/ButtonMono';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cubicBezier, motion } from 'framer-motion';
import { useState } from 'react';
import { StatsSectionWrapper, SubHeading } from './Stats.styles';
import type { StatsSectionProps } from './StatsSection.types';

/**
 * @name StatsSection
 * @deprecated Replaced with radix-ui accordion.
 */
export const StatsSection = ({
  title,
  btnText,
  btnClickHandler,
  children,
}: StatsSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLButtonElement)) {
      setIsCollapsed((pv) => !pv);
    }
  };

  return (
    <StatsSectionWrapper>
      <div className="header-wrapper" onClick={handleClick}>
        <SubHeading>
          <FontAwesomeIcon
            style={{ minWidth: '0.75rem' }}
            icon={isCollapsed ? faCaretRight : faCaretDown}
          />
          <h2>{title}</h2>
        </SubHeading>
        <ButtonMono
          className="btn"
          iconLeft={faCaretRight}
          text={btnText}
          onClick={btnClickHandler}
        />
      </div>

      <motion.div
        style={{ overflowY: 'hidden' }}
        variants={{
          open: { height: '100%' },
          close: { height: 0 },
        }}
        animate={isCollapsed ? 'close' : 'open'}
        transition={{
          ease: cubicBezier(0.15, 1, 0.1, 1),
          duration: 0.3,
        }}
      >
        {children}
      </motion.div>
    </StatsSectionWrapper>
  );
};
