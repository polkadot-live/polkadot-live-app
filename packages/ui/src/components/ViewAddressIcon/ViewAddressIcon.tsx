// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TooltipRx } from '../TooltipRx';
import { ViewIconWrapper } from './ViewAddressIcon.styles';
import type { AnyData } from '@polkadot-live/types/misc';

export interface ViewAddressIconProps {
  onClick: () => void;
  theme: AnyData;
}

export const ViewAddressIcon = ({ onClick, theme }: ViewAddressIconProps) => (
  <TooltipRx text={'Show Address'} theme={theme}>
    <ViewIconWrapper $theme={theme} onClick={() => onClick()}>
      <FontAwesomeIcon
        className="ViewIcon"
        icon={faEye}
        transform={'shrink-4'}
      />
    </ViewIconWrapper>
  </TooltipRx>
);
