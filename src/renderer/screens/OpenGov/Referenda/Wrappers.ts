// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

/**
 * Provides the following styled components:
 *   TitleWithOrigin
 *   MoreOverlay
 *   NoteWrapper
 *   ReferendaGroup
 *   ReferendumRowWrapper
 */

const mixinRowButton = css`
  font-size: 1.3rem;
  padding: 0.4rem 1rem;
  transition: color 150ms ease-out;
  cursor: pointer;
`;

export const TitleWithOrigin = styled.div`
  display: flex;
  flex-direction: column;

  h4 {
    min-width: 18px;
  }
  div:nth-of-type(1) {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;

    p {
      margin: 0;
      font-size: 1rem;
    }
  }
`;

export const MoreOverlay = styled.div`
  width: 100%;
  padding: 1rem 1rem;
  border: 1px solid var(--border-primary-color);
  background-color: var(--background-default);
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
      --border-style: 1px solid #1f1f1f;
      border-top: var(--border-style);
      border-bottom: var(--border-style);

      background-color: #111;
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
          background-color: #101010;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #212121;
        }
      }
    }
  }
`;

export const NoteWrapper = styled.div`
  padding: 0.75rem 1.5rem;
  margin: 2rem 0 1rem;
  background-color: var(--background-primary);
  border: 1px solid var(--border-mid-color);
  border-color: #4a4a29;
  border-radius: 1.25rem;

  .note-wrapper {
    display: flex;
    column-gap: 0.75rem;
    align-items: center;

    span {
      font-weight: 600;
      color: #9e9e3e;
    }
    p {
      margin: 0;
      color: var(--text-color-secondary);
    }
  }
`;

export const StickyHeadings = styled.div`
  background-color: var(--background-modal);
  position: sticky;
  top: -1.55rem;
  z-index: 15;

  .content-wrapper {
    display: flex;
    column-gap: 1rem;
    align-items: center;

    div {
      padding: 0.4rem 0 0.4rem;
    }
    .left {
      flex: 1;
      display: flex;
      align-items: center;
      column-gap: 1rem;

      div:nth-child(1) {
        min-width: 70px;
        padding-left: 20px;
      }
      div:nth-child(2) {
        min-width: 40px;
      }
    }

    .right {
      justify-content: start;
      display: flex;
      align-items: center;
      column-gap: 1rem;

      div:nth-child(1) {
        min-width: 154px;
      }
      div:nth-child(2) {
        padding-right: 22px;
        text-align: right;
        min-width: 152px;
      }
    }
  }

  .heading {
    font-size: 0.92rem;
    color: var(--text-color-secondary);
    font-weight: 500;
    opacity: 0.6;
    transition: opacity 0.2s ease-out;
    cursor: default;

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const ReferendumRowWrapper = styled.div`
  position: relative;
  padding: 1rem 1.25rem;
  background-color: #1c1c1c;

  /* Content */
  .content-wrapper {
    display: flex;
    align-items: center;
    column-gap: 1rem;

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
    .right {
      justify-content: start;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
  }

  /* Stats */
  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    min-width: 90px;
    align-items: center;

    .icon-wrapper {
      font-size: 0.8rem;
      padding-right: 0.8rem;
      padding-left: 0.4rem;
      cursor: pointer;
      opacity: 0.4;
      &:hover {
        color: #953254;
        opacity: 1;
      }
    }
    h4 {
      display: flex;
      flex: 1;
      font-size: 1.05rem;
    }
    span {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      column-gap: 0.4rem;
      border-radius: 0.375rem;
      margin-right: 1.5rem;
    }
  }

  /* Buttons */
  .links-wrapper {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    overflow-x: hidden;
    justify-content: end;
    opacity: 0.5;
    transition: opacity 0.2s ease-out;

    .btn-more {
      ${mixinRowButton}
      color: #8d8d8d;
      &:hover {
        color: #f1f1f1;
      }
    }
    .btn-polkassembly {
      ${mixinRowButton}
      color: rgb(172 80 122);
      &:hover {
        color: rgb(255 108 174);
      }
    }
    .btn-subsquare {
      ${mixinRowButton}
      color: rgb(92 129 177);
      &:hover {
        color: rgb(171 208 255);
      }
    }
  }
  .menu-btn-wrapper {
    display: flex;
    justify-content: center;
    position: relative;
    padding: 0.25rem 0.5rem;
    min-width: 80px;

    .icon-wrapper {
      background-color: #464646;
      border-color: #464646;
      font-size: 0.85rem;
    }
  }

  /* Collapsable Section */
  .collapse {
    overflow: hidden;
    width: 100%;

    .content-wrapper {
      --border-top-bottom: 1px solid #1f1f1f;

      width: 100%;
      margin-top: 1.25rem;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      row-gap: 0.25rem;
      background-color: #111;
      border-top: var(--border-top-bottom);
      border-bottom: var(--border-top-bottom);

      .subscription-grid {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.5rem;
        font-size: 0.95rem;

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

        .subscription-row {
          width: 100%;
          display: flex;
          align-items: center;
          column-gap: 1rem;
          width: 100%;

          p {
            font-size: 0.95rem;
            font-weight: 600;
          }
        }
      }
    }
  }

  .icon-wrapper {
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0.4;
    &:hover {
      color: #953254;
      opacity: 1;
    }
  }
  /* Add Subscription Button */
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 0.5rem;
    margin-left: 0.25rem;

    min-width: 120px;
    background-color: rgb(19 19 19);
    border: 1px solid rgb(68 68 68);
    color: rgb(101 101 101);
    padding: 0.5rem 0.75rem;
    border-radius: var(--button-border-radius-large);
    transition: background-color 0.2s ease-out;
    cursor: pointer;

    svg,
    span {
      font-size: 0.9rem;
    }
    &:hover {
      background-color: rgb(24 24 24);
    }
  }
`;
