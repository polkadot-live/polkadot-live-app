// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '@polkadot-live/styles/wrappers';

export const Header = ({ label }: { label: string }) => (
  <FlexRow
    $gap="0.65rem"
    style={{
      backgroundColor: 'var(--background-surface)',
      borderRadius: '0.375rem',
      padding: '0.5rem 1.25rem',
    }}
  >
    <h2
      style={{
        fontSize: '0.96rem',
        opacity: '0.8',
        color: 'var(--text-color-secondary)',
      }}
    >
      {label}
    </h2>
  </FlexRow>
);
