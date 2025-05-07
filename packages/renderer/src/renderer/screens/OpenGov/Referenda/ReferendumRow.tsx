// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { intervalTasks } from '@polkadot-live/consts/subscriptions/interval';
import {
  ReferendumRowWrapper,
  RefStatusBadge,
  TitleWithOrigin,
} from './Wrappers';
import { renderOrigin } from '@ren/utils/OpenGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useReferendaSubscriptions } from '@app/contexts/openGov/ReferendaSubscriptions';
import { useHelp } from '@app/contexts/common/Help';
import { useState } from 'react';
import { useTaskHandler } from '@app/contexts/openGov/TaskHandler';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
import { motion } from 'framer-motion';
import { TooltipRx } from '@polkadot-live/ui/components';
import { FlexRow } from '@polkadot-live/ui/styles';
import { ReferendumDropdownMenu } from '../Dropdowns';
import { RoundLeftButton, RoundRightButton } from '../Dropdowns/Wrappers';
import type { RefStatus } from '@polkadot-live/types/openGov';
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
  const { title } = proposalData || { title: '' };

  // Whether subscriptions are showing.
  const [expanded, setExpanded] = useState(false);

  const getIntervalSubscriptions = () =>
    intervalTasks
      .filter((t) => t.chainId === chainId)
      .filter((t) => {
        if ((['Preparing', 'Queueing'] as RefStatus[]).includes(refStatus)) {
          const actions = ['subscribe:interval:openGov:referendumVotes'];
          return actions.includes(t.action);
        } else {
          return true;
        }
      });

  return (
    <ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={FA.faHashtag} transform={'shrink-5'} />
          {refId}
        </div>
        {usePolkassemblyApi ? (
          <TitleWithOrigin>
            <h4>{title !== '' ? title : 'No Title'}</h4>
            <FlexRow>
              <RefStatusBadge $status={refStatus}>{refStatus}</RefStatusBadge>
              <h5 className="origin text-ellipsis">
                {renderOrigin(referendum)}
              </h5>
            </FlexRow>
          </TitleWithOrigin>
        ) : (
          <FlexRow style={{ width: '100%', minWidth: 0 }}>
            <div style={{ width: '76px', minWidth: '76px' }}>
              <RefStatusBadge
                style={{ width: 'fit-content' }}
                $status={refStatus}
              >
                {refStatus}
              </RefStatusBadge>
            </div>
            <h4 className="text-ellipsis">{renderOrigin(referendum)}</h4>
          </FlexRow>
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
                    <FontAwesomeIcon className="icon" icon={FA.faPlus} />
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
                    <FontAwesomeIcon className="icon" icon={FA.faMinus} />
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
                    icon={expanded ? FA.faChevronUp : FA.faChevronDown}
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
                      <FontAwesomeIcon
                        icon={FA.faMinus}
                        transform={'shrink-4'}
                      />
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
                      <FontAwesomeIcon
                        icon={FA.faPlus}
                        transform={'shrink-2'}
                      />
                    </button>
                  </TooltipRx>
                )}
                <p>{t.label}</p>
                <span onClick={() => openHelp(t.helpKey)}>
                  <FontAwesomeIcon icon={FA.faInfo} transform={'shrink-0'} />
                </span>
              </div>
            ))}
          </FlexRow>
        </div>
      </motion.section>
    </ReferendumRowWrapper>
  );
};
