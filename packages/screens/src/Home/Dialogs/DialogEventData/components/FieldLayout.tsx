// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import { InfoPanel } from '../../../../Action/Dialogs/Wrappers';
import type { FieldProps } from './types';

export const FieldLayout = ({ label, value, children }: FieldProps) => {
  const { getTheme } = useConnections();
  const theme = getTheme();
  return (
    <InfoPanel $theme={theme}>
      <div>
        <span className="LeftItem">{label}</span>
        <span className="RightItem">{children ?? value}</span>
      </div>
    </InfoPanel>
  );
};
