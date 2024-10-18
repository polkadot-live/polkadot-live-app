// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const MainHeading = styled.h1`
  color: rgb(211 48 121);
  font-size: 1.75rem;
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

export const Summary: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const temp = 'temp';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '2rem',
        padding: '2rem 1rem',
      }}
    >
      {/* Title */}
      <section>
        <MainHeading>Summary</MainHeading>
      </section>
      {/* Accounts */}
      <StatsSection>
        <div className="header-wrapper">
          <SubHeading>
            <FontAwesomeIcon icon={faCaretDown} transform={'shrink-3'} />
            Accounts
          </SubHeading>
          <ButtonMono
            className="btn"
            iconLeft={faCaretRight}
            text={'Accounts'}
          />
        </div>
        <StatsGrid>
          <StatItem
            className="total-item"
            style={{ borderTopLeftRadius: '0.375rem' }}
          >
            <h3>Total</h3>
            <span>8</span>
          </StatItem>
          <StatItem>
            <h3>Vault</h3>
            <span>8</span>
          </StatItem>
          <StatItem style={{ borderTopRightRadius: '0.375rem' }}>
            <h3>Ledger</h3>
            <span>1</span>
          </StatItem>
          <StatItem style={{ borderBottomLeftRadius: '0.375rem' }}>
            <h3>Read-Only</h3>
            <span>3</span>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      {/* Events */}
      <StatsSection>
        <div className="header-wrapper">
          <SubHeading>
            <FontAwesomeIcon icon={faCaretDown} transform={'shrink-3'} />
            Events
          </SubHeading>
          <ButtonMono className="btn" iconLeft={faCaretRight} text={'Events'} />
        </div>
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
      </StatsSection>

      {/* Subscriptions */}
      <StatsSection>
        <div className="header-wrapper">
          <SubHeading>
            <FontAwesomeIcon icon={faCaretDown} transform={'shrink-3'} />
            Subscriptions
          </SubHeading>
          <ButtonMono
            className="btn"
            iconLeft={faCaretRight}
            text={'Subscribe'}
          />
        </div>
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
      </StatsSection>
    </div>
  );
};
