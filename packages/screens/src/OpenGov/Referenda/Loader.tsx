// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import ContentLoader from 'react-content-loader';
import type { AnyData } from '@polkadot-live/types';

interface LoaderProps {
  theme: AnyData;
}

export const Loader = ({ theme }: LoaderProps) => {
  const h = 14;
  return (
    <ContentLoader
      speed={2}
      width={300}
      height={h}
      viewBox={`0 0 340 ${h}`}
      backgroundColor={theme.buttonBackgroundPrimary}
      foregroundColor={theme.buttonBackgroundPrimaryHover}
      style={{ maxWidth: '100%' }}
    >
      <rect x="0" y="0" rx="2" ry="2" width="67" height={h} />
      <rect x="80" y="0" rx="2" ry="2" width={300 - 80} height={h} />
    </ContentLoader>
  );
};
