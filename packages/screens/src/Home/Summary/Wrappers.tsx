// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/styles';
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const OpenViewButtonWrapper = styled(motion.button)`
  flex: 1;
  background-color: var(--background-primary);
  position: relative;
  min-height: 65px;
  padding: 1.5rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  user-select: none;
  overflow: hidden;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  .icon {
    color: var(--nav-button-text);
    z-index: 2;
    font-size: 1.5rem;
    transition: color 0.25s ease;
  }
  h2 {
    color: var(--nav-button-text);
    z-index: 2;
    font-size: 1rem;
    line-height: 1.75rem;
    transition: color 0.25s ease;
  }

  /* Accent line along the bottom */
  .accent-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2.5px;
    border-radius: 2px;
    background: #c75d82;
    transform: translateX(-50%);
    transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    background-color: var(--background-primary-hover);

    .icon {
      color: #c75d82;
    }
    .accent-line {
      width: 60%;
    }
  }

  &:active .accent-line {
    width: 40%;
    transition-duration: 0.1s;
  }
`;

/**
 * SideTriggerButtonWrapper components.
 */
const SideTriggerButtonWrapper = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 1.25rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: color 0.25s ease;

  .caret-icon {
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

/**
 * Scoped hover styles for the Summary accordion trigger wrapper.
 * Applied alongside HeaderContentDropdownWrapper without modifying it.
 */
export const SummaryTriggerStyles = styled.div`
  .SummaryTriggerWrapper:hover {
    .caret-icon {
      transform: translateX(3px);
    }
    button {
      color: #c75d82;
    }
  }
  .SummaryTriggerWrapper:active {
    .caret-icon {
      transform: translateX(1px);
      transition-duration: 0.1s;
    }
    button {
      color: #c75d82;
    }
  }
`;

export const SideTriggerButton = ({ onClick }: { onClick: () => void }) => (
  <SideTriggerButtonWrapper onClick={() => onClick()}>
    <FlexRow $gap={'0.65rem'}>
      <FontAwesomeIcon
        className="caret-icon"
        icon={faCaretRight}
        transform={'grow-2'}
      />
    </FlexRow>
  </SideTriggerButtonWrapper>
);
