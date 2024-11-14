// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTooltip } from '../../../contexts/Tooltip';
import styled from 'styled-components';

interface WarningIconProps {
  tooltip: string;
  iconColor: string;
  iconTransform?: string;
}

export const WarningIconWrapper = styled.div`
  opacity: 0.5;
  transition: opacity 0.2s ease-out;
  &:hover {
    opacity: 1;
  }
`;

export const WarningIcon = ({
  tooltip,
  iconColor,
  iconTransform,
}: WarningIconProps) => {
  const { setTooltipTextAndOpen } = useTooltip();

  return (
    <div
      className="tooltip-trigger-element"
      data-tooltip-text={tooltip}
      onMouseMove={() => setTooltipTextAndOpen(tooltip)}
    >
      <WarningIconWrapper>
        <FontAwesomeIcon
          color={iconColor}
          icon={faWarning}
          transform={iconTransform ? iconTransform : 'grow-0'}
        />
      </WarningIconWrapper>
    </div>
  );
};
