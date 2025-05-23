// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoCardWrapper } from './InfoCard.styles';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface InfoCardProps {
  children: React.ReactNode;
  kind?: 'general' | 'warning';
  icon?: IconDefinition;
  iconTransform?: string;
  style?: React.CSSProperties;
}

export const InfoCard = ({
  children,
  kind = 'general',
  icon,
  iconTransform,
  style,
}: InfoCardProps) => (
  <InfoCardWrapper style={style}>
    <span className={kind === 'warning' ? 'warning' : ''}>
      {icon && <FontAwesomeIcon icon={icon} transform={iconTransform} />}
      {children}
    </span>
  </InfoCardWrapper>
);
