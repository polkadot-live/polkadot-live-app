// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { StickyHeading, TrackItem } from './Wrappers';
import { formatChainUnits } from '@core/library/TextLib';
import { motion } from 'framer-motion';
import {
  faAngleDown,
  faAngleUp,
  faInfo,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatBlocksToTime } from '@core/library/TimeLib';
import { useHelp } from '@ren/contexts/common/Help';
import { useTracks } from '@ren/contexts/openGov/Tracks';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { TrackRowProps } from '../types';

// Re-use track item component for header alignment.
export const StickyHeadingsRow = () => {
  const { openHelp } = useHelp();

  return (
    <TrackItem
      style={{
        position: 'sticky',
        top: '0',
        zIndex: 10,
        backgroundColor: 'var(--background-window)',
      }}
    >
      <FlexRow className="TrackRow">
        <FlexRow $gap={'1.5rem'} style={{ flex: 1 }}>
          <div className="RowItem">
            <StickyHeading style={{ marginLeft: '8px' }}>ID</StickyHeading>
          </div>
          <div className="RowItem">
            <StickyHeading style={{ marginLeft: '-2px' }}>
              <FlexRow $gap={'0.2rem'}>
                Track
                <div
                  className="IconWrapper"
                  onClick={() => openHelp('help:openGov:track')}
                >
                  <FontAwesomeIcon className="Icon" icon={faInfo} />
                </div>
              </FlexRow>
            </StickyHeading>
          </div>
          <div className="RowItem SmxHide">
            <StickyHeading style={{ marginLeft: '-10px' }}>
              Decision Deposit
            </StickyHeading>
          </div>
          <div className="RowItem SmHide SmxHide">
            <StickyHeading style={{ marginLeft: '-20px' }}>
              <FlexRow $gap={'0.2rem'}>
                Max Desciding
                <div
                  className="IconWrapper"
                  onClick={() => openHelp('help:openGov:maxDeciding')}
                >
                  <FontAwesomeIcon className="Icon" icon={faInfo} />
                </div>
              </FlexRow>
            </StickyHeading>
          </div>
        </FlexRow>
        <FlexRow style={{ justifyContent: 'start', marginRight: '16px' }}>
          <div className="RowItem">
            <StickyHeading>Timeline</StickyHeading>
          </div>
        </FlexRow>
      </FlexRow>
    </TrackItem>
  );
};

export const TrackRow = ({ track }: TrackRowProps) => {
  const [expanded, setExpanded] = useState(false);

  const { openHelp } = useHelp();
  const { activeChainId: chainId } = useTracks();

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
      <FlexRow className="TrackRow">
        <FlexRow $gap={'1.5rem'} style={{ flex: 1 }}>
          <div className="RowItem">
            <span style={{ gap: '0.25rem' }}>
              <FontAwesomeIcon icon={faHashtag} transform={'shrink-2'} />
              {track.trackId}
            </span>
          </div>
          <div className="RowItem">
            <FlexRow $gap={'0.5rem'}>
              <h4>{track.label}</h4>
              {renderHelpIcon(track.helpKey)}
            </FlexRow>
          </div>
          <div className="RowItem SmxHide">
            <h4>{formatChainUnits(track.decisionDeposit, chainId)}</h4>
          </div>
          <div className="RowItem SmHide SmxHide">
            <h4>{track.maxDeciding}</h4>
          </div>
        </FlexRow>
        <FlexRow>
          <div
            className={`expand-btn-wrapper ${chainId === 'Polkadot' ? 'polkadot-bg' : 'kusama-bg'}`}
            onClick={() => setExpanded(!expanded)}
          >
            <h4>Timeline</h4>
            <div className="expand-btn">
              <FontAwesomeIcon
                icon={expanded ? faAngleUp : faAngleDown}
                transform={'shrink-3'}
              />
            </div>
          </div>
        </FlexRow>
      </FlexRow>
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
