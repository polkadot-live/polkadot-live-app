// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  createSafeContextHook,
  useAppSettings,
  useConnections,
  useHelp,
} from '@polkadot-live/contexts';
import { renderToast } from '@polkadot-live/ui';
import { createContext } from 'react';
import { useBootstrapping } from '../Bootstrapping';
import type { TabData } from '@polkadot-live/types/communication';
import type { MenuItemData } from '@polkadot-live/types/menu';
import type { CogMenuContextInterface } from './types';

export const CogMenuContext = createContext<
  CogMenuContextInterface | undefined
>(undefined);

export const useCogMenu = createSafeContextHook(
  CogMenuContext,
  'CogMenuContext',
);

export const CogMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { cacheGet, getOnlineMode } = useConnections();
  const isConnected = cacheGet('mode:connected');

  const { openHelp } = useHelp();
  const { toggleSetting } = useAppSettings();
  const { initAppOffline, initAppOnline, setIsAborting } = useBootstrapping();
  const { appLoading, isAborting, isConnecting } = useBootstrapping();

  // Open tab page.
  const onOpenTab = async (route: string, label: string) => {
    const tabData: TabData = { id: -1, viewId: route, label };
    const data = { type: 'tabs', task: 'openTabRelay', payload: { tabData } };
    await chrome.runtime.sendMessage(data);
    window.close();
  };

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
  };

  // Handle connect click.
  const handleConnectClick = async () => {
    if (isConnecting || appLoading) {
      handleAbortConnecting();
    } else if (getOnlineMode()) {
      await initAppOffline();
    } else {
      // Confirm online connection.
      if (isConnected) {
        await initAppOnline();
      } else {
        renderToast('You Are Offline', 'toast-connect', 'error', 'top-center');
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
      onClick: () => onOpenTab('import', 'Accounts'),
    },
    {
      label: 'Extrinsics',
      disabled: appLoading,
      onClick: () => onOpenTab('action', 'Extrinsics'),
    },
    {
      label: 'OpenGov',
      disabled: appLoading,
      onClick: () => onOpenTab('openGov', 'OpenGov'),
    },
    {
      label: 'Settings',
      disabled: appLoading,
      appendSeparator: true,
      onClick: () => onOpenTab('settings', 'Settings'),
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
