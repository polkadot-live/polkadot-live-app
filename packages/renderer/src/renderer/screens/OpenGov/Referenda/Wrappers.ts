// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '@polkadot-live/ui/components';

export const TitleWithOrigin = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
  min-width: 0; // Allows address overflow

  > h4 {
    color: var(--text-color-primary);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.1rem !important;
  }
  > h5 {
    color: var(--text-color-secondary);
    margin: 0;
    font-size: 1rem !important;
  }
`;

export const MoreOverlay = styled.div`
  background-color: var(--background-surface);
  border: 1px solid var(--border-primary-color);

  width: 100%;
  padding: 1rem 1rem;
  z-index: 20;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 1.5rem;

    h1 {
      font-size: 1.25rem;
      text-align: center;
    }

    .outer-wrapper {
      background-color: var(--background-window);
      padding: 0.75rem;
      max-width: 100%;

      .description {
        padding: 1rem;
        white-space: pre-wrap;
        position: relative;
        max-height: 240px;
        overflow-y: auto;
        overflow-x: hidden;
        font-size: 1.05rem;
        line-height: 1.6rem;

        &::-webkit-scrollbar {
          width: 5px;
        }
        &::-webkit-scrollbar-track {
          background-color: var(--scrollbar-track-background-color);
        }
        &::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-thumb-background-color);
        }
      }
    }
  }
`;

export const NoteWrapper = styled.div`
  background-color: var(--background-primary);
  border: 1px solid var(--border-mid-color);
  border-color: #4a4a29;
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;

  span {
    font-weight: 600;
    color: #9e9e3e;
  }
  p {
    margin: 0;
    color: var(--text-color-secondary);
  }
`;

export const ReferendumRowWrapper = styled.div`
  position: relative;
  padding: 1rem 1.25rem;
  background-color: var(--background-primary);

  /* Stats */
  .RefID {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    column-gap: 0.4rem;
    border-radius: 0.375rem;
    margin-right: 1.5rem;
  }

  /* Collapsable Section */
  .collapse {
    overflow: hidden;
    width: 100%;

    .ContentWrapper {
      width: 100%;
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      row-gap: 0.25rem;

      .SubscriptionGrid {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;

        div {
          justify-content: center;
        }
        // Keep for tweaking later.
        div:nth-child(3n + 2) {
          justify-content: center;
        }
        div:nth-child(3n + 3) {
          justify-content: center;
        }

        .SubscriptionRow {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;

          p {
            color: var(--text-color-primary);
            font-size: 1.05rem;
            font-weight: 600;
            margin: 0;
          }
          span {
            ${mixinHelpIcon}
            color: var(--text-dimmed);
            font-size: 0.9rem;
            transition: color 150ms ease-out;
            margin-left: -0.25rem;
            margin-bottom: 0.15rem;
            &:hover {
              color: var(--text-highlight) !important;
            }
          }
        }
      }
    }

    @media (max-width: 550px) {
      .ContentWrapper {
        .SubscriptionGrid {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }
    }
  }

  .icon-wrapper {
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0.4;
  }

  /* Add Subscription Button */
  .BtnAdd {
    color: var(--text-dimmed);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    transition: color 0.15s ease-out;
    cursor: pointer;

    svg,
    span {
      font-size: 1.3rem;
    }
    &:hover {
      color: var(--text-highlight);
    }
    &.Disable {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.Disable:hover {
      color: var(--text-dimmed);
    }

    @media (max-width: 550px) {
      padding: 0.25rem 0.75rem !important;
    }
  }
`;

export const TracksFilterList = styled.div`
  background-color: var(--background-surface);
  padding: 1.75rem 1.5rem 1.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 2.25rem;
  overflow-x: auto;
  white-space: nowrap;

  .container {
    user-select: none;
    > p {
      margin: 0;
      font-size: 1.08rem;
      color: var(--text-color-secondary);
      font-weight: bolder;
      transition: color 0.2s ease-out;
      cursor: pointer;

      &.selected {
        color: var(--accent-secondary);
        font-weight: 600;
      }

      &.disable {
        cursor: not-allowed;
      }
    }
    > span {
      color: var(--text-dimmed);
      font-size: 1rem;
    }

    &:hover {
      > p:not(.selected):not(.disable) {
        color: var(--text-color-primary);
      }
    }
  }

  // Scrollbar
  scrollbar-color: inherit transparent;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: var(--background-surface);
    border-radius: 0.375rem;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb-background-color);
    &:hover {
      background-color: var(--scrollbar-thumb-background-color-hover);
    }
  }
`;
