// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
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
  const [appLoading, setAppLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [isOnlineMode, setIsOnlineMode] = useState(navigator.onLine);

  const refAppInitialized = useRef(false);
  const refAborted = useRef(false);
  const refSwitchingToOnline = useRef(false);

  /**
   * Initialize application systems.
   */
  const initSystems = async () => {
    // TODO
  };

  /**
   * Connect APIs and restore systems.
   */
  const connectAPIs = async () => {
    if (isConnected) {
      // TODO
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
    await initSystems();
    const initTasks: (() => Promise<AnyData>)[] = [connectAPIs];

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
    setIsOnlineMode(false);
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

    refSwitchingToOnline.current = false;
    if (refAborted.current) {
      setIsConnecting(false);
      setStateWithRef(false, setIsAborting, refAborted);
      await initAppOffline();
      return;
    }

    setIsConnecting(false);
    setIsOnlineMode(true);
  };

  /**
   * Handle event listeners.
   */
  useEffect(() => {
    // Listen for online status changes.
    window.addEventListener('online', () => {
      initAppOnline();
    });
    window.addEventListener('offline', () => {
      initAppOffline();
    });

    // Initialize app on mount.
    const init = async () => {
      if (!refAppInitialized.current) {
        await initApp();
      }
    };
    init();
  }, []);

  /**
   * Handle Dedot clients when online mode changes.
   */
  useEffect(() => {
    const disconnectAll = async () => {
      // TODO
    };

    setIsConnected(navigator.onLine);
    if (!navigator.onLine) {
      disconnectAll();
    }
  }, [navigator.onLine]);

  return (
    <BootstrappingContext
      value={{
        appLoading,
        isAborting,
        isConnected,
        isConnecting,
        isOnlineMode,
        initAppOffline,
        initAppOnline,
        setAppLoading,
        setIsAborting,
        setIsConnecting,
        setIsOnlineMode,
      }}
    >
      {children}
    </BootstrappingContext>
  );
};
