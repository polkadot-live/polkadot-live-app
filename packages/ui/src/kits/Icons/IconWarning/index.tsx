// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface WarningIconProps {
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

export const WarningIcon = ({ iconColor, iconTransform }: WarningIconProps) => (
  <WarningIconWrapper>
    <FontAwesomeIcon
      color={iconColor}
      icon={faWarning}
      transform={iconTransform ? iconTransform : 'grow-0'}
    />
  </WarningIconWrapper>
);
