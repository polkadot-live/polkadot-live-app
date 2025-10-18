// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Import } from '@polkadot-live/screens';
import { useImportMessagePorts } from '@ren/hooks/useImportMessagePorts';
import { useDebug } from '@ren/hooks/useDebug';
import { useConnections } from '@ren/contexts/common';
import { FadeInWrapper } from '@polkadot-live/ui/utils';

export const FadeImport = () => {
  // Set up port communication for `import` window.
  useImportMessagePorts();
  useDebug(window.myAPI.getWindowId());
  const { stateLoaded } = useConnections();

  return (
    <FadeInWrapper show={stateLoaded}>
      <Import />
    </FadeInWrapper>
  );
};
