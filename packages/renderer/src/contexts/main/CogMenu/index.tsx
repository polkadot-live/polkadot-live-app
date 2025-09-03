// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '@polkadot-live/core';
import { createContext } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { useAppSettings, useBootstrapping } from '@ren/contexts/main';
import { useConnections, useHelp } from '@ren/contexts/common';
import { Flip, toast } from 'react-toastify';
import type { CogMenuContextInterface } from './types';
import type { MenuItemData } from '@polkadot-live/ui/components';

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

  const { cacheGet, getOnlineMode } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const { openHelp } = useHelp();
  const { toggleSetting } = useAppSettings();

  /// Connection button text.
  const getConnectionButtonText = (): string => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (getOnlineMode()) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  };

  /// Handle abort connecting.
  const handleAbortConnecting = () => {
    setIsAborting(true);
    ConfigRenderer.abortConnecting = true;
  };

  /// Handle connect click.
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
        // Render error alert.
        toast.error('You are offline.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          closeButton: false,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'dark',
          transition: Flip,
          toastId: 'toast-connection', // prevent duplicate alerts
        });
      }
    }
  };

  /// Handle silence notifications.
  const handleSilenceNotifications = () => {
    toggleSetting('setting:silence-os-notifications');
  };

  /// Menu item data.
  const getMenuItems = (): MenuItemData[] => [
    {
      label: 'Accounts',
      disabled: appLoading,
      onClick: () => {
        window.myAPI.openWindow('import');
        window.myAPI.umamiEvent('window-open-accounts', null);
      },
    },
    {
      label: 'Extrinsics',
      disabled: appLoading,
      onClick: () => {
        window.myAPI.openWindow('action');
        window.myAPI.umamiEvent('window-open-extrinsics', null);
      },
    },
    {
      label: 'OpenGov',
      disabled: appLoading,
      onClick: () => {
        window.myAPI.openWindow('openGov');
        window.myAPI.umamiEvent('window-open-openGov', null);
      },
    },
    {
      label: 'Settings',
      disabled: appLoading,
      onClick: () => {
        window.myAPI.openWindow('settings');
        window.myAPI.umamiEvent('window-open-settings', null);
      },
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

  /// Get app flags.
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
