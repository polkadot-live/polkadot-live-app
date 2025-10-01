// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import { version } from '../../../../package.json';
import { Classic } from '@theme-toggles/react';
import { useAppSettings, useCogMenu } from '../../contexts';

export const Home = () => {
  const { cacheGet, toggleSetting } = useAppSettings();
  const cogMenu = useCogMenu();
  const darkMode = cacheGet('setting:dark-mode') ? true : false;
  const silenceOsNotifications = cacheGet('setting:silence-os-notifications');

  return (
    <UI.Header
      ToggleNode={
        <Classic
          toggled={darkMode}
          onToggle={() => toggleSetting('setting:dark-mode')}
          className="theme-toggle"
          duration={300}
        />
      }
      appLoading={true}
      showButtons={true}
      version={version}
    >
      {/* Logic in cog menu context */}
      <UI.Menu
        appFlags={cogMenu.getAppFlags()}
        connectLabel={cogMenu.getConnectionButtonText()}
        menuItems={cogMenu.getMenuItems()}
        onConnectClick={cogMenu.handleConnectClick}
        onSilenceNotifications={cogMenu.handleSilenceNotifications}
        silenceOsNotifications={silenceOsNotifications}
      />
    </UI.Header>
  );
};
