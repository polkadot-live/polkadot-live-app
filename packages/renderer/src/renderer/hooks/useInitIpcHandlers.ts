// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect } from 'react';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';

export const useInitIpcHandlers = () => {
  const {
    handleInitializeApp,
    handleInitializeAppOffline,
    handleInitializeAppOnline,
  } = useBootstrapping();

  useEffect(() => {
    /**
     * Pass callbacks to preload API.
     */
    window.myAPI.initializeApp(async () => {
      await handleInitializeApp();
    });

    window.myAPI.initializeAppOffline(async () => {
      await handleInitializeAppOffline();
    });

    window.myAPI.initializeAppOnline(async () => {
      await handleInitializeAppOnline();
    });
  }, []);
};
