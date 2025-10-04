// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Ctx from '../../contexts';
import * as Themes from '@polkadot-live/styles/theme/variables';

import PolkadotIcon from '@polkadot-live/ui/svg/polkadotIcon.svg?react';
import { version } from '../../../../package.json';
import { Classic } from '@theme-toggles/react';
import { useSideNav } from '@polkadot-live/ui/contexts';
import { ScrollWrapper } from '@polkadot-live/ui/styles';
import {
  BackgroundIconWrapper,
  BodyInterfaceWrapper,
  FixedFlexWrapper,
} from '@polkadot-live/styles/wrappers';

const TitlePlaceholder = ({ text }: { text: string }) => (
  <h1 style={{ padding: '2rem', textAlign: 'center' }}>{text}</h1>
);

export const Home = () => {
  const { cacheGet, toggleSetting } = Ctx.useAppSettings();
  const { appLoading } = Ctx.useBootstrapping();
  const cogMenu = Ctx.useCogMenu();
  const sideNav = useSideNav();

  const darkMode = cacheGet('setting:dark-mode') ? true : false;
  const sideNavCollapsed = cacheGet('setting:collapse-side-nav');
  const silenceOsNotifications = cacheGet('setting:silence-os-notifications');

  return (
    <>
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
      <FixedFlexWrapper>
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
              {sideNav.selectedId === 0 && <TitlePlaceholder text="Summary" />}
              {/* Events */}
              {sideNav.selectedId === 1 && <TitlePlaceholder text="Events" />}
              {/* Account Subscriptions */}
              {sideNav.selectedId === 2 && (
                <TitlePlaceholder text="Account Subscriptions" />
              )}
              {/* OpenGov Subscriptions */}
              {sideNav.selectedId === 3 && (
                <TitlePlaceholder text="OpenGov Subscriptions" />
              )}
              {/* Send */}
              {sideNav.selectedId === 4 && <TitlePlaceholder text="Send" />}
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </FixedFlexWrapper>
      <UI.Footer
        bootstrappingCtx={Ctx.useBootstrapping()}
        apiHealthCtx={Ctx.useApiHealth()}
        chainsCtx={Ctx.useChains()}
        connectionsCtx={{
          getOnlineMode: () => navigator.onLine,
          getTheme: () =>
            cacheGet('setting:dark-mode')
              ? Themes.darkTheme
              : Themes.lightTheme,
          cacheGet: (key) =>
            key === 'mode:connected' ? navigator.onLine : false,
        }}
        intervalSubscriptionsCtx={{
          chainHasIntervalSubscriptions: () => false, // TODO
        }}
        subscriptionsCtx={{
          chainHasSubscriptions: () => false, // TODO
        }}
      />
    </>
  );
};
