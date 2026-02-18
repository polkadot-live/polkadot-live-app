// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import { Import } from '@polkadot-live/screens';
import { FadeInWrapper } from '@polkadot-live/ui';

export const FadeImport = () => {
  const { stateLoaded } = useConnections();
  return (
    <FadeInWrapper show={stateLoaded}>
      <Import />
    </FadeInWrapper>
  );
};
