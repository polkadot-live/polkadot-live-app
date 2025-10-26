// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActionMessagePorts } from '@ren/hooks/useActionMessagePorts';
import { useDebug } from '@ren/hooks/useDebug';
import { useConnections } from '@ren/contexts/common';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { Action } from '@polkadot-live/screens';

export const FadeAction = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());
  const { stateLoaded } = useConnections();

  return (
    <FadeInWrapper show={stateLoaded}>
      <Action />
    </FadeInWrapper>
  );
};
