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
  // Focused item - applies to both header and content.
  .AccordionItem:focus-within {
    position: relative;
  }

  .AccordionHeader {
    display: flex;
    margin: 0.5rem 0 0.25rem;
  }

  .AccordionTrigger {
    color: var(--text-color-primary);
    display: flex;
    flex: 1;
    gap: 1rem;
    padding: 0.5rem 1rem;
    height: 45px;
    align-items: center;
    font-family: InterSemiBold, sans-serif;
    font-weight: 500;
    line-height: 1.6rem;

    background-color: var(--background-surface);
    transition: background-color 0.15s ease-in-out;

    .HeaderContent {
      flex: 1;
      text-align: left;
      h3 {
        font-size: 1.15rem !important;
      }
    }
  }
  .AccordionTrigger:hover {
    &:hover {
      background-color: var(--accordion-background-hover);
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
  .AccordionTrigger[data-state='open'] > .AccordionChevron {
    transform: rotate(0deg);
  }

  // TMP
  .AccordionContentText {
    padding: 0 1.5rem;
    p {
      margin: 1rem 0 1.25rem;
      padding: 0 0.5rem;
      line-height: 1.75rem;
    }
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
