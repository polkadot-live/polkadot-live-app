// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { intervalTasks as allIntervalTasks } from '@ren/config/subscriptions/interval';
import { ReferendumRowWrapper, TitleWithOrigin } from './Wrappers';
import { renderOrigin } from '@ren/renderer/utils/openGovUtils';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useReferenda } from '@ren/renderer/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@ren/renderer/contexts/openGov/ReferendaSubscriptions';
import { useTooltip } from '@polkadot-live/ui/contexts';
import { useOverlay } from '@ren/renderer/contexts/common/Overlay';
import { useHelp } from '@ren/renderer/contexts/common/Help';
import { useState } from 'react';
import { useTaskHandler } from '@ren/renderer/contexts/openGov/TaskHandler';
import { usePolkassembly } from '@ren/renderer/contexts/openGov/Polkassembly';
import { motion } from 'framer-motion';
import {
  faChevronDown,
  faChevronUp,
  faInfo,
  faMinus,
  faPlus,
  faHashtag,
  faUpRightFromSquare,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { InfoOverlay } from './InfoOverlay';
import type { ReferendumRowProps } from '../types';
import type { PolkassemblyProposal } from '@ren/renderer/contexts/openGov/Polkassembly/types';

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
              <FontAwesomeIcon icon={faHashtag} transform={'shrink-5'} />
              {referendum.referendaId}
            </span>
            {usePolkassemblyApi ? (
              <TitleWithOrigin>
                <h4>{proposalData ? getProposalTitle(proposalData) : ''}</h4>
                <div>
                  <p>{renderOrigin(referendum)}</p>
                </div>
              </TitleWithOrigin>
            ) : (
              <h4 className="mw-20">{renderOrigin(referendum)}</h4>
            )}
          </div>
        </div>
        <div className="right">
          <div className="links-wrapper">
            {/* More */}
            <button
              className="btn-more tooltip-trigger-element"
              onClick={() => handleMoreClick()}
              data-tooltip-text="View Description"
              onMouseMove={() => setTooltipTextAndOpen('View Description')}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            {/* Polkassembly */}
            <button
              className="btn-polkassembly tooltip-trigger-element"
              data-tooltip-text="Polkassembly"
              onMouseMove={() => setTooltipTextAndOpen('Polkassembly')}
              onClick={() => {
                window.myAPI.openBrowserURL(uriPolkassembly);
                window.myAPI.umamiEvent('link-open', { dest: 'polkassembly' });
              }}
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} />
            </button>
            {/* Subsquare */}
            <button
              className="btn-subsquare tooltip-trigger-element"
              data-tooltip-text="Subsquare"
              onMouseMove={() => setTooltipTextAndOpen('Subsquare')}
              onClick={() => {
                window.myAPI.openBrowserURL(uriSubsquare);
                window.myAPI.umamiEvent('link-open', { dest: 'subsquare' });
              }}
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} />
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
                {isSubscribedToTask(referendum, t) ? (
                  <button
                    className="add-btn"
                    onClick={() => removeIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faMinus} transform={'shrink-4'} />
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => addIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faPlus} transform={'shrink-2'} />
                  </button>
                )}
                <p>{t.label}</p>
                <span onClick={() => openHelp(t.helpKey)}>
                  <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </ReferendumRowWrapper>
  );
};
