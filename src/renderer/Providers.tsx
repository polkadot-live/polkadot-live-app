// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { setStateWithRef } from '@polkadot-cloud/utils';
import { Router } from './Router';
import { AccountStateProvider } from '@app/contexts/AccountState';
import { AddressesProvider } from '@app/contexts/Addresses';
import { ChainsProvider } from '@app/contexts/Chains';
import { EventsProvider } from '@app/contexts/Events';
import { OverlayProvider } from '@app/contexts/Overlay';
import { TooltipProvider } from '@app/contexts/Tooltip';
import { TxMetaProvider } from '@app/contexts/TxMeta';
import { withProviders } from '@app/library/Hooks/withProviders';
import { useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

export const ThemedRouter: React.FC = () => {
  // check whether system is initially on dark mode.
  const { matches: isDarkMode } = window.matchMedia(
    '(prefers-color-scheme: dark)'
  );
  const initialTheme = isDarkMode ? 'dark' : 'light';

  // store initial theme in state.
  const [mode, setMode] = useState(initialTheme);
  const modeRef = useRef(mode);

  // subscribe to system theme changes.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      setStateWithRef(event.matches ? 'dark' : 'light', setMode, modeRef);
    });

  return (
    <ThemeProvider theme={{ mode: modeRef.current }}>
      <div className="theme-polkadot">
        <Router />
      </div>
    </ThemeProvider>
  );
};

export const Providers = withProviders(
  OverlayProvider,
  AddressesProvider,
  AccountStateProvider,
  ChainsProvider,
  EventsProvider,
  TxMetaProvider,
  TooltipProvider
)(ThemedRouter);
