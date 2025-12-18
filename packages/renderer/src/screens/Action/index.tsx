// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { Action } from '@polkadot-live/screens';

export const FadeAction = () => {
  const { stateLoaded } = useConnections();
  return (
    <FadeInWrapper show={stateLoaded}>
      <Action />
    </FadeInWrapper>
  );
};
