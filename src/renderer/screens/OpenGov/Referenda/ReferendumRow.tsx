// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { intervalTasks as allIntervalTasks } from '@/config/subscriptions/interval';
import { ReferendumRowWrapper } from './Wrappers';
import { renderOrigin } from '../utils';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@/renderer/contexts/openGov/ReferendaSubscriptions';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripDotsVertical } from '@fortawesome/pro-light-svg-icons';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  faHexagonMinus,
  faHexagonPlus,
  faInfo,
} from '@fortawesome/pro-solid-svg-icons';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({ referendum }: ReferendumRowProps) => {
  const { activeReferendaChainId: chainId } = useReferenda();
  const {
    addReferendaSubscription,
    removeReferendaSubscription,
    isSubscribedToTask,
  } = useReferendaSubscriptions();
  const { setTooltipTextAndOpen } = useTooltip();
  const { openHelp } = useHelp();

  /// Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);

  const { referendaId } = referendum;
  const uriPolkassembly = `https://${chainId}.polkassembly.io/referenda/${referendaId}`;
  const uriSubsquare = `https://${chainId}.subsquare.io/referenda/${referendaId}`;

  const getIntervalSubscriptions = (cid: ChainID) =>
    allIntervalTasks.filter((t) => t.chainId === cid);

  /// Handles adding an interval subscription for a referendum.
  const addIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => {
    console.log(
      `add task: ${task.action} for referendum with ID: ${referendumInfo.referendaId}`
    );

    // Set referendum ID on task.
    const { referendaId: referendumId } = referendumInfo;
    task.referendumId = referendumId;

    // Cache subscription in referenda subscriptions context.
    addReferendaSubscription({ ...task });

    // Communicate with main renderer to process subscription task.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:add',
      data: {
        task: JSON.stringify(task),
      },
    });

    // - Receive feedback from main renderer to update:
    // - UI (toastify, subscription button)
    // - Update `Manage` UI to add subscription task.
  };

  /// Handles removing an interval subscription for a referendum.
  const removeIntervalSubscription = (
    task: IntervalSubscription,
    referendumInfo: ActiveReferendaInfo
  ) => {
    // Remove subscription in referenda subscriptions context.
    removeReferendaSubscription(task, referendumInfo.referendaId);

    // Communicate with main renderer to remove subscription from controller.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:interval:remove',
      data: {
        task: JSON.stringify(task),
      },
    });

    // - Receive feedback from main renderer to update UI:
    // - Toastify and subscription button.
  };

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
            {/* Render interval tasks from config */}
            {getIntervalSubscriptions(chainId).map((t, i) => (
              <div key={`${t.action}_${i}`} className="subscription-row">
                <span>{renderHelpIcon(t.helpKey)}</span>
                <p>{t.label}:</p>
                {isSubscribedToTask(referendum, t) ? (
                  <button
                    className="add-btn"
                    onClick={() => removeIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faHexagonMinus} />
                    <span>Remove</span>
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => addIntervalSubscription(t, referendum)}
                  >
                    <FontAwesomeIcon icon={faHexagonPlus} />
                    <span>Add</span>
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
