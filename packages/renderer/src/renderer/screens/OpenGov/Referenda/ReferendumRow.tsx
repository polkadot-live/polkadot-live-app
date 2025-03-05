// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import { intervalTasks as allIntervalTasks } from '@ren/config/subscriptions/interval';
import { ReferendumRowWrapper, TitleWithOrigin } from './Wrappers';
import { renderOrigin } from '@app/utils/openGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@app/contexts/openGov/ReferendaSubscriptions';
import { useHelp } from '@app/contexts/common/Help';
import { useState } from 'react';
import { useTaskHandler } from '@app/contexts/openGov/TaskHandler';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
import { motion } from 'framer-motion';
import {
  faChevronDown,
  faChevronUp,
  faInfo,
  faMinus,
  faPlus,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import {
  ControlsWrapper,
  SortControlButton,
  TooltipRx,
} from '@polkadot-live/ui/components';
import { FlexRow } from '@polkadot-live/ui/styles';
import { ReferendumDropdownMenu } from '../DropdownMenu';
import type { PolkassemblyProposal } from '@polkadot-live/types/openGov';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({ referendum, index }: ReferendumRowProps) => {
  const { openHelp } = useHelp();

  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const isOnline = getOnlineMode();

  const { referendaId } = referendum;
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
  const proposalData = getProposal(chainId, referendaId);

  // Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);

  const getIntervalSubscriptions = () =>
    allIntervalTasks.filter((t) => t.chainId === chainId);

  const getProposalTitle = (data: PolkassemblyProposal) => {
    const { title } = data;
    return title === '' ? 'No Title' : title;
  };

  return (
    <ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={faHashtag} transform={'shrink-5'} />
          {referendum.referendaId}
        </div>
        {usePolkassemblyApi ? (
          <TitleWithOrigin>
            <h4>{proposalData ? getProposalTitle(proposalData) : ''}</h4>
            <h5>{renderOrigin(referendum)}</h5>
          </TitleWithOrigin>
        ) : (
          <h4 style={{ flex: 1 }}>{renderOrigin(referendum)}</h4>
        )}

        <div className="LinksWrapper">
          <ReferendumDropdownMenu
            chainId={chainId}
            proposalData={proposalData}
            referendum={referendum}
          />
        </div>

        {/* Add + Remove Subscriptions */}
        <div className="ControlsWrapper">
          <ControlsWrapper style={{ marginBottom: '0' }}>
            {!allSubscriptionsAdded(chainId, referendum) ? (
              <TooltipRx
                theme={theme}
                text={isOnline ? 'Subscribe All' : 'Currently Offline'}
              >
                <span>
                  <SortControlButton
                    isActive={true}
                    isDisabled={!isOnline}
                    faIcon={faPlus}
                    onClick={() =>
                      addAllIntervalSubscriptions(
                        getIntervalSubscriptions(),
                        referendum
                      )
                    }
                    fixedWidth={false}
                  />
                </span>
              </TooltipRx>
            ) : (
              <TooltipRx
                theme={theme}
                text={isOnline ? 'Unsubscribe All' : 'Currently Offline'}
              >
                <span>
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
                </span>
              </TooltipRx>
            )}
            {/* Expand Button */}
            <TooltipRx
              theme={theme}
              text={expanded ? 'Hide Subscriptions' : 'Show Subscriptions'}
            >
              <span>
                <SortControlButton
                  isActive={true}
                  isDisabled={false}
                  faIcon={expanded ? faChevronUp : faChevronDown}
                  onClick={() => setExpanded(!expanded)}
                  fixedWidth={false}
                />
              </span>
            </TooltipRx>
          </ControlsWrapper>
        </div>
      </FlexRow>
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
        <div className="ContentWrapper">
          <div className="SubscriptionGrid">
            {/* Render interval tasks from config */}
            {getIntervalSubscriptions().map((t) => (
              <div
                key={`${index}_${referendaId}_${t.action}`}
                className="SubscriptionRow"
              >
                {isSubscribedToTask(referendum, t) ? (
                  <TooltipRx
                    text={isOnline ? 'Unsubscribe' : 'Currently Offline'}
                    theme={theme}
                  >
                    <button
                      className={`${!isOnline && 'Disable'} BtnAdd`}
                      disabled={!isOnline}
                      onClick={() => removeIntervalSubscription(t, referendum)}
                    >
                      <FontAwesomeIcon icon={faMinus} transform={'shrink-4'} />
                    </button>
                  </TooltipRx>
                ) : (
                  <TooltipRx
                    text={isOnline ? 'Subscribe' : 'Currently Offline'}
                    theme={theme}
                  >
                    <button
                      className={`${!isOnline && 'Disable'} BtnAdd`}
                      disabled={!isOnline}
                      onClick={() => addIntervalSubscription(t, referendum)}
                    >
                      <FontAwesomeIcon icon={faPlus} transform={'shrink-2'} />
                    </button>
                  </TooltipRx>
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
