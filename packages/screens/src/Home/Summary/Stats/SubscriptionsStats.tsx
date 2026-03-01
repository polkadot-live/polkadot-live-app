// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChain, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useAddresses,
  useChainEvents,
  useIntervalSubscriptions,
  useSubscriptions,
} from '@polkadot-live/contexts';
import { Identicon } from '@polkadot-live/ui';
import { useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { FlattenedAccountData } from '@polkadot-live/types';

export const SubscriptionsStats = () => {
  const { getAllAccounts } = useAddresses();
  const { getClassicSubCount } = useSubscriptions();
  const { getTotalIntervalSubscriptionCount } = useIntervalSubscriptions();
  const { accountSubCount, countActiveRefSubs, getEventSubscriptionCount } =
    useChainEvents();

  const [eventSubCount, setEventSubCount] = useState(0);
  const [smartSubCounts, setSmartSubCounts] = useState<Map<string, number>>(
    new Map(),
  );

  const accounts = getAllAccounts();

  const getSmartCount = (a: FlattenedAccountData) =>
    smartSubCounts.get(`${a.chain}::${a.address}`) ?? 0;

  const refCount = getTotalIntervalSubscriptionCount() + countActiveRefSubs();

  const [animated, setAnimated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setEventSubCount(await getEventSubscriptionCount());
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const map = new Map<string, number>();
      for (const a of accounts) {
        map.set(`${a.chain}::${a.address}`, await accountSubCount(a));
      }
      setSmartSubCounts(map);
    };
    fetch();
  }, []);

  return (
    <Wrapper>
      {/* Accounts section */}
      <PanelMiddle>
        <SectionTitle>Accounts</SectionTitle>
        {accounts.length === 0 ? (
          <EmptyText>No accounts enabled for subscriptions.</EmptyText>
        ) : (
          accounts.map((a, i) => (
            <StatRow key={`${a.chain}::${a.address}`}>
              <IconWrap>
                <Identicon value={a.address} fontSize="1.6rem" />
              </IconWrap>
              <span className="name">{a.name}</span>
              <CountBadge $color="#a78bda" $show={animated} $delay={i * 60}>
                {getClassicSubCount(a) + getSmartCount(a)}
              </CountBadge>
            </StatRow>
          ))
        )}
      </PanelMiddle>

      {/* Global section */}
      <PanelBottom>
        <SectionTitle>Global</SectionTitle>
        <StatRow>
          <IconWrap>
            <FontAwesomeIcon icon={faChain} color="#6ec4c4" />
          </IconWrap>
          <span className="name">Chain Events</span>
          <CountBadge
            $color="#6ec4c4"
            $show={animated}
            $delay={accounts.length * 60}
          >
            {eventSubCount}
          </CountBadge>
        </StatRow>

        <StatRow>
          <IconWrap>
            <FontAwesomeIcon icon={faComments} color="#7ab89e" />
          </IconWrap>
          <span className="name">OpenGov</span>
          <CountBadge
            $color="#7ab89e"
            $show={animated}
            $delay={(accounts.length + 1) * 60}
          >
            {refCount}
          </CountBadge>
        </StatRow>
      </PanelBottom>
    </Wrapper>
  );
};

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PanelBase = styled.div`
  background-color: var(--background-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.25rem;
`;

const PanelMiddle = styled(PanelBase)`
  border-radius: 0;
  border-top-right-radius: 0.375rem;
  border-top-left-radius: 0.375rem;
`;

const PanelBottom = styled(PanelBase)`
  border-radius: 0 0 0.375rem 0.375rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.86rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dimmed);
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin: 0;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  .name {
    flex: 1;
    min-width: 0;
    font-size: 1rem;
    color: var(--text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const popIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const CountBadge = styled.span<{
  $color: string;
  $show: boolean;
  $delay: number;
}>`
  font-size: 0.94rem;
  font-weight: normal;
  line-height: 1;
  min-width: 1.5rem;
  padding: 0.35rem 1rem;
  border-radius: 0.3rem;
  text-align: center;
  color: ${({ $color }) => $color};
  background-color: ${({ $color }) => `${$color}18`};
  opacity: 0;
  transform: scale(0.6);

  ${({ $show, $delay }) =>
    $show &&
    css`
      animation: ${popIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
        ${$delay}ms forwards;
    `}
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  font-size: 1.05rem;
  color: var(--text-color-secondary);
`;
