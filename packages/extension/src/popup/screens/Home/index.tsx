// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui';
import * as Ctx from '../../contexts';
import PolkadotIcon from '@polkadot-live/ui/svg/polkadotIcon.svg?react';
import { GITHUB_LATEST_RELEASE_URL } from '@polkadot-live/consts';
import { useEffect } from 'react';
import { version } from '../../../../package.json';
import { Classic } from '@theme-toggles/react';
import {
  Events,
  Footer,
  OpenGovHome,
  Manage,
  Send,
  Summary,
  ChainEvents,
} from '@polkadot-live/screens';
import {
  useAddresses,
  useConnections,
  useAppSettings,
  useSendNative,
  useSideNav,
  useHelp,
} from '@polkadot-live/contexts';
import {
  fetchSendAccountsBrowser,
  getSpendableBalanceBrowser,
} from '@polkadot-live/core';
import {
  BackgroundIconWrapper,
  BodyInterfaceWrapper,
  FixedFlexWrapper,
  ScrollWrapper,
} from '@polkadot-live/styles/wrappers';

export const Home = () => {
  const { openHelp } = useHelp();
  const { getAddresses } = useAddresses();
  const { cacheGet, toggleSetting } = useAppSettings();
  const {
    cacheGet: getShared,
    getTheme,
    openInBrowser,
    relayState,
  } = useConnections();

  const { appLoading } = Ctx.useBootstrapping();
  const cogMenu = Ctx.useCogMenu();
  const sideNav = useSideNav();

  const darkMode = getShared('mode:dark') ? true : false;
  const sideNavCollapsed = cacheGet('setting:collapse-side-nav');
  const silenceOsNotifications = cacheGet('setting:silence-os-notifications');
  const theme = getTheme();

  const toggleTheme = () => {
    relayState('mode:dark', !darkMode);
    toggleSetting('setting:dark-mode');
  };

  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: 'settings', task: 'showDisclaimer' })
      .then((res: boolean) => res && openHelp('help:docs:disclaimer'));
  }, []);

  return (
    <>
      <UI.Header
        theme={theme}
        ToggleNode={
          <Classic
            toggled={darkMode}
            onToggle={() => toggleTheme()}
            className="theme-toggle"
            duration={300}
          />
        }
        onClickTag={() => openInBrowser(GITHUB_LATEST_RELEASE_URL)}
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
      <FixedFlexWrapper>
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
            <PolkadotIcon width={175} opacity={0.04} />
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
                  fetchSendAccounts={fetchSendAccountsBrowser}
                  initExtrinsic={async (actionMeta) => {
                    relayState('extrinsic:building', true);
                    chrome.runtime.sendMessage({
                      type: 'extrinsics',
                      task: 'initTxRelay',
                      payload: { actionMeta },
                    });
                  }}
                  getSpendableBalance={getSpendableBalanceBrowser}
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
