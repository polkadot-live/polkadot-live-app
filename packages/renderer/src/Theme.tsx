// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import { Router } from './Router';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { useConnections } from './contexts/common';

export const Theme = () => {
  const { darkMode } = useConnections();

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
