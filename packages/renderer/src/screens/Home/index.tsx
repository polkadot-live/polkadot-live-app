// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui';
import * as Ctx from '../../contexts/main';
import { version } from '../../../package.json';
import {
  initExtrinsicElectron,
  fetchSendAccountsElectron,
  getSpendableBalanceElectron,
} from '@polkadot-live/core';
import { useEffect, useState } from 'react';
import { useInitIpcHandlers } from '../../hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '../../hooks/useMainMessagePorts';
import {
  useAddresses,
  useAppSettings,
  useConnections,
  useHelp,
  useSendNative,
  useSideNav,
} from '@polkadot-live/contexts';
import { Classic } from '@theme-toggles/react';
import {
  ChainEvents,
  Events,
  Footer,
  Manage,
  OpenGovHome,
  Send,
  Summary,
} from '@polkadot-live/screens';
import {
  BackgroundIconWrapper,
  BodyInterfaceWrapper,
  FixedFlexWrapper,
  ScrollWrapper,
} from '@polkadot-live/styles/wrappers';
import PolkadotIcon from '@polkadot-live/ui/svg/polkadotIcon.svg?react';
import { GITHUB_LATEST_RELEASE_URL } from '@polkadot-live/consts';

export const Home = () => {
  useMainMessagePorts();
  useInitIpcHandlers();

  const { getAddresses } = useAddresses();
  const { cacheGet, toggleSetting } = useAppSettings();
  const { openHelp } = useHelp();
  const {
    cacheGet: getSharedState,
    getTheme,
    openInBrowser,
  } = useConnections();

  const { appLoading } = Ctx.useBootstrapping();
  const cogMenu = Ctx.useCogMenu();
  const sideNav = useSideNav();

  const darkMode = getSharedState('mode:dark');
  const dockToggled = cacheGet('setting:docked-window');
  const sideNavCollapsed = cacheGet('setting:collapse-side-nav');
  const silenceOsNotifications = cacheGet('setting:silence-os-notifications');
  const theme = getTheme();

  const [platform, setPlatform] = useState<string | null>(null);

  const onClickTag = () => {
    openInBrowser(GITHUB_LATEST_RELEASE_URL);
  };

  const onDockToggle = () => {
    if (platform === 'linux') {
      return;
    }
    toggleSetting('setting:docked-window');
    const event = `setting-toggle-${!dockToggled ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: 'dock-window' });
  };

  const onMinimizeWindow = () => {
    window.myAPI.minimizeWindow(window.myAPI.getWindowId());
  };

  useEffect(() => {
    const initTasks = async () => {
      const osPlatform = await window.myAPI.getOsPlatform();
      setPlatform(osPlatform);
    };
    initTasks();
  }, []);

  useEffect(() => {
    // Show disclaimer on initial launch.
    const disclaimerTask = async () => {
      const showDisclaimer = await window.myAPI.getShowDisclaimer();
      showDisclaimer && openHelp('help:docs:disclaimer');
    };
    if (!appLoading) {
      disclaimerTask();
    }
  }, [appLoading]);

  return (
    <>
      <UI.Header
        theme={theme}
        ToggleNode={
          <Classic
            toggled={darkMode}
            onToggle={() => {
              window.myAPI.relaySharedState('mode:dark', !darkMode);
              toggleSetting('setting:dark-mode');
            }}
            className="theme-toggle"
            duration={300}
          />
        }
        appLoading={appLoading}
        dockToggled={dockToggled}
        showButtons={true}
        showDock={String(platform) !== 'linux'}
        showMinimize={String(platform) === 'linux'}
        onClickTag={onClickTag}
        onDockToggle={onDockToggle}
        onMinimizeWindow={onMinimizeWindow}
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

      <FixedFlexWrapper>
        {/* Side Navigation */}
        <UI.SideNav
          theme={theme}
          handleSideNavCollapse={() =>
            toggleSetting('setting:collapse-side-nav')
          }
          navState={{
            isCollapsed: sideNavCollapsed,
            selectedId: sideNav.selectedId,
            setSelectedId: sideNav.setSelectedId,
          }}
        />

        <BodyInterfaceWrapper $maxHeight>
          <BackgroundIconWrapper>
            <PolkadotIcon width={175} opacity={appLoading ? 0.01 : 0.02} />
          </BackgroundIconWrapper>

          {appLoading ? (
            <div className="app-loading">
              <UI.GridSpinner />
              <p>Loading Polkadot Live</p>
            </div>
          ) : (
            <ScrollWrapper>
              {/* Summary */}
              {sideNav.selectedId === 0 && <Summary />}

              {/* Events */}
              {sideNav.selectedId === 1 && <Events />}

              {/* Chain Events */}
              {sideNav.selectedId === 2 && <ChainEvents />}

              {/* Account Subscriptions */}
              {sideNav.selectedId === 3 && (
                <Manage addresses={getAddresses()} />
              )}

              {/* OpenGov Subscriptions */}
              {sideNav.selectedId === 4 && <OpenGovHome />}

              {/* Send */}
              {sideNav.selectedId === 5 && (
                <Send
                  useSendNative={useSendNative}
                  initExtrinsic={initExtrinsicElectron}
                  fetchSendAccounts={fetchSendAccountsElectron}
                  getSpendableBalance={getSpendableBalanceElectron}
                />
              )}
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </FixedFlexWrapper>
      <Footer />
    </>
  );
};
