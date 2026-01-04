// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import { CopyButton, Identicon } from '@polkadot-live/ui';
import { ellipsisFn } from '@w3ux/utils';
import { FlexRow } from '@polkadot-live/styles';
import { FieldLayout } from './FieldLayout';
import type { FieldProps } from './types';

export const AccountField = ({ label, value }: FieldProps) => {
  const { getTheme, copyToClipboard } = useConnections();
  return (
    <FieldLayout label={label} value={value}>
      <FlexRow $gap="0.8rem">
        <Identicon value={value} fontSize="1.5rem" />
        <p>{ellipsisFn(value, 12)}</p>
        <span>
          <CopyButton
            iconFontSize={'0.95rem'}
            theme={getTheme()}
            onCopyClick={async () => copyToClipboard(value)}
          />
        </span>
      </FlexRow>
    </FieldLayout>
  );
};
