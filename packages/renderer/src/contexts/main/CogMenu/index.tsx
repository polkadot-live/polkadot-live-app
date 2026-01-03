// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { useBootstrapping } from '../Bootstrapping';
import { createContext } from 'react';
import {
  createSafeContextHook,
  useAppSettings,
  useConnections,
  useHelp,
} from '@polkadot-live/contexts';
import { renderToast } from '@polkadot-live/ui';
import type { CogMenuContextInterface } from '@polkadot-live/contexts/types/main';
import type { MenuItemData } from '@polkadot-live/types/menu';

export const CogMenuContext = createContext<
  CogMenuContextInterface | undefined
>(undefined);

export const useCogMenu = createSafeContextHook(
  CogMenuContext,
  'CogMenuContext'
);

export const CogMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    appLoading,
    isAborting,
    isConnecting,
    handleInitializeAppOnline,
    handleInitializeAppOffline,
    setIsAborting,
    setIsConnecting,
  } = useBootstrapping();

  const { cacheGet, getOnlineMode, openTab } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const { openHelp } = useHelp();
  const { toggleSetting } = useAppSettings();

  // Connection button text.
  const getConnectionButtonText = (): string => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (getOnlineMode()) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  };

  // Handle abort connecting.
  const handleAbortConnecting = () => {
    setIsAborting(true);
    ConfigRenderer.abortConnecting = true;
  };

  // Handle connect click.
  const handleConnectClick = async () => {
    if (isConnecting || appLoading) {
      handleAbortConnecting();
    } else if (getOnlineMode()) {
      await handleInitializeAppOffline();
    } else {
      // Confirm online connection.
      if (isConnected) {
        // Handle going online.
        setIsConnecting(true);
        await handleInitializeAppOnline();
        setIsConnecting(false);
      } else {
        renderToast('You are offline.', 'connect-error', 'error', 'top-center');
      }
    }
  };

  // Handle silence notifications.
  const handleSilenceNotifications = () => {
    toggleSetting('setting:silence-os-notifications');
  };

  // Menu item data.
  const getMenuItems = (): MenuItemData[] => [
    {
      label: 'Accounts',
      disabled: appLoading,
      onClick: () =>
        openTab('import', { event: 'window-open-accounts', data: null }),
    },
    {
      label: 'Extrinsics',
      disabled: appLoading,
      onClick: () =>
        openTab('action', { event: 'window-open-extrinsics', data: null }),
    },
    {
      label: 'OpenGov',
      disabled: appLoading,
      onClick: () =>
        openTab('openGov', { event: 'window-open-openGov', data: null }),
    },
    {
      label: 'Settings',
      disabled: appLoading,
      onClick: () =>
        openTab('settings', { event: 'window-open-settings', data: null }),
    },
    {
      label: 'Exit',
      disabled: false,
      appendSeparator: true,
      onClick: () => {
        window.myAPI.quitApp();
      },
    },
    {
      label: 'Disclaimer',
      disabled: false,
      onClick: () => {
        openHelp('help:docs:disclaimer');
      },
    },
    {
      label: 'Privacy',
      disabled: false,
      onClick: () => {
        openHelp('help:docs:privacy');
      },
    },
  ];

  // Get app flags.
  const getAppFlags = () => ({
    isConnecting,
    isOnline: getOnlineMode(),
    isAborting,
    isLoading: appLoading,
  });

  return (
    <CogMenuContext
      value={{
        getAppFlags,
        getConnectionButtonText,
        getMenuItems,
        handleAbortConnecting,
        handleConnectClick,
        handleSilenceNotifications,
      }}
    >
      {children}
    </CogMenuContext>
  );
};
