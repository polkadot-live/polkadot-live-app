// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/**
 * @name ControlsWrapper
 * @summary Wrapper styles for sorting control components.
 */
export const ControlsWrapper = styled.div<{
  $padWrapper?: boolean;
  $padBottom?: boolean;
  $sticky?: boolean;
}>`
  padding: ${(props) => {
    if (props.$sticky) {
      return '1.25rem 1.5rem 1.25rem';
    } else {
      return props.$padWrapper
        ? props.$padBottom
          ? '2rem 1.5rem 1rem'
          : '2rem 1.5rem 0'
        : '0';
    }
  }};

  z-index: ${(props) => (props.$sticky ? '4' : 'inherit')};
  background-color: ${(props) =>
    props.$sticky ? 'var(--background-modal)' : 'inherit'};

  top: 0;
  position: ${(props) => (props.$sticky ? 'sticky' : 'inherit')};

  width: 100%;
  display: flex;
  column-gap: 1rem;
  margin-bottom: 0.75rem;

  .no-border {
    border: none !important;
  }

  // Left and right.
  .right,
  .left {
    display: flex;
    align-items: center;
    column-gap: 1rem;
  }
  .left {
    flex: 1;
  }

  .back-btn {
    max-height: 23.52px;
    align-self: center;
    font-size: 0.9rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    border-color: #a94a75;
    color: #a94a75;
  }

  .breadcrumb-wrapper {
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem;
    border: 1px solid #454545;
    border-radius: 1.25rem;

    span {
      display: inline-block;
      text-align: center;
      display: inline-block;
      color: #666666;
      font-size: 0.9rem;
      cursor: default;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon {
      margin-left: 0.7rem;
      color: #ededed;
    }
  }

  .icon-wrapper {
    opacity: 0.75;
    display: flex;
    column-gap: 0.75rem;
    align-items: center;
    min-width: auto;

    position: relative;
    border: 1px solid #535353;
    border-radius: 1.25rem;

    margin: 0;
    padding: 0.3rem 0.5rem;
    transition: border 0.1s ease-out;
    user-select: none;
    transition: opacity 0.1s ease-out;
    cursor: pointer;

    &.fixed {
      min-width: 120px !important;
    }
    &.icon-only {
      .icon {
        margin-left: 1rem !important;
      }
    }
    span {
      display: inline-block;
      padding-right: 1rem;
      color: #666666;
      font-size: 0.9rem;
    }
    .icon {
      color: #5f5f5f;
      margin-left: 0.7rem;
    }
    &:hover {
      opacity: 0.9;
    }
    // Button is active.
    &.active {
      border-color: #454545;
      background-color: #3a3a3a;
      transition: opacity 0.1s ease-out;
      .icon,
      span {
        color: #ededed;
      }
      &:hover {
        background-color: #3a3a3a;
      }
    }
    &.disable {
      opacity: 0.4;
    }
  }

  /* Select */
  .select-wrapper {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;

    border: 1px solid var(--border-secondary-color);
    border-radius: 1.25rem;
    padding: 0.35rem 1.5rem;
    cursor: pointer;

    select {
      font-size: 1rem;
      background-color: inherit;
      color: #929292;
      opacity: 0.8;
      border: none;
      cursor: pointer;
    }
  }
`;
