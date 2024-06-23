// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@app/utils/cryptoUtils';
import { Router } from './Router';
import { useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

export const Theme = () => {
  // Check whether system is initially on dark mode.
  const { matches: isDarkMode } = window.matchMedia(
    '(prefers-color-scheme: dark)'
  );

  // Store initial theme in state.
  const [mode, setMode] = useState(isDarkMode ? 'dark' : 'light');
  const modeRef = useRef(mode);

  // Subscribe to system theme changes.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      setStateWithRef(event.matches ? 'dark' : 'light', setMode, modeRef);
    });

  return (
    <ThemeProvider theme={{ mode: modeRef.current }}>
      <div className={`theme-polkadot-relay theme-${modeRef.current}`}>
        <Router />
      </div>
    </ThemeProvider>
  );
};
