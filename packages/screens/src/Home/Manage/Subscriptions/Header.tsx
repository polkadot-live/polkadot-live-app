// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '@polkadot-live/styles';

interface HeaderProps {
  label: string;
  children?: React.ReactNode;
}

export const Header = ({ label, children }: HeaderProps) => (
  <FlexRow
    $gap="0.65rem"
    style={{
      background:
        'linear-gradient(90deg, var(--background-surface) 0%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0) 100%)',
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem 0.5rem 1.25rem',
      width: '100%',
      transition: 'background 240ms ease',
    }}
  >
    <h2
      style={{
        color: 'var(--text-color-secondary)',
        flex: '1',
        fontSize: '0.96rem',
        opacity: '0.8',
      }}
    >
      {label}
    </h2>
    {children && children}
  </FlexRow>
);
