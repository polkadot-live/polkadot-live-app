// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import { useConnections } from '@app/contexts/common/Connections';
import { useHelp } from '@app/contexts/common/Help';
import {
  faCaretRight,
  faCircleDot,
  faComments,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/ui/styles';
import {
  Identicon,
  ShiftingMeter,
  StatItemWrapper,
  TooltipRx,
} from '@polkadot-live/ui/components';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import type { HelpItemKey } from '@polkadot-live/types/help';
import type { FlattenedAccountData } from 'packages/types/src';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const HoverGradient = styled(motion.span).attrs<{
  $dark: boolean;
}>((props) => ({ $dark: props.$dark }))`
  --hover-color: ${({ $dark }) =>
    $dark ? 'rgba(119, 93, 181, 0.411) 41%' : 'rgba(255, 255, 255, 0.837) 41%'};

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

/**
 * StatItemRow components.
 */
const StatItemRowWrapper = styled.div<{ $total?: boolean }>`
  padding: 1rem;
  background-color: ${(props) =>
    props.$total
      ? 'var(--stats-background-highlight)'
      : 'var(--background-surface)'};

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
    font-size: 1.1rem;
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

export const StatItemRow = ({
  kind,
  meterValue,
  helpKey,
  flattened,
  style,
  icon,
  category,
}: {
  kind: string;
  meterValue: number;
  flattened?: FlattenedAccountData;
  helpKey?: HelpItemKey;
  style?: React.CSSProperties;
  icon?: IconDefinition;
  category?: string;
}) => {
  const { openHelp } = useHelp();
  const { darkMode } = useConnections();

  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const meterColor =
    kind === 'total'
      ? 'var(--text-color-primary)'
      : 'var(--text-color-secondary)';

  return (
    <StatItemRowWrapper style={style} $total={kind === 'total'}>
      {kind === 'total' && (
        <FlexRow>
          {helpKey && (
            <div className="left help" onClick={() => openHelp(helpKey)}>
              <FontAwesomeIcon icon={faInfo} />
            </div>
          )}
          <h3 className="total">Total</h3>
          <div className="meter">
            <ShiftingMeter color={meterColor} value={meterValue} size={1.1} />
          </div>
        </FlexRow>
      )}
      {kind === 'account' && flattened && (
        <FlexRow>
          <div className="left">
            <TooltipRx text={ellipsisFn(flattened.address, 12)} theme={theme}>
              <span>
                <Identicon value={flattened.address} fontSize="1.8rem" />
              </span>
            </TooltipRx>
          </div>
          <h3>{flattened.name}</h3>
          <div className="meter">
            <ShiftingMeter color={meterColor} value={meterValue} size={1.1} />
          </div>
        </FlexRow>
      )}
      {kind === 'referenda' && (
        <FlexRow>
          <div className="left">
            <FontAwesomeIcon icon={faComments} transform={'grow-1'} />
          </div>
          <h3>Referenda</h3>
          <div className="meter">
            <ShiftingMeter color={meterColor} value={meterValue} size={1.1} />
          </div>
        </FlexRow>
      )}
      {kind === 'event' && (
        <FlexRow>
          <div className="left">
            {icon && (
              <FontAwesomeIcon
                style={{
                  color: 'var(--text-color-secondary)',
                  opacity: '0.4',
                }}
                icon={icon}
              />
            )}
          </div>
          <h3>{category || 'Unknown'}</h3>
          <div className="meter">
            <ShiftingMeter color={meterColor} value={meterValue} size={1.1} />
          </div>
        </FlexRow>
      )}
      {kind === 'import' && (
        <FlexRow>
          <div className="left">
            <FontAwesomeIcon
              style={{
                color: 'var(--accent-secondary)',
                opacity: '0.45',
              }}
              icon={faCircleDot}
              transform={'shrink-6'}
            />
          </div>
          <h3>{category || 'Unknown'}</h3>
          <div className="meter">
            <ShiftingMeter color={meterColor} value={meterValue} size={1.1} />
          </div>
        </FlexRow>
      )}
    </StatItemRowWrapper>
  );
};
