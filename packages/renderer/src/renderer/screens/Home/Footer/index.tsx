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
import { useChains } from '@app/contexts/main/Chains';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useConnections } from '@app/contexts/common/Connections';
import { useState } from 'react';
import { FooterWrapper, NetworkItem } from './Wrapper';
import { getIcon } from '@app/Utils';
import { SelectRpc } from './RpcSelect';
import { FlexRow } from '@polkadot-live/ui/styles';

export const Footer = () => {
  const { chains } = useChains();
  const { isConnecting, isAborting } = useBootstrapping();
  const { getOnlineMode } = useConnections();

  const [expanded, setExpanded] = useState<boolean>(false);

  const connectionsCount = () =>
    Array.from(chains.values()).filter(({ status }) => status === 'connected')
      .length;

  /// Get header text.
  const getHeadingText = () =>
    getOnlineMode() && !isConnecting && !isAborting
      ? `Connected to ${connectionsCount()} network${connectionsCount() === 1 ? '' : 's'}`
      : 'Offline';

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
                    <FontAwesomeIcon
                      icon={faCircleXmark}
                      transform={'grow-2'}
                    />
                  </div>
                </FlexRow>
              </div>
            </NetworkItem>
          ))}
      </section>
    </FooterWrapper>
  );
};
