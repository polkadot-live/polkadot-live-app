// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { TrackItem } from './Wrappers';
import { motion } from 'framer-motion';
import type { TrackRowProps } from './types';

export const TrackRow = ({ track }: TrackRowProps) => {
  const [expanded, setExpanded] = useState(true);

  const expandVariants = {
    open: { height: 'auto' },
    closed: { height: 0 },
  };

  return (
    <TrackItem>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>Track ID</span>
            <h4>{track.trackId}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Origin</span>
            <h4>{track.label}</h4>
          </div>
        </div>
        <div className="right">
          <div className="stat-wrapper">
            <span>Max Deciding</span>
            <h4>{track.maxDeciding}</h4>
          </div>
          <button onClick={() => setExpanded(!expanded)}>Expand</button>
        </div>
      </div>
      <motion.section
        className="collapse"
        initial={{ height: 0 }}
        animate={expanded ? 'open' : 'closed'}
        variants={expandVariants}
        transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
      >
        <div className="periods-wrapper">
          <div className="stat-wrapper">
            <span>Prepare Period</span>
            <h4>{track.preparePeriod}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Decision Period</span>
            <h4>{track.decisionPeriod}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Confirm Period</span>
            <h4>{track.confirmPeriod}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Enactment Period</span>
            <h4>{track.minEnactmentPeriod}</h4>
          </div>
        </div>
      </motion.section>
    </TrackItem>
  );
};
