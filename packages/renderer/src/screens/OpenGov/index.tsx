// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import { useEffect } from 'react';
import { useConnections, useTreasury } from '@polkadot-live/contexts';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { OpenGov } from '@polkadot-live/screens';

export const FadeOpenGov = () => {
  const { getOnlineMode, stateLoaded } = useConnections();
  const { fetchingTreasuryData, treasuryChainId, initTreasury } = useTreasury();
  const isOnline = getOnlineMode();

  // Initialize treasury data when window opens.
  useEffect(() => {
    if (ConfigTabs._portExists && !fetchingTreasuryData && getOnlineMode()) {
      initTreasury(treasuryChainId);
    }
  }, [isOnline]);

  return (
    <FadeInWrapper show={stateLoaded}>
      <OpenGov />
    </FadeInWrapper>
  );
};
