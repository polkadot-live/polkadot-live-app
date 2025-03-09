// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import { intervalTasks as allIntervalTasks } from '@ren/config/subscriptions/interval';
import {
  ReferendumRowWrapper,
  RefStatusBadge,
  TitleWithOrigin,
} from './Wrappers';
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
import { TooltipRx } from '@polkadot-live/ui/components';
import { FlexRow, ResponsiveRow } from '@polkadot-live/ui/styles';
import { ReferendumDropdownMenu } from '../DropdownMenu';
import { RoundLeftButton, RoundRightButton } from '../DropdownMenu/Wrappers';
import type {
  PolkassemblyProposal,
  RefStatus,
} from '@polkadot-live/types/openGov';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({ referendum, index }: ReferendumRowProps) => {
  const { openHelp } = useHelp();

  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const isOnline = getOnlineMode();

  const { refId, refStatus } = referendum;
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
  const proposalData = getProposal(chainId, refId);

  // Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);

  const getIntervalSubscriptions = () =>
    allIntervalTasks
      .filter((t) => t.chainId === chainId)
      .filter((t) => {
        if ((['Preparing', 'Queueing'] as RefStatus[]).includes(refStatus)) {
          const actions = ['subscribe:interval:openGov:referendumVotes'];
          return actions.includes(t.action);
        } else {
          return true;
        }
      });

  const getProposalTitle = (data: PolkassemblyProposal) => {
    const { title } = data;
    return title === '' ? 'No Title' : title;
  };

  return (
    <ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={faHashtag} transform={'shrink-5'} />
          {refId}
        </div>
        {usePolkassemblyApi ? (
          <TitleWithOrigin>
            <h4>{proposalData ? getProposalTitle(proposalData) : ''}</h4>
            <FlexRow>
              <RefStatusBadge $status={refStatus}>{refStatus}</RefStatusBadge>
              <h5 className="origin text-ellipsis">
                {renderOrigin(referendum)}
              </h5>
            </FlexRow>
          </TitleWithOrigin>
        ) : (
          <ResponsiveRow
            $smWidth={'500px'}
            $gap={'1.25rem'}
            $smGap={'0.5rem'}
            style={{ flex: 1 }}
          >
            <h4 className="text-ellipsis">{renderOrigin(referendum)}</h4>
            <RefStatusBadge
              style={{ width: 'fit-content' }}
              $status={refStatus}
            >
              {refStatus}
            </RefStatusBadge>
          </ResponsiveRow>
        )}

        <FlexRow $gap={'0.75rem'}>
          <FlexRow $gap={'2px'}>
            {!allSubscriptionsAdded(chainId, referendum) ? (
              <TooltipRx
                theme={theme}
                text={isOnline ? 'Subscribe All' : 'Currently Offline'}
              >
                <span>
                  <RoundLeftButton
                    $dark={darkMode}
                    disabled={!isOnline}
                    onClick={() =>
                      addAllIntervalSubscriptions(
                        getIntervalSubscriptions(),
                        referendum
                      )
                    }
                  >
                    <FontAwesomeIcon className="icon" icon={faPlus} />
                  </RoundLeftButton>
                </span>
              </TooltipRx>
            ) : (
              <TooltipRx
                theme={theme}
                text={isOnline ? 'Unsubscribe All' : 'Currently Offline'}
              >
                <span>
                  <RoundLeftButton
                    $dark={darkMode}
                    onClick={() =>
                      removeAllIntervalSubscriptions(
                        getIntervalSubscriptions(),
                        referendum
                      )
                    }
                  >
                    <FontAwesomeIcon className="icon" icon={faMinus} />
                  </RoundLeftButton>
                </span>
              </TooltipRx>
            )}
            {/* Expand Button */}
            <TooltipRx
              theme={theme}
              text={expanded ? 'Hide Subscriptions' : 'Show Subscriptions'}
            >
              <span>
                <RoundRightButton
                  $dark={darkMode}
                  onClick={() => setExpanded(!expanded)}
                >
                  <FontAwesomeIcon
                    className="icon"
                    icon={expanded ? faChevronUp : faChevronDown}
                  />
                </RoundRightButton>
              </span>
            </TooltipRx>
          </FlexRow>

          <ReferendumDropdownMenu
            chainId={chainId}
            proposalData={proposalData}
            referendum={referendum}
          />
        </FlexRow>
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
          <FlexRow className="SubscriptionGrid">
            {/* Render interval tasks from config */}
            {getIntervalSubscriptions().map((t) => (
              <div
                key={`${index}_${refId}_${t.action}`}
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
          </FlexRow>
        </div>
      </motion.section>
    </ReferendumRowWrapper>
  );
};
