// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { intervalTasks as allIntervalTasks } from '@/config/subscriptions/interval';
import { ReferendumRowWrapper } from './Wrappers';
import { renderOrigin } from '@/renderer/utils/openGovUtils';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@/renderer/contexts/openGov/ReferendaSubscriptions';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/pro-light-svg-icons';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  faChevronDown,
  faChevronUp,
  faHexagonMinus,
  faHexagonPlus,
  faInfo,
  faOctagonMinus,
  faOctagonPlus,
} from '@fortawesome/pro-solid-svg-icons';
import { ControlsWrapper, SortControlButton } from '@/renderer/utils/common';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({
  referendum,
  index,
  addIntervalSubscription,
  removeIntervalSubscription,
  addAllIntervalSubscriptions,
}: ReferendumRowProps) => {
  const { setTooltipTextAndOpen } = useTooltip();
  const { openHelp } = useHelp();

  const { activeReferendaChainId: chainId } = useReferenda();
  const { isSubscribedToTask, allSubscriptionsAdded } =
    useReferendaSubscriptions();

  /// Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);

  const { referendaId } = referendum;
  const uriPolkassembly = `https://${chainId}.polkassembly.io/referenda/${referendaId}`;
  const uriSubsquare = `https://${chainId}.subsquare.io/referenda/${referendaId}`;

  const getIntervalSubscriptions = () =>
    allIntervalTasks.filter((t) => t.chainId === chainId);

  const renderHelpIcon = (key: HelpItemKey) => (
    <div className="icon-wrapper" onClick={() => openHelp(key)}>
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
    </div>
  );

  return (
    <ReferendumRowWrapper>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>
              <FontAwesomeIcon icon={faHashtag} transform={'shrink-0'} />
              {referendum.referendaId}
            </span>
            <h4 className="mw-20">{renderOrigin(referendum)}</h4>
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
          {/* Add + Remove Subscriptions */}
          <div className="menu-btn-wrapper">
            <ControlsWrapper>
              {!allSubscriptionsAdded(chainId, referendum) ? (
                <div
                  className="tooltip-trigger-element"
                  data-tooltip-text="Subscribe All"
                  onMouseMove={() => setTooltipTextAndOpen('Subscribe All')}
                >
                  <SortControlButton
                    isActive={true}
                    isDisabled={false}
                    faIcon={faOctagonPlus}
                    onClick={() =>
                      addAllIntervalSubscriptions(
                        getIntervalSubscriptions(),
                        referendum
                      )
                    }
                    fixedWidth={false}
                  />
                </div>
              ) : (
                <div
                  className="tooltip-trigger-element"
                  data-tooltip-text="Unsubscribe All"
                  onMouseMove={() => setTooltipTextAndOpen('Unsubscribe All')}
                >
                  <SortControlButton
                    isActive={true}
                    isDisabled={false}
                    faIcon={faOctagonMinus}
                    onClick={() => console.log('TODO')}
                    fixedWidth={false}
                  />
                </div>
              )}
              {/* Expand Button */}
              <SortControlButton
                isActive={true}
                isDisabled={false}
                faIcon={expanded ? faChevronUp : faChevronDown}
                onClick={() => setExpanded(!expanded)}
                fixedWidth={false}
              />
            </ControlsWrapper>
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
            {/* Render interval tasks from config */}
            {getIntervalSubscriptions().map((t) => (
              <div
                key={`${index}_${referendaId}_${t.action}`}
                className="subscription-row"
              >
                <span>{renderHelpIcon(t.helpKey)}</span>
                <p>{t.label}:</p>
                {isSubscribedToTask(referendum, t) ? (
                  <button
                    className="add-btn"
                    onClick={() => removeIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faHexagonMinus} />
                    <span>Unsubscribe</span>
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => addIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faHexagonPlus} />
                    <span>Subscribe</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </ReferendumRowWrapper>
  );
};
