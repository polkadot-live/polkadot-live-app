// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { intervalTasks as allIntervalTasks } from '@/config/subscriptions/interval';
import { MoreButton, ReferendumRowWrapper, TitleWithOrigin } from './Wrappers';
import { renderOrigin } from '@/renderer/utils/openGovUtils';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@/renderer/contexts/openGov/ReferendaSubscriptions';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useState } from 'react';
import { useTaskHandler } from '@/renderer/contexts/openGov/TaskHandler';
import { usePolkassembly } from '@/renderer/contexts/openGov/Polkassembly';
import { motion } from 'framer-motion';
import {
  faChevronDown,
  faChevronUp,
  faInfo,
  faMinus,
  faPlus,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import { ControlsWrapper, SortControlButton } from '@app/library/SortControls';
import { InfoOverlay } from './InfoOverlay';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { ReferendumRowProps } from '../types';
import type { PolkassemblyProposal } from '@/renderer/contexts/openGov/Polkassembly/types';

export const ReferendumRow = ({ referendum, index }: ReferendumRowProps) => {
  const { referendaId } = referendum;

  const { setTooltipTextAndOpen } = useTooltip();
  const { openHelp } = useHelp();
  const { openOverlayWith } = useOverlay();

  const { activeReferendaChainId: chainId } = useReferenda();
  const { isSubscribedToTask, allSubscriptionsAdded } =
    useReferendaSubscriptions();

  const {
    addIntervalSubscription,
    addAllIntervalSubscriptions,
    removeAllIntervalSubscriptions,
    removeIntervalSubscription,
  } = useTaskHandler();

  const { getProposal, usePolkassemblyApi } = usePolkassembly();
  const proposalData = getProposal(referendaId);

  /// Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);
  const uriPolkassembly = `https://${chainId}.polkassembly.io/referenda/${referendaId}`;
  const uriSubsquare = `https://${chainId}.subsquare.io/referenda/${referendaId}`;

  const getIntervalSubscriptions = () =>
    allIntervalTasks.filter((t) => t.chainId === chainId);

  const renderHelpIcon = (key: HelpItemKey) => (
    <div className="icon-wrapper" onClick={() => openHelp(key)}>
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
    </div>
  );

  const getProposalTitle = (data: PolkassemblyProposal) => {
    const { title } = data;
    return title === '' ? (
      <p style={{ margin: 0, opacity: 0.75 }}>No Title</p>
    ) : title.length < 28 ? (
      title
    ) : (
      ellipsisFn(title, 28, 'end')
    );
  };

  const handleMoreClick = () => {
    openOverlayWith(<InfoOverlay proposalData={proposalData!} />, 'large');
  };

  return (
    <ReferendumRowWrapper>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>
              <FontAwesomeIcon icon={faHashtag} transform={'shrink-0'} />
              {referendum.referendaId}
            </span>
            {usePolkassemblyApi ? (
              <TitleWithOrigin>
                <h4>{proposalData ? getProposalTitle(proposalData) : ''}</h4>
                <div>
                  <p>{renderOrigin(referendum)}</p>
                  <MoreButton onClick={() => handleMoreClick()}>
                    More
                  </MoreButton>
                </div>
              </TitleWithOrigin>
            ) : (
              <h4 className="mw-20">{renderOrigin(referendum)}</h4>
            )}
          </div>
        </div>
        <div className="right">
          <div className="links-wrapper">
            {/* Polkassembly */}
            <button
              className="btn-polkassembly"
              onClick={() => {
                window.myAPI.openBrowserURL(uriPolkassembly);
                window.myAPI.umamiEvent('link-open', { dest: 'polkassembly' });
              }}
            >
              Polkassembly
            </button>
            {/* Subsquare */}
            <button
              className="btn-subsquare"
              onClick={() => {
                window.myAPI.openBrowserURL(uriSubsquare);
                window.myAPI.umamiEvent('link-open', { dest: 'subsquare' });
              }}
            >
              Subsquare
            </button>
          </div>
          {/* Add + Remove Subscriptions */}
          <div className="menu-btn-wrapper">
            <ControlsWrapper style={{ marginBottom: '0' }}>
              {!allSubscriptionsAdded(chainId, referendum) ? (
                <div
                  className="tooltip-trigger-element"
                  data-tooltip-text="Subscribe All"
                  onMouseMove={() => setTooltipTextAndOpen('Subscribe All')}
                >
                  <SortControlButton
                    isActive={true}
                    isDisabled={false}
                    faIcon={faPlus}
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
                    faIcon={faMinus}
                    onClick={() =>
                      removeAllIntervalSubscriptions(
                        getIntervalSubscriptions(),
                        referendum
                      )
                    }
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
                    <FontAwesomeIcon icon={faMinus} transform={'shrink-4'} />
                    <span>Unsubscribe</span>
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => addIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faPlus} transform={'shrink-2'} />
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
