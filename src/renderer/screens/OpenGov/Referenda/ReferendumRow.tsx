// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ReferendumRowWrapper } from './Wrappers';
import { renderOrigin } from '../utils';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripDotsVertical } from '@fortawesome/pro-light-svg-icons';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ReferendumRowProps } from '../types';
import { faHexagonPlus } from '@fortawesome/pro-solid-svg-icons';

export const ReferendumRow = ({ referendum }: ReferendumRowProps) => {
  const { activeReferendaChainId: chainId } = useReferenda();
  const { setTooltipTextAndOpen } = useTooltip();
  const [expanded, setExpanded] = useState(false);

  const { referendaId } = referendum;
  const uriPolkassembly = `https://${chainId}.polkassembly.io/referenda/${referendaId}`;
  const uriSubsquare = `https://${chainId}.subsquare.io/referenda/${referendaId}`;

  return (
    <ReferendumRowWrapper>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>ID</span>
            <h4 className="mw-20">{referendum.referendaId}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Origin</span>
            <h4>{renderOrigin(referendum)}</h4>
          </div>
        </div>
        <div className="right">
          <div className="links-wrapper">
            {/* Polkassembly */}
            <button
              className="btn-polkassembly"
              onClick={() => window.myAPI.openBrowserURL(uriPolkassembly)}
            >
              Polkassembly
            </button>
            {/* Subsquare */}
            <button
              className="btn-subsquare"
              onClick={() => window.myAPI.openBrowserURL(uriSubsquare)}
            >
              Subsquare
            </button>
          </div>
          {/* TODO: Subsciption Menu */}
          <div
            className="menu-btn-wrapper tooltip-trigger-element"
            data-tooltip-text="Subscriptions"
            onMouseMove={() => setTooltipTextAndOpen('Subscriptions')}
            onClick={() => setExpanded(!expanded)}
          >
            <FontAwesomeIcon icon={faGripDotsVertical} transform={'grow-6'} />
          </div>
        </div>
      </div>
      <motion.section
        className="collapse"
        initial={{ height: 0 }}
        animate={expanded ? 'open' : 'closed'}
        variants={{
          open: { height: 'auto' },
          closed: { height: 0 },
        }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
      >
        <div className="content-wrapper">
          <div className="subscription-grid">
            <div className="subscription-row">
              <p>Votes Tally:</p>
              <button className="add-btn">
                <FontAwesomeIcon icon={faHexagonPlus} />
                <span>Add</span>
              </button>
            </div>
            <div className="subscription-row">
              <p>Decision Period:</p>
              <button className="add-btn">
                <FontAwesomeIcon icon={faHexagonPlus} />
                <span>Add</span>
              </button>
            </div>
            <div className="subscription-row">
              <p>Thresholds:</p>
              <button className="add-btn">
                <FontAwesomeIcon icon={faHexagonPlus} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </ReferendumRowWrapper>
  );
};
