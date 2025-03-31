// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faAngleDown,
  faAngleUp,
  faCircle,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useChains } from '@app/contexts/main/Chains';
import { useConnections } from '@app/contexts/common/Connections';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { useState } from 'react';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { FooterWrapper, NetworkItem } from './Wrapper';
import { getIcon } from '@app/Utils';
import { SelectRpc } from './RpcSelect';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { ChainID, ChainStatus } from '@polkadot-live/types/chains';

export const Footer = () => {
  const { appLoading, isConnecting, isAborting } = useBootstrapping();
  const { chains } = useChains();
  const { getOnlineMode } = useConnections();
  const { chainHasIntervalSubscriptions } = useIntervalSubscriptions();
  const { chainHasSubscriptions } = useSubscriptions();

  const [expanded, setExpanded] = useState<boolean>(false);

  const connectionsCount = () =>
    Array.from(chains.values()).filter(({ status }) => status === 'connected')
      .length;

  /// Get header text.
  const getHeadingText = () =>
    getOnlineMode() && !isConnecting && !isAborting
      ? `Connected to ${connectionsCount()} network${connectionsCount() === 1 ? '' : 's'}`
      : 'Offline';

  /// Method to determine whether an API can be disconnected.
  const allowDisconnect = (chainId: ChainID, status: ChainStatus) =>
    appLoading || status === 'disconnected'
      ? false
      : !chainHasSubscriptions(chainId) &&
        !chainHasIntervalSubscriptions(chainId);

  return (
    <FooterWrapper className={expanded ? 'expanded' : undefined}>
      <section className="status">
        {connectionsCount() ? (
          <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
        ) : (
          <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
        )}

        <div>
          <h5>{getHeadingText()}</h5>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon
            icon={expanded ? faAngleDown : faAngleUp}
            transform="grow-0"
          />
        </button>
      </section>
      {/* Networks list */}
      <section className="network-list-wrapper">
        {expanded &&
          [...chains.entries()].map(([chainId, apiData]) => (
            <NetworkItem key={`${chainId}_network`}>
              <div className="left">
                {getIcon(apiData.chainId, 'icon')}
                <h4>{apiData.chainId}</h4>
              </div>
              <div className="right">
                <FlexRow $gap={'1.5rem'}>
                  {/* RPC select box */}
                  <SelectRpc apiData={apiData} />
                  {/* Disconnect button */}
                  <div className="disconnect">
                    <button
                      disabled={!allowDisconnect(chainId, apiData.status)}
                    >
                      <FontAwesomeIcon
                        icon={faCircleXmark}
                        transform={'grow-2'}
                      />
                    </button>
                  </div>
                </FlexRow>
              </div>
            </NetworkItem>
          ))}
      </section>
    </FooterWrapper>
  );
};
