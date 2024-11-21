// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { createContext, useContext } from 'react';
import { defaultCogMenuContext } from './defaults';
import { useAppSettings } from '../AppSettings';
import { useBootstrapping } from '../Bootstrapping';
import { useHelp } from '@app/contexts/common/Help';
import { Flip, toast } from 'react-toastify';
import type { CogMenuContextInterface } from './types';
import type { MenuItemData } from '@polkadot-live/ui/components';

export const CogMenuContext = createContext<CogMenuContextInterface>(
  defaultCogMenuContext
);

export const useCogMenu = () => useContext(CogMenuContext);

export const CogMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    appLoading,
    isAborting,
    isConnecting,
    online: isOnline,
    handleInitializeAppOnline,
    handleInitializeAppOffline,
    setIsAborting,
    setIsConnecting,
  } = useBootstrapping();

  const { openHelp } = useHelp();
  const { handleToggleSilenceOsNotifications, silenceOsNotifications } =
    useAppSettings();

  /// Connection button text.
  const getConnectionButtonText = (): string => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (isOnline) {
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
    } else if (isOnline) {
      await handleInitializeAppOffline();
    } else {
      // Confirm online connection.
      const status: boolean =
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false;

      if (status) {
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
    handleToggleSilenceOsNotifications();

    ConfigRenderer.portToSettings?.postMessage({
      task: 'settings:set:silenceOsNotifications',
      data: {
        silenced: !silenceOsNotifications,
      },
    });
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
    isOnline,
    isAborting,
    isLoading: appLoading,
  });

  return (
    <CogMenuContext.Provider
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
    </CogMenuContext.Provider>
  );
};