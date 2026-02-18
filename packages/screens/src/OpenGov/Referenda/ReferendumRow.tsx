// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useConnections,
  usePolkassembly,
  useReferenda,
  useReferendaSubscriptions,
  useTaskHandler,
} from '@polkadot-live/contexts';
import { renderOrigin } from '@polkadot-live/core';
import { FlexRow, MenuButton } from '@polkadot-live/styles';
import { TooltipRx } from '@polkadot-live/ui';
import { ReferendumDropdownMenu } from '../Dropdowns';
import { Loader } from './Loader';
import {
  ReferendumRowWrapper,
  RefStatusBadge,
  TitleWithOrigin,
} from './Wrappers';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({ referendum }: ReferendumRowProps) => {
  const { activeReferendaChainId: chainId } = useReferenda();
  const { cacheGet, getOnlineMode, getTheme } = useConnections();
  const { getProposal, usePolkassemblyApi } = usePolkassembly();
  const { isAdded } = useReferendaSubscriptions();
  const { addSubscriptions, removeSubscriptions } = useTaskHandler();

  const { refId, refStatus } = referendum;
  const darkMode = cacheGet('mode:dark');
  const refAdded = isAdded(referendum, chainId);
  const isOnline = getOnlineMode();
  const proposalMeta = getProposal(chainId, refId);
  const theme = getTheme();

  return (
    <ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={FA.faHashtag} transform={'shrink-5'} />
          {refId}
        </div>
        {usePolkassemblyApi ? (
          <TitleWithOrigin>
            <div style={{ minHeight: '22px' }}>
              {proposalMeta ? (
                <h4 style={{ width: '100%' }} className="text-ellipsis">
                  {proposalMeta.title}
                </h4>
              ) : (
                <Loader theme={theme} />
              )}
            </div>
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
            <h4 style={{ fontSize: '1.1rem' }} className="text-ellipsis">
              {renderOrigin(referendum)}
            </h4>
          </FlexRow>
        )}

        <FlexRow>
          <FlexRow $gap={'2px'}>
            <TooltipRx
              theme={theme}
              text={`${refAdded ? 'Add' : 'Remove'} Subscriptions`}
            >
              <span>
                <MenuButton
                  $dark={darkMode}
                  disabled={!isOnline}
                  onClick={() =>
                    !refAdded
                      ? addSubscriptions(chainId, referendum)
                      : removeSubscriptions(chainId, referendum)
                  }
                >
                  <FontAwesomeIcon
                    className="icon"
                    icon={!refAdded ? FA.faPlus : FA.faMinus}
                    transform={'shrink-1'}
                  />
                </MenuButton>
              </span>
            </TooltipRx>
          </FlexRow>
          <ReferendumDropdownMenu chainId={chainId} referendum={referendum} />
        </FlexRow>
      </FlexRow>
    </ReferendumRowWrapper>
  );
};
