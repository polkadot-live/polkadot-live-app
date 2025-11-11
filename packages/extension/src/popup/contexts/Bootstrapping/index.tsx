// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook, useConnections } from '@polkadot-live/contexts';
import { setStateWithRef } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { BootstrappingInterface } from './types';

export const BootstrappingContext = createContext<
  BootstrappingInterface | undefined
>(undefined);

export const useBootstrapping = createSafeContextHook(
  BootstrappingContext,
  'BootstrappingContext'
);

export const BootstrappingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { cacheGet, relayState } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const refAppInitialized = useRef(false);
  const refAborted = useRef(false);
  const refSwitchingToOnline = useRef(false);

  /**
   * Initialize application systems.
   */
  const initSystems = async () => {
    const data = { type: 'bootstrap', task: 'initSystems' };
    await chrome.runtime.sendMessage(data);
  };

  /**
   * Connect APIs and restore systems.
   */
  const connectAPIs = async () => {
    if (isConnected) {
      const data = { type: 'bootstrap', task: 'connectApis' };
      await chrome.runtime.sendMessage(data);
    }
  };

  /**
   * Handle app initialization.
   */
  const initApp = async () => {
    if (refAppInitialized.current) {
      return;
    }
    setAppLoading(true);
    const initTasks: (() => Promise<AnyData>)[] = [initSystems];
    for (const task of initTasks) {
      if (!refAborted.current) {
        await task();
      }
    }
    refAppInitialized.current = true;
    if (refAborted.current) {
      setStateWithRef(false, setIsAborting, refAborted);
      await initAppOffline();
    }

    // Wait 100ms to avoid a snapping loading spinner.
    setTimeout(() => {
      setAppLoading(false);
    }, 100);
  };

  /**
   * Handle switching to offline mode.
   */
  const initAppOffline = async () => {
    // Set config flag to false to re-start the online mode initialization
    // when connection status goes back online.
    refSwitchingToOnline.current = false;
    relayState('mode:connected', navigator.onLine);
    relayState('mode:online', false);

    await chrome.runtime.sendMessage({
      type: 'bootstrap',
      task: 'switchToOffline',
    });
  };

  /**
   * Handle switching to online mode.
   */
  const initAppOnline = async () => {
    if (refSwitchingToOnline.current) {
      return;
    }
    setIsConnecting(true);

    // Set config flag to `true` to make sure the app doesn't re-execute
    // this function's logic whilst the connection status is online.
    refSwitchingToOnline.current = true;
    const initTasks: (() => Promise<AnyData>)[] = [connectAPIs];
    for (const task of initTasks) {
      await task();
    }
    await chrome.runtime.sendMessage({
      type: 'bootstrap',
      task: 'switchToOnline',
    });

    refSwitchingToOnline.current = false;
    if (refAborted.current) {
      setIsConnecting(false);
      setStateWithRef(false, setIsAborting, refAborted);
      await initAppOffline();
    } else {
      const isOnline = navigator.onLine;
      setIsConnecting(false);
      relayState('mode:connected', isOnline);
      relayState('mode:online', isOnline);
    }
  };

  /**
   * Initialize app on mount.
   */
  useEffect(() => {
    const init = async () => {
      if (!refAppInitialized.current) {
        await initApp();
      }
    };
    init();
  }, []);

  /**
   * Handle online status changes.
   */
  useEffect(() => {
    const handleOnline = async () => {
      await initAppOnline();
    };
    const handleOffline = async () => {
      await initAppOffline();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BootstrappingContext
      value={{
        appLoading,
        isAborting,
        isConnected,
        isConnecting,
        initAppOffline,
        initAppOnline,
        setAppLoading,
        setIsAborting,
        setIsConnecting,
      }}
    >
      {children}
    </BootstrappingContext>
  );
};
