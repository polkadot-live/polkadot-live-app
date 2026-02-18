// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections, useTreasury } from '@polkadot-live/contexts';
import { ConfigTabs } from '@polkadot-live/core';
import { OpenGov } from '@polkadot-live/screens';
import { FadeInWrapper } from '@polkadot-live/ui';
import { useEffect } from 'react';

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
