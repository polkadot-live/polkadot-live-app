// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@polkadot-live/contexts';
import { faCaretRight, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/styles';
import { ShiftingMeter, StatItemWrapper } from '@polkadot-live/ui';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { HelpItemKey } from '@polkadot-live/types/help';

export const HoverGradient = styled(motion.span).attrs<{
  $dark: boolean;
}>((props) => ({ $dark: props.$dark }))`
  --hover-color: ${({ $dark }) =>
    $dark ? 'rgba(119, 93, 181, 0.411) 40%' : 'rgba(205, 185, 247, 0.411) 20%'};

  position: absolute;
  transition: 0.35s;
  background-size: 200% auto;
  background-image: linear-gradient(
    45deg,
    var(--background-primary) 0%,
    var(--hover-color) 41%,
    var(--background-primary) 100%
  );

  border-radius: 0.375rem;
  inset: 0px;
  z-index: 0;
`;

export const OpenViewButtonWrapper = styled(motion.button).attrs<{
  $active: boolean;
}>((props) => ({ $active: props.$active }))`
  flex: 1;
  background-color: var(--background-primary);

  position: relative;
  min-height: 65px;
  padding: 1.5rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  user-select: none;

  .icon {
    color: var(--nav-button-text);
    z-index: 2;
    font-size: 1.5rem;
  }
  h2 {
    color: var(--nav-button-text);
    z-index: 2;
    font-size: 1rem;
    line-height: 1.75rem;
  }
  &:hover {
    background-color: var(--background-primary-hover);
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
  opacity: 0.75;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color-primary);
`;

export const SideTriggerButton = ({ onClick }: { onClick: () => void }) => (
  <SideTriggerButtonWrapper onClick={() => onClick()}>
    <FlexRow $gap={'0.65rem'}>
      <FontAwesomeIcon icon={faCaretRight} transform={'grow-2'} />
    </FlexRow>
  </SideTriggerButtonWrapper>
);

/**
 * StatItem components.
 */
export const StatItem = ({
  title,
  helpKey,
  meterValue,
  total = false,
}: {
  title: string;
  meterValue: number;
  helpKey?: HelpItemKey;
  total?: boolean;
}) => {
  const { openHelp } = useHelp();
  const meterColor = total
    ? 'var(--text-highlight)'
    : 'var(--text-color-primary)';

  return (
    <StatItemWrapper className={total ? 'total-item' : ''}>
      <div>
        <h3>{title}</h3>
        {helpKey && (
          <div className="help" onClick={() => openHelp(helpKey)}>
            <FontAwesomeIcon icon={faInfo} />
          </div>
        )}
      </div>
      <span>
        <ShiftingMeter color={meterColor} value={meterValue} size={1.2} />
      </span>
    </StatItemWrapper>
  );
};

export const StatItemRowWrapper = styled.div<{ $total?: boolean }>`
  padding: 1rem;
  background-color: var(--background-primary);

  &:first-child {
    border-top-right-radius: 0.375rem;
    border-top-left-radius: 0.375rem;
  }
  &:last-child {
    border-bottom-right-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  h3 {
    color: var(--text-color-secondary);
    flex: 1;
    font-size: 1.02rem;
    overflow-x: hidden;

    &.total {
      color: var(--text-highlight);
    }
  }
  .left {
    min-width: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .meter {
    padding-right: 0.5rem;
    font-weight: bolder;
  }
  .help {
    width: 1.6rem;
    height: 1.5rem;
    color: var(--text-dimmed);
    font-size: 0.85rem;
    transition: all 150ms ease-out;
    border-radius: 0.275rem;
    cursor: pointer;

    &:hover {
      color: var(--text-highlight);
    }
  }
`;
