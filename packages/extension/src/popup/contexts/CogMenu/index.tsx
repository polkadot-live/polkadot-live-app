// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import { createSafeContextHook, renderToast } from '@polkadot-live/ui/utils';
import { useAppSettings } from '../AppSettings';
import { useBootstrapping } from '../Bootstrapping';
import { useHelp } from '@polkadot-live/ui/contexts';
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
  const { openHelp } = useHelp();
  const { toggleSetting } = useAppSettings();
  const { initAppOffline, initAppOnline, setIsAborting } = useBootstrapping();
  const { appLoading, isAborting, isConnected, isConnecting, isOnlineMode } =
    useBootstrapping();

  /**
   * Open tab page.
   */
  const onOpenTab = () => {
    const url = chrome.runtime.getURL('src/tab/index.html');
    chrome.tabs.create({ url });
  };

  /**
   * Connection button text.
   */
  const getConnectionButtonText = (): string => {
    if (isConnecting || appLoading) {
      return 'Abort';
    } else if (isOnlineMode) {
      return 'Disconnect';
    } else {
      return 'Connect';
    }
  };

  /**
   * Handle abort connecting.
   */
  const handleAbortConnecting = () => {
    setIsAborting(true);
  };

  /**
   * Handle connect click.
   */
  const handleConnectClick = async () => {
    if (isConnecting || appLoading) {
      handleAbortConnecting();
    } else if (isOnlineMode) {
      await initAppOffline();
    } else {
      // Confirm online connection.
      if (isConnected) {
        await initAppOnline();
      } else {
        renderToast('You are offline.', 'toast-connect', 'error', 'top-center');
      }
    }
  };

  /**
   * Handle silence notifications.
   */
  const handleSilenceNotifications = () => {
    toggleSetting('setting:silence-os-notifications');
  };

  /**
   * Menu item data.
   */
  const getMenuItems = (): MenuItemData[] => [
    {
      label: 'Accounts',
      disabled: appLoading,
      onClick: () => onOpenTab(),
    },
    {
      label: 'Extrinsics',
      disabled: appLoading,
      onClick: () => onOpenTab(),
    },
    {
      label: 'OpenGov',
      disabled: appLoading,
      onClick: () => onOpenTab(),
    },
    {
      label: 'Settings',
      disabled: appLoading,
      appendSeparator: true,
      onClick: () => onOpenTab(),
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

  /**
   * Get app flags.
   */
  const getAppFlags = () => ({
    isConnecting,
    isOnline: isOnlineMode,
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
