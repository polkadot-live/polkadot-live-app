// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useConnections } from '@polkadot-live/contexts';
import { FadeInWrapper } from '@polkadot-live/ui/utils';
import { Settings } from '@polkadot-live/screens';
import type { OsPlatform } from '@polkadot-live/types/settings';

export const FadeSettings = () => {
  const { stateLoaded } = useConnections();
  const [osPlatform, setOsPlatform] = useState<OsPlatform | null>(null);

  useEffect(() => {
    const initOsPlatform = async () => {
      const platform = await window.myAPI.getOsPlatform();
      setOsPlatform(platform as OsPlatform);
    };
    initOsPlatform();
  }, []);

  return (
    <FadeInWrapper show={stateLoaded}>
      <Settings platform={osPlatform} />
    </FadeInWrapper>
  );
};
