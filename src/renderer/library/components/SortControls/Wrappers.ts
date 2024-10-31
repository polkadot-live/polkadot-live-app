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
    props.$sticky ? 'var(--sort-button-background)' : 'inherit'};

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
    border-color: var(--accent-secondary);
    color: var(--accent-secondary);
    max-height: 23.52px;
    align-self: center;
    font-size: 0.9rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .breadcrumb-wrapper {
    border: 1px solid var(--text-dimmed);
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem;
    border-radius: 1.25rem;

    span {
      color: var(--text-dimmed);
      display: inline-block;
      font-size: 0.9rem;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: default;
    }
    .icon {
      color: var(--text-dimmed);
      margin-left: 0.7rem;
    }
  }

  .icon-wrapper {
    border: 1px solid var(--border-secondary-color);
    position: relative;

    border-radius: 1.25rem;
    opacity: 0.75;
    display: flex;
    column-gap: 0.75rem;
    align-items: center;
    min-width: auto;

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
      color: var(--text-color-secondary);
      display: inline-block;
      padding-right: 1rem;
      font-size: 0.9rem;
    }
    .icon {
      color: var(--text-color-secondary);
      margin-left: 0.7rem;
    }
    &:hover {
      opacity: 0.9;
    }
    // Button is active.
    &.active {
      border-color: var(--sort-button-background);
      background-color: var(--sort-button-background);
      transition: opacity 0.1s ease-out;
      .icon,
      span {
        color: var(--sort-button-text);
      }
      &:hover {
        background-color: var(--sort-button-background-hover);
      }
    }
    &.disable {
      opacity: 0.4;
    }
  }

  /* Select */
  .select-wrapper {
    border: 1px solid var(--border-secondary-color);
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    border-radius: 1.25rem;
    padding: 0.35rem 1.5rem;
    cursor: pointer;

    select {
      color: var(--text-color-secondary);
      background-color: inherit;
      font-size: 1rem;
      border: none;
      cursor: pointer;
    }
  }
`;
