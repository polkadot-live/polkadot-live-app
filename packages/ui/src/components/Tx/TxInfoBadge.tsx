// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TxInfoBadgeWrapper } from './Wrapper';
import type { TxInfoBadgeProps } from './types';

export const TxInfoBadge = ({ children, icon, label }: TxInfoBadgeProps) => (
  <TxInfoBadgeWrapper>
    <span className="badge">
      <FontAwesomeIcon icon={icon} className="icon" transform={'shrink-3'} />
      {label}
    </span>
    <span className="content">{children}</span>
  </TxInfoBadgeWrapper>
);
