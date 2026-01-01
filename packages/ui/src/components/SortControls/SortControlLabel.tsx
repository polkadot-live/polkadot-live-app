// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SortControlLabelProps } from './types';

export const SortControlLabel: React.FC<SortControlLabelProps> = ({
  faIcon,
  label,
  noBorder = false,
  style,
  children,
}: SortControlLabelProps) => (
  <div
    className={`breadcrumb-wrapper${noBorder ? ' no-border' : ''}`}
    style={style}
  >
    {faIcon && (
      <div>
        <FontAwesomeIcon icon={faIcon} />
      </div>
    )}
    {children ?? <span>{label ?? ''}</span>}
  </div>
);
