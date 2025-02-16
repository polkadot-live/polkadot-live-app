// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@app/contexts/common/Help';
import {
  faCaretRight,
  faComments,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/ui/styles';
import {
  Identicon,
  ShiftingMeter,
  StatItemWrapper,
} from '@polkadot-live/ui/components';
import styled from 'styled-components';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { FlattenedAccountData } from 'packages/types/src';

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
}: {
  kind: string;
  meterValue: number;
  flattened?: FlattenedAccountData;
  helpKey?: HelpItemKey;
}) => {
  const { openHelp } = useHelp();
  const meterColor =
    kind === 'total' ? 'var(--text-highlight)' : 'var(--text-color-primary)';

  return (
    <StatItemRowWrapper $total={kind === 'total'}>
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
            <Identicon value={flattened.address} fontSize="1.8rem" />
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
    </StatItemRowWrapper>
  );
};
