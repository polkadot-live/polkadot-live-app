// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@ren/renderer/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { APIsController } from '@ren/controller/APIsController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useChains } from '@app/contexts/main/Chains';
import { useConnections } from '@app/contexts/common/Connections';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { useState } from 'react';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { FooterWrapper, NetworkItem } from './Wrapper';
import { getIcon } from '@ren/utils/RenderingUtils';
import { SelectRpc } from './RpcSelect';
import { FlexRow } from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import { PuffLoader } from 'react-spinners';
import type { ChainID, ChainStatus } from '@polkadot-live/types/chains';

export const Footer = () => {
  const { appLoading, isConnecting, isAborting } = useBootstrapping();
  const {
    chains,
    dedotChains,
    isWorking,
    onConnectClick,
    onDisconnectClick,
    setWorkingEndpoint,
    showWorkingSpinner,
  } = useChains();

  const {
    getOnlineMode,
    darkMode,
    isBuildingExtrinsic,
    isImporting,
    isImportingAccount,
  } = useConnections();

  const { chainHasIntervalSubscriptions } = useIntervalSubscriptions();
  const { chainHasSubscriptions } = useSubscriptions();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Flag controlling whether footer is expanded.
  const [expanded, setExpanded] = useState<boolean>(false);

  // Get legacy polkadot.js chain connections count.
  const connectionsCount = () =>
    Array.from(chains.values()).filter(({ status }) => status === 'connected')
      .length;

  // Get header text.
  const getHeadingText = () => {
    if (getOnlineMode() && !isConnecting && !isAborting) {
      const connections = dedotConnectionsCount() + connectionsCount();
      return `Connected to ${connections} network${connections === 1 ? '' : 's'}`;
    } else {
      return 'Offline';
    }
  };

  // Method to determine whether an API can be disconnected.
  const allowDisconnect = (chainId: ChainID, status: ChainStatus) =>
    appLoading ||
    status === 'disconnected' ||
    isBuildingExtrinsic ||
    isImporting ||
    isImportingAccount
      ? false
      : !chainHasSubscriptions(chainId) &&
        !chainHasIntervalSubscriptions(chainId);

  // Method to get API disconnect button tooltip.
  const getTooltipText = (chainId: ChainID, status: ChainStatus) =>
    status === 'disconnected'
      ? 'Disconnected'
      : chainHasSubscriptions(chainId) || chainHasIntervalSubscriptions(chainId)
        ? 'Subscriptions Active'
        : !allowDisconnect(chainId, status)
          ? 'In-Use'
          : 'Disconnect';

  // Handle disconnecting from a chain API.
  const handleDisconnect = async (chainId: ChainID) =>
    await APIsController.close(chainId);

  // Dedot helpers.
  const dedotConnectTooltip = (status: string) =>
    status === 'connected' ? 'Connected' : 'Connect';

  const dedotDisconnectTooltip = (status: string) =>
    status === 'disconnected' ? 'Disconnected' : 'Disconnect';

  const dedotConnectionsCount = () =>
    Array.from(dedotChains.values()).filter(
      ({ status }) => status === 'connected'
    ).length;

  return (
    <FooterWrapper className={expanded ? 'expanded' : undefined}>
      <section className="status">
        {connectionsCount() ? (
          <FontAwesomeIcon icon={FA.faCircle} transform="shrink-6" />
        ) : (
          <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
        )}

        <div>
          <h5>{getHeadingText()}</h5>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon
            icon={expanded ? FA.faAngleDown : FA.faAngleUp}
            transform="grow-0"
          />
        </button>
      </section>

      {/* Dedot Connections */}
      <section className="network-list-wrapper">
        <FlexRow $gap={'0.7rem'}>
          <h3>Dedot</h3>
          {showWorkingSpinner() && (
            <div style={{ position: 'relative' }}>
              <PuffLoader
                size={16}
                style={{ position: 'absolute', top: '-10px' }}
                color={'var(--text-color-primary)'}
              />
            </div>
          )}
        </FlexRow>
        {expanded &&
          [...dedotChains.entries()].map(([chainId, apiData]) => (
            <NetworkItem key={`${chainId}_dedot_network`}>
              <div className="left">
                {getIcon(chainId, 'icon')}
                <h4>{chainId}</h4>
              </div>
              <div className="right">
                <FlexRow $gap={'1.5rem'}>
                  {/* RPC select box */}
                  <SelectRpc
                    apiData={apiData}
                    apiBackend="dedot"
                    setWorkingEndpoint={setWorkingEndpoint}
                    disabled={isWorking(chainId)}
                  />

                  {/* Connect button */}
                  <div className="connect">
                    <TooltipRx
                      text={dedotConnectTooltip(apiData.status)}
                      side="top"
                      style={{ zIndex: 99 }}
                      theme={theme}
                    >
                      <button
                        onClick={async () => await onConnectClick(chainId)}
                        disabled={
                          apiData.status === 'connected' || isWorking(chainId)
                        }
                      >
                        <FontAwesomeIcon
                          icon={FA.faPlug}
                          transform={'grow-2'}
                        />
                      </button>
                    </TooltipRx>
                  </div>

                  {/* Disconnect button */}
                  <div className="disconnect">
                    <TooltipRx
                      text={dedotDisconnectTooltip(apiData.status)}
                      side="top"
                      style={{ zIndex: 99 }}
                      theme={theme}
                    >
                      <button
                        onClick={async () =>
                          await onDisconnectClick(apiData.chainId)
                        }
                        disabled={
                          apiData.status === 'disconnected' ||
                          isWorking(chainId)
                        }
                      >
                        <FontAwesomeIcon
                          icon={FA.faCircleXmark}
                          transform={'grow-2'}
                        />
                      </button>
                    </TooltipRx>
                  </div>
                </FlexRow>
              </div>
            </NetworkItem>
          ))}
      </section>

      {/* Polkadit.js Connections */}
      <section className="network-list-wrapper">
        <h3>Polkadot.js</h3>
        {expanded &&
          [...chains.entries()].map(([chainId, apiData]) => (
            <NetworkItem key={`${chainId}_network`}>
              <div className="left">
                {getIcon(chainId, 'icon')}
                <h4>{chainId}</h4>
              </div>
              <div className="right">
                <FlexRow $gap={'1.5rem'}>
                  {/* RPC select box */}
                  <SelectRpc
                    apiData={apiData}
                    apiBackend="polkadot.js"
                    disabled={false}
                  />

                  {/* Disconnect button */}
                  <div className="disconnect">
                    <TooltipRx
                      text={getTooltipText(chainId, apiData.status)}
                      side="left"
                      style={{ zIndex: 99 }}
                      theme={theme}
                    >
                      <button
                        onClick={async () => await handleDisconnect(chainId)}
                        disabled={!allowDisconnect(chainId, apiData.status)}
                      >
                        <FontAwesomeIcon
                          icon={FA.faCircleXmark}
                          transform={'grow-2'}
                        />
                      </button>
                    </TooltipRx>
                  </div>
                </FlexRow>
              </div>
            </NetworkItem>
          ))}
      </section>
    </FooterWrapper>
  );
};
