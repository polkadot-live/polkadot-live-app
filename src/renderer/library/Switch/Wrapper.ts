// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const Wrapper = styled.span`
  .base-inputs-switch-checkbox {
    height: 0;
    width: 0;
    visibility: hidden;
  }

  .base-inputs-switch-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 100rem;
    position: relative;
    transition: background-color 0.2s;
    width: 4rem;
    height: 2rem;

    &.is-disabled {
      transition:
        opacity 0.15s,
        color 0.15s;

      &:disabled {
        opacity: 0.3;
        cursor: default;
      }
    }

    &.is-enabled {
      cursor: pointer;
    }

    &.sm {
      width: 3rem;
      height: 1.5rem;
    }

    &.lg {
      width: 4.5rem;
      height: 2.25rem;
    }

    &.xl {
      width: 6rem;
      height: 3rem;
    }
  }

  .base-inputs-switch-label .base-inputs-switch-button {
    content: '';
    position: absolute;
    border-radius: 100rem;
    transition: 0.3s;
    box-shadow: 0 0 0.25rem 0 rgb(10 10 10 / 29%);
    top: 0.1rem;
    left: 0.2rem;
    width: 1.6rem;
    height: 1.6rem;

    &.is-disabled {
      transition:
        opacity 0.15s,
        color 0.15s;

      &:disabled {
        opacity: 0.3;
        cursor: default;
      }
    }

    &.sm {
      top: 0.1rem;
      left: 0.2rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    &.lg {
      top: 0.12rem;
      left: 0.1rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    &.xl {
      top: 0.2rem;
      left: 0.3rem;
      width: 2.4rem;
      height: 2.4rem;
    }
  }

  .base-inputs-switch-checkbox:checked + .base-inputs-switch-button {
    left: calc(100% - 0.05rem);
    transform: translateX(-100%);
  }

  .base-inputs-switch-label:active .base-inputs-switch-button {
    &.is-enabled {
      width: 1.5rem;
    }

    &.is-disabled {
      width: 1.2rem;
    }
  }
`;
