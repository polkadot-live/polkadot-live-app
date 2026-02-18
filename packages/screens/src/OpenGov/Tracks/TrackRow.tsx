// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faAngleDown,
  faAngleUp,
  faHashtag,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHelp, useTracks } from '@polkadot-live/contexts';
import { formatBlocksToTime, formatChainUnits } from '@polkadot-live/core';
import { FlexRow } from '@polkadot-live/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { StickyHeading, TrackItem } from './Wrappers';
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
                <button
                  type="button"
                  className="IconWrapper"
                  onClick={() => openHelp('help:openGov:track')}
                >
                  <FontAwesomeIcon className="Icon" icon={faInfo} />
                </button>
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
                <button
                  type="button"
                  className="IconWrapper"
                  onClick={() => openHelp('help:openGov:maxDeciding')}
                >
                  <FontAwesomeIcon className="Icon" icon={faInfo} />
                </button>
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
  const { openHelp } = useHelp();
  const { activeChainId: chainId } = useTracks();

  const [expanded, setExpanded] = useState(false);
  const expandVariants = {
    open: { height: 'auto' },
    closed: { height: 0 },
  };

  const renderHelpIcon = (key: HelpItemKey) => (
    <button
      type="button"
      className="icon-wrapper"
      onClick={() => openHelp(key)}
    >
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
    </button>
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
          <button
            type="button"
            className={`expand-btn-wrapper ${chainId === 'Polkadot Asset Hub' ? 'polkadot-bg' : 'kusama-bg'}`}
            onClick={() => setExpanded(!expanded)}
          >
            <h4>Timeline</h4>
            <div className="expand-btn">
              <FontAwesomeIcon
                icon={expanded ? faAngleUp : faAngleDown}
                transform={'shrink-3'}
              />
            </div>
          </button>
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
