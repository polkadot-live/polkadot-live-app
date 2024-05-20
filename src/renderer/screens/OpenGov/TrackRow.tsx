// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { TrackItem } from './Wrappers';
import { motion } from 'framer-motion';
import {
  faAngleDown,
  faAngleUp,
  faInfo,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatBlocksToTime } from '@/model/Track';
import { useHelp } from '@/renderer/contexts/common/Help';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { TrackRowProps } from './types';

export const TrackRow = ({ track }: TrackRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const chainId: ChainID = 'Polkadot';

  const { openHelp } = useHelp();

  const expandVariants = {
    open: { height: 'auto' },
    closed: { height: 0 },
  };

  const renderHelpIcon = (key: HelpItemKey) => (
    <div className="icon-wrapper" onClick={() => openHelp(key)}>
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
    </div>
  );

  return (
    <TrackItem>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>Track ID</span>
            <h4 className="mw-20">{track.trackId}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Origin</span>
            <h4>
              {renderHelpIcon(track.helpHey)} {track.label}
            </h4>
          </div>
        </div>
        <div className="right">
          <div className="stat-wrapper">
            <span>Max Deciding</span>
            <h4 className="mw-45">{track.maxDeciding}</h4>
          </div>
          <div
            className="expand-btn-wrapper"
            onClick={() => setExpanded(!expanded)}
          >
            <h4>Periods</h4>
            <div className="expand-btn">
              <FontAwesomeIcon
                icon={expanded ? faAngleUp : faAngleDown}
                transform={'shrink-3'}
              />
            </div>
          </div>
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
          <div className="period-stat-wrapper">
            <span>
              {renderHelpIcon('help:openGov:preparePeriod')} Prepare Period
            </span>
            <h4>{formatBlocksToTime(chainId, track.preparePeriod)}</h4>
            <span>{track.preparePeriod} blocks</span>
          </div>
          <div className="period-stat-wrapper">
            <span>
              {renderHelpIcon('help:openGov:decisionPeriod')} Decision Period
            </span>
            <h4>{formatBlocksToTime(chainId, track.decisionPeriod)}</h4>
            <span>{track.decisionPeriod} blocks</span>
          </div>
          <div className="period-stat-wrapper">
            <span>
              {renderHelpIcon('help:openGov:confirmPeriod')} Confirm Period
            </span>
            <h4>{formatBlocksToTime(chainId, track.confirmPeriod)}</h4>
            <span>{track.confirmPeriod} blocks</span>
          </div>
          <div className="period-stat-wrapper">
            <span>
              {renderHelpIcon('help:openGov:enactmentPeriod')} Enactment Period
            </span>
            <h4>{formatBlocksToTime(chainId, track.minEnactmentPeriod)}</h4>
            <span>{track.minEnactmentPeriod} blocks</span>
          </div>
        </div>
      </motion.section>
    </TrackItem>
  );
};
