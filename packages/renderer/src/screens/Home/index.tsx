// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import { version } from '../../../package.json';
import { ConfigRenderer } from '@polkadot-live/core';
import { useEffect, useState } from 'react';
import {
  useAddresses,
  useAppSettings,
  useBootstrapping,
  useCogMenu,
  useEvents,
} from '@ren/contexts/main';
import { useConnections, useHelp } from '@ren/contexts/common';
import { useInitIpcHandlers } from '@ren/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@ren/hooks/useMainMessagePorts';
import { Classic } from '@theme-toggles/react';
import { Events } from './Events';
import { Footer } from './Footer';
import { Manage } from './Manage';
import { Send } from './Send';
import { Summary } from '@ren/screens/Home/Summary';
import { FixedFlexWrapper, IconWrapper } from './Wrappers';
import { BodyInterfaceWrapper } from '@ren/Wrappers';
import { ScrollWrapper } from '@polkadot-live/ui/styles';
import { useSideNav } from '@polkadot-live/ui/contexts';
import PolkadotIcon from '@polkadot-live/ui/svg/polkadotIcon.svg?react';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { IpcRendererEvent } from 'electron';

export const Home = () => {
  // Set up port communication for the `main` renderer.
  useMainMessagePorts();

  // Set up app initialization and online/offline switching handlers.
  useInitIpcHandlers();

  const { getAddresses } = useAddresses();
  const { addEvent, markStaleEvent, removeOutdatedEvents } = useEvents();
  const { darkMode } = useConnections();
  const { openHelp } = useHelp();

  const { cacheGet, toggleSetting } = useAppSettings();
  const dockToggled = cacheGet('setting:docked-window');
  const sideNavCollapsed = cacheGet('setting:collapse-side-nav');
  const silenceOsNotifications = cacheGet('setting:silence-os-notifications');

  const { appLoading } = useBootstrapping();
  const cogMenu = useCogMenu();
  const sideNav = useSideNav();

  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Listen for port task relays from main process.
    window.myAPI.relayTask(
      (
        _: IpcRendererEvent,
        windowId: string,
        task: string,
        serData: string
      ) => {
        switch (windowId) {
          case 'action': {
            ConfigRenderer.portToAction?.postMessage({
              task,
              data: serData,
            });
            break;
          }
          case 'import': {
            ConfigRenderer.portToImport?.postMessage({
              task,
              data: serData,
            });
            break;
          }
          case 'openGov': {
            ConfigRenderer.portToOpenGov?.postMessage({
              task,
              data: serData,
            });
            break;
          }
          case 'settings': {
            ConfigRenderer.portToSettings?.postMessage({
              task,
              data: serData,
            });
            break;
          }
          default: {
            return;
          }
        }
      }
    );

    // Listen for event callbacks.
    window.myAPI.reportNewEvent(
      (_: IpcRendererEvent, eventData: EventCallback) => {
        // Remove any outdated events in the state, if setting enabled.
        if (!ConfigRenderer.keepOutdatedEvents) {
          removeOutdatedEvents(eventData);
        }

        // Add received event to state.
        addEvent({ ...eventData });
      }
    );

    // Listen for stale events.
    window.myAPI.reportStaleEvent(
      (_: IpcRendererEvent, uid: string, chainId: ChainID) => {
        markStaleEvent(uid, chainId);
      }
    );

    // Async tasks.
    const initTasks = async () => {
      // Get OS platform.
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

  /// Handle header dock toggle.
  // TODO: Move to file.
  const onDockToggle = () => {
    if (platform === 'linux') {
      return;
    }

    toggleSetting('setting:docked-window');

    // Analytics.
    const event = `setting-toggle-${!dockToggled ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: 'dock-window' });
  };

  /// Handle minimize window button click.
  // TODO: Move to file.
  const onMinimizeWindow = () => {
    window.myAPI.minimizeWindow(window.myAPI.getWindowId());
  };

  return (
    <>
      <UI.Header
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
          <IconWrapper>
            <PolkadotIcon width={175} opacity={appLoading ? 0.01 : 0.02} />
          </IconWrapper>

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

              {/* Subscribe */}
              {sideNav.selectedId === 2 && (
                <Manage addresses={getAddresses()} />
              )}

              {/* Send */}
              {sideNav.selectedId === 3 && <Send />}
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </FixedFlexWrapper>
      <Footer />
    </>
  );
};
