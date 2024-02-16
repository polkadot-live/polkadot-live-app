// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faAngleDown,
  faAngleUp,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChains } from '@app/contexts/Chains';
import { useState } from 'react';
import PolkadotIcon from '../../svg/polkadotIcon.svg?react';
import WestendIcon from '../../svg/westendIcon.svg?react';
import KusamaIcon from '../../svg/kusamaIcon.svg?react';
import { FooterWrapper, NetworkItem } from './Wrapper';
import type { ChainID } from '@/types/chains';
export const Footer = () => {
  const { chains } = useChains();

  const [expanded, setExpanded] = useState<boolean>(false);

  const totalActiveConnections = () =>
    Array.from(chains.values()).filter(
      (apiData) => apiData.status === 'connected'
    ).length;

  const getIcon = (chainId: ChainID) => {
    switch (chainId) {
      case 'Polkadot':
        return <PolkadotIcon className="icon" />;
      case 'Westend':
        return <WestendIcon className="icon" />;
      case 'Kusama':
        return <KusamaIcon className="icon" />;
    }
  };

  return (
    <FooterWrapper className={expanded ? 'expanded' : undefined}>
      <section className="status">
        {totalActiveConnections() ? (
          <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
        ) : (
          <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
        )}

        <div>
          <h5>
            {chains.size
              ? `Connected to ${totalActiveConnections()} network${
                  chains.size === 1 ? '' : 's'
                }`
              : 'Disconnected'}{' '}
          </h5>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon
            icon={expanded ? faAngleDown : faAngleUp}
            transform="grow-0"
          />
        </button>
      </section>
      {expanded &&
        [...chains.entries()].map(([key, apiData]) => (
          <NetworkItem key={key}>
            {getIcon(apiData.chainId)}
            <h4>{apiData.chainId}</h4>
            <div
              className={apiData.status === 'connected' ? 'success' : 'danger'}
            ></div>
            <label>{apiData.endpoint}</label>
          </NetworkItem>
        ))}
    </FooterWrapper>
  );
};
