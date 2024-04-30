// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect } from 'react';
import { useOnlineStatus } from '@app/contexts/OnlineStatus';

export const useInitIpcHandlers = () => {
  const {
    handleInitializeApp,
    handleInitializeAppOffline,
    handleInitializeAppOnline,
  } = useOnlineStatus();

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
