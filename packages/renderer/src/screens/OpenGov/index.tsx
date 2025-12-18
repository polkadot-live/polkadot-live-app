// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import { useEffect } from 'react';
import { useConnections, useTreasury } from '@polkadot-live/contexts';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { OpenGov } from '@polkadot-live/screens';

export const FadeOpenGov = () => {
  const { getOnlineMode, stateLoaded } = useConnections();
  const { treasuryChainId, initTreasury } = useTreasury();

  // Initialize treasury data when window opens.
  useEffect(() => {
    if (ConfigTabs._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, []);

  // Initialize treasury data when port is received.
  useEffect(() => {
    if (ConfigTabs._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, [ConfigTabs._portExists]);

  // Reload treasury data if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode() && ConfigTabs._portExists) {
      initTreasury(treasuryChainId);
    }
  }, [getOnlineMode()]);

  return (
    <FadeInWrapper show={stateLoaded}>
      <OpenGov />
    </FadeInWrapper>
  );
};
