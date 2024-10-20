// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const MainHeading = styled.h1`
  color: rgb(211 48 121);
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

export const SubHeading = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #b8b3b9;
  h2 {
    font-size: 1.3rem;
    padding: 0 0.2rem;
    user-select: none;
  }
  svg {
    min-width: 90px;
  }
`;

export const StatsGrid = styled.div`
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

export const StatsSectionWrapper = styled.div`
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

export const StatItem = styled.div`
  background-color: #212121;
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  > div:first-of-type {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    > h3 {
      flex: 1;
    }
    .help {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.6rem;
      height: 1.5rem;
      font-size: 0.85rem;
      border-radius: 0.275rem;
      transition: background-color 150ms ease-out;
      cursor: pointer;
      &:hover {
        background-color: #191919;
      }
    }
  }

  h3 {
    color: #d1d1d1;
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    color: #eaeef3;
    font-size: 1.2rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;
