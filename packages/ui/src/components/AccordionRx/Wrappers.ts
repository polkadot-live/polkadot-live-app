// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const AccordionWrapper = styled.div`
  .AccordionRoot {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .AccordionItem {
    overflow: hidden;
  }
  .AccordionItem:first-child {
    margin-top: 0;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
  }
  .AccordionItem:last-child {
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  .HeaderContentDropdownWrapper {
    background-color: var(--background-surface);
    display: flex;
    align-items: center;
    align-self: stretch;
    justify-content: center;
    padding: 0 0.75rem;
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    cursor: pointer;

    &:hover {
      background-color: var(--accordion-background-hover);
    }
  }
  // Focused item - applies to both header and content.
  .AccordionItem:focus-within {
    position: relative;
  }

  .AccordionHeader {
    flex: 1;
    display: flex;
  }

  .AccordionTrigger {
    display: flex;
    flex: 1;
    color: var(--text-color-primary);
    display: flex;
    gap: 1rem;
    font-family: InterSemiBold, sans-serif;
    font-weight: 500;
    line-height: 1.6rem;
    transition: background-color 0.15s ease-in-out;

    .HeaderContent {
      background-color: var(--background-surface);
      padding-right: 1.5rem;
      text-align: left;
      flex: 1;
      display: flex;
      align-items: center;
      height: 45px;
      padding: 0.5rem 1rem;
      gap: 0.75rem;
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;

      h3 {
        flex: 1;
        font-size: 1.15rem !important;
      }

      .right {
        color: var(--text-color-secondary);
        display: flex;
        gap: 1.6rem;
        align-items: center;
        font-size: 1rem;

        .stat {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          text-align: left;
        }
      }

      &:hover {
        background-color: var(--accordion-background-hover);
      }
    }
  }
  .AccordionContent {
    overflow: hidden;
  }
  .AccordionContent[data-state='open'] {
    animation: slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  .AccordionContent[data-state='closed'] {
    animation: slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1);
  }

  .AccordionChevron {
    margin-top: -2px;
    color: var(--text-color-secondary);
    transition: transform 200ms cubic-bezier(0.87, 0, 0.13, 1);
    transform: rotate(-90deg);
  }
  .AccordionTrigger[data-state='open'] .AccordionChevron {
    transform: rotate(0deg);
  }

  .AccordionContentInner {
    background-color: var(--background-surface);
    padding: 1rem 1rem;
    margin-top: 1rem;
    border-radius: 0.375rem;
    p {
      padding: 0 0.5rem;
      margin: 0;
      margin-bottom: 1rem;
      line-height: 1.75rem;
    }
  }

  .AccordionContentInnerAlternate {
    background-color: transparent;
    padding: 0;
    margin-top: 1rem;
    border-radius: 0.375rem;
  }

  @keyframes slideDown {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
`;
