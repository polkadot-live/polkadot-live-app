// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TooltipRx } from '../TooltipRx';
import { TriggerRightIconWrapper } from './TriggerRightIcon.styles';
import type { TriggerRightIconProps } from './types';

export const TriggerRightIcon = ({
  text,
  theme,
  icon,
  iconTransform,
}: TriggerRightIconProps) => (
  <TriggerRightIconWrapper>
    <TooltipRx text={text} theme={theme}>
      <FontAwesomeIcon icon={icon} transform={iconTransform} />
    </TooltipRx>
  </TriggerRightIconWrapper>
);
