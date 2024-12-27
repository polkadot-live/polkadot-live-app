// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleChevronLeft,
  faCircleChevronRight,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import { InfoCardStepsWrapper } from '../../Wrappers';

/**
 * TODO: Move component to library.
 */

export const InfoCardSteps = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = 3;

  const getSteps = (): React.ReactNode[] =>
    (children as React.ReactNode[]).map((fragment, i) => (
      <AnimatePresence key={`step-${i}`}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75 }}
        >
          <FontAwesomeIcon icon={faCircleDot} transform={'shrink-3'} />
          {fragment}
        </motion.span>
      </AnimatePresence>
    ));

  const clickChev = (dir: 'next' | 'prev') => {
    setStepIndex((pv) => {
      if (dir === 'next') {
        return pv + 1 === totalSteps ? 0 : pv + 1;
      } else {
        return pv - 1 < 0 ? totalSteps - 1 : pv - 1;
      }
    });
  };

  return (
    <InfoCardStepsWrapper className={className} style={style}>
      {getSteps()[stepIndex]}
      <div>
        <button disabled={stepIndex === 0} onClick={() => clickChev('prev')}>
          <FontAwesomeIcon className="chev" icon={faCircleChevronLeft} />
        </button>
        <span>
          {stepIndex + 1} of {totalSteps}
        </span>
        <button
          disabled={stepIndex === totalSteps - 1}
          onClick={() => clickChev('next')}
        >
          <FontAwesomeIcon className="chev" icon={faCircleChevronRight} />
        </button>
      </div>
    </InfoCardStepsWrapper>
  );
};
