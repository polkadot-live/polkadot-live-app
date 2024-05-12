// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faAngleDown,
  faAngleUp,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChains } from '@app/contexts/Chains';
import { useBootstrapping } from '@/renderer/contexts/Bootstrapping';
import { useState } from 'react';
import { FooterWrapper, NetworkItem } from './Wrapper';
import { getIcon } from '@/renderer/Utils';
import { SelectRpc } from './RpcSelect';

export const Footer = () => {
  const { chains } = useChains();
  const { online: isOnline } = useBootstrapping();

  const [expanded, setExpanded] = useState<boolean>(false);

  /// Calculate total active connections.
  const totalActiveConnections = () =>
    Array.from(chains.values()).filter(
      (apiData) => apiData.status === 'connected'
    ).length;

  /// Get header text.
  const getHeadingText = () =>
    isOnline
      ? `Connected to ${totalActiveConnections()} network${chains.size === 1 ? '' : 's'}`
      : 'Offline';

  return (
    <FooterWrapper className={expanded ? 'expanded' : undefined}>
      <section className="status">
        {totalActiveConnections() ? (
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
                {/* RPC select box */}
                <SelectRpc apiData={apiData} />
              </div>
            </NetworkItem>
          ))}
      </section>
    </FooterWrapper>
  );
};
