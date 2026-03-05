// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBell, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChainPallets } from '@polkadot-live/consts/subscriptions/chainEvents';
import { useChainEvents } from '@polkadot-live/contexts';
import { FlexColumn } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { useEffect, useState } from 'react';
import {
  getNetworkColor,
  NetworkCard,
  NetworkCardContent,
  NetworkCardHeader,
  NetworkChevron,
  NetworkIconCircle,
  NetworkName,
  NetworkStatsRow,
  SubCountBadge,
} from './Wrappers';
import type { ActiveSubCounts } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NetworksProps } from './types';

export const Networks = ({
  setActiveChain,
  setBreadcrumb,
  setSection,
  visible,
}: NetworksProps) => {
  const { fetchNetworkStats } = useChainEvents();

  const [stats, setStats] = useState<Record<string, ActiveSubCounts>>({});

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    fetchNetworkStats().then((result) => {
      if (!cancelled) {
        setStats(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const onChainClick = (chainId: ChainID) => {
    setActiveChain(chainId);
    setBreadcrumb(chainId);
    setSection(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <UI.ScreenInfoCard>
        <div>Select a network to manage its subscriptions.</div>
      </UI.ScreenInfoCard>

      <FlexColumn $rowGap="0.6rem" style={{ marginTop: '0.75rem' }}>
        {(Object.keys(ChainPallets) as ChainID[]).map((cid) => {
          const color = getNetworkColor(cid);
          const { active = 0, osNotify = 0 } = stats[cid] ?? {};

          return (
            <NetworkCard
              $accentColor={color}
              key={`${cid}-chain-events`}
              onClick={() => onChainClick(cid)}
            >
              <NetworkIconCircle $color={color}>
                <UI.ChainIcon chainId={cid} width={20} />
              </NetworkIconCircle>

              <NetworkCardContent>
                <NetworkCardHeader>
                  <NetworkName>{cid}</NetworkName>
                </NetworkCardHeader>

                <NetworkStatsRow $color={color} $inactive={active === 0}>
                  <span className="stat-pill">
                    Active <span className="stat-value">{active}</span>
                  </span>
                  <span className="stat-pill">
                    <FontAwesomeIcon icon={faBell} />{' '}
                    <span className="stat-value">{osNotify}</span>
                  </span>
                </NetworkStatsRow>
              </NetworkCardContent>

              {active > 0 && (
                <SubCountBadge $color={color} $active={true}>
                  {active}
                </SubCountBadge>
              )}

              <NetworkChevron>
                <FontAwesomeIcon icon={faChevronRight} />
              </NetworkChevron>
            </NetworkCard>
          );
        })}
      </FlexColumn>
    </div>
  );
};
