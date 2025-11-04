// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov } from '@polkadot-live/core';
import { useOpenGovMessagePorts } from '@ren/hooks/useOpenGovMessagePorts';
import { useEffect } from 'react';
import { useConnections } from '@polkadot-live/contexts';
import { useDebug } from '@ren/hooks/useDebug';
import { useTreasury } from '@ren/contexts/openGov';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { OpenGov } from '@polkadot-live/screens';

export const FadeOpenGov = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();
  useDebug(window.myAPI.getWindowId());

  const { getOnlineMode, stateLoaded } = useConnections();
  const { treasuryChainId, initTreasury } = useTreasury();

  // Initialize treasury data when window opens.
  useEffect(() => {
    if (ConfigOpenGov._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, []);

  // Initialize treasury data when port is received.
  useEffect(() => {
    if (ConfigOpenGov._portExists) {
      getOnlineMode() && initTreasury(treasuryChainId);
    }
  }, [ConfigOpenGov._portExists]);

  // Reload treasury data if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode() && ConfigOpenGov._portExists) {
      initTreasury(treasuryChainId);
    }
  }, [getOnlineMode()]);

  return (
    <FadeInWrapper show={stateLoaded}>
      <OpenGov />
    </FadeInWrapper>
  );
};
