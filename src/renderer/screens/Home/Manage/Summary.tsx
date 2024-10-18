// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSideNav } from '@/renderer/library/contexts';
import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { AnyFunction } from '@/types/misc';

const MainHeading = styled.h1`
  color: rgb(211 48 121);
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

const SubHeading = styled.h2`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  h2 {
    font-size: 1.35rem;
    padding: 0 0.2rem;
  }
`;

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;

  .total-item {
    background-color: #292929 !important;
    h3,
    span {
      font-size: 1.26rem !important;
      color: #f1f1f1 !important;
    }
  }

  .btn {
    background-color: #953254;
    border: none;
    color: #f7f7f7;
    min-width: 8.5rem;
  }

  .header-wrapper {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0.35rem;
    transition: background-color 150ms ease-out;
    border-radius: 0.375rem;
    cursor: pointer;

    &:hover {
      background-color: #1a1919;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.25rem;

  div:nth-of-type(3n) {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
  div:nth-of-type(3n + 1) {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
`;

const StatItem = styled.div`
  background-color: #212121;
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  h3 {
    color: #d1d1d1;
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  span {
    color: #eaeef3;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const SummarySection = ({
  title,
  btnText,
  btnClickHandler,
  children,
}: {
  title: string;
  btnText: string;
  btnClickHandler: AnyFunction;
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLButtonElement)) {
      setIsCollapsed((pv) => !pv);
    }
  };

  return (
    <StatsSection>
      <div className="header-wrapper" onClick={handleClick}>
        <SubHeading>
          <FontAwesomeIcon
            style={{ minWidth: '1rem' }}
            icon={isCollapsed ? faCaretRight : faCaretDown}
            transform={'shrink-3'}
          />
          {title}
        </SubHeading>
        <ButtonMono
          className="btn"
          iconLeft={faCaretRight}
          text={btnText}
          onClick={btnClickHandler}
        />
      </div>

      <motion.div
        style={{ overflowY: 'hidden' }}
        variants={{
          open: { height: '100%' },
          close: { height: 0 },
        }}
        animate={isCollapsed ? 'close' : 'open'}
        transition={{
          ease: 'easeOut',
          duration: 0.12,
        }}
      >
        {children}
      </motion.div>
    </StatsSection>
  );
};

export const Summary: React.FC = () => {
  const { setSelectedId } = useSideNav();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
        padding: '2rem 1rem',
      }}
    >
      {/* Title */}
      <section>
        <MainHeading>Summary</MainHeading>
      </section>
      {/* Accounts */}
      <SummarySection
        title="Accounts"
        btnText="Accounts"
        btnClickHandler={() => {
          window.myAPI.openWindow('import');
          window.myAPI.umamiEvent('window-open-accounts', null);
        }}
      >
        <StatsGrid>
          <StatItem className="total-item">
            <h3>Total</h3>
            <span>8</span>
          </StatItem>
          <StatItem>
            <h3>Vault</h3>
            <span>8</span>
          </StatItem>
          <StatItem>
            <h3>Ledger</h3>
            <span>1</span>
          </StatItem>
          <StatItem>
            <h3>Read-Only</h3>
            <span>3</span>
          </StatItem>
        </StatsGrid>
      </SummarySection>

      {/* Events */}
      <SummarySection
        title="Events"
        btnText="Events"
        btnClickHandler={() => {
          setSelectedId(1);
        }}
      >
        <StatsGrid>
          <StatItem className="total-item">
            <h3>Total</h3>
            <span>20</span>
          </StatItem>
          <StatItem>
            <h3>Balances</h3>
            <span>7</span>
          </StatItem>
          <StatItem>
            <h3>Nominating</h3>
            <span>9</span>
          </StatItem>
          <StatItem>
            <h3>Pools</h3>
            <span>4</span>
          </StatItem>
        </StatsGrid>
      </SummarySection>

      {/* Subscriptions */}
      <SummarySection
        title="Subscriptions"
        btnText="Subscribe"
        btnClickHandler={() => {
          setSelectedId(2);
        }}
      >
        <StatsGrid>
          <StatItem className="total-item">
            <h3>Total</h3>
            <span>16</span>
          </StatItem>
          <StatItem>
            <h3>Ledger 1</h3>
            <span>3</span>
          </StatItem>
          <StatItem>
            <h3>Main Account</h3>
            <span>5</span>
          </StatItem>
          <StatItem>
            <h3>Referenda</h3>
            <span>8</span>
          </StatItem>
        </StatsGrid>
      </SummarySection>
    </div>
  );
};
