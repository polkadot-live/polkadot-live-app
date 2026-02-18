// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import { setStateWithRef } from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Router } from './Router';

export const Theme = () => {
  const { cacheGet } = useConnections();
  const darkMode = cacheGet('mode:dark');

  // Store initial theme in state.
  const [mode, setMode] = useState(darkMode ? 'dark' : 'light');
  const modeRef = useRef(mode);

  useEffect(() => {
    setStateWithRef(darkMode ? 'dark' : 'light', setMode, modeRef);
  }, [darkMode]);

  return (
    <ThemeProvider theme={{ mode: modeRef.current }}>
      <div className={`theme-polkadot-relay theme-${modeRef.current}`}>
        <Router />
      </div>
    </ThemeProvider>
  );
};
