// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '@polkadot-live/styles/wrappers';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Header = ({ label }: { label: string }) => (
  <FlexRow
    $gap="0.65rem"
    style={{
      padding: '0 0.25rem',
    }}
  >
    <FontAwesomeIcon
      style={{ color: 'var(--text-color-primary)', opacity: '0.8' }}
      icon={faCaretRight}
      transform={'shrink-4'}
    />
    <h2
      style={{
        fontSize: '1rem',
        opacity: '0.8',
        color: 'var(--text-color-primary)',
      }}
    >
      {label}
    </h2>
  </FlexRow>
);
