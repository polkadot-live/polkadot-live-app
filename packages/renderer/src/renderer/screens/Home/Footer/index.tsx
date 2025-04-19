// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '@ren/renderer/theme/variables';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
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
import type { FlattenedAPIData } from '@polkadot-live/types/apis';

export const Footer = () => {
  const { appLoading, isConnecting, isAborting } = useBootstrapping();
  const {
    chains,
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
    isConnected,
    isImporting,
    isImportingAccount,
  } = useConnections();

  const { chainHasIntervalSubscriptions } = useIntervalSubscriptions();
  const { chainHasSubscriptions } = useSubscriptions();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Flag controlling whether footer is expanded.
  const [expanded, setExpanded] = useState<boolean>(false);

  // Get number of connected APIs.
  const connectionsCount = () =>
    Array.from(chains.values()).filter(({ status }) => status === 'connected')
      .length;

  // Get header text.
  const getHeadingText = () => {
    if (getOnlineMode() && !isConnecting && !isAborting) {
      const connections = connectionsCount();
      return `Connected to ${connections} network${connections === 1 ? '' : 's'}`;
    } else {
      return 'Offline';
    }
  };

  // Determine whether an API can be disconnected.
  const allowDisconnect = ({ chainId, status }: FlattenedAPIData) =>
    appLoading ||
    status === 'disconnected' ||
    isBuildingExtrinsic ||
    isImporting ||
    isImportingAccount
      ? false
      : !chainHasSubscriptions(chainId) &&
        !chainHasIntervalSubscriptions(chainId);

  // Get API disconnect button tooltip.
  const disconnectTooltip = (flattened: FlattenedAPIData) => {
    const { chainId, status } = flattened;
    return status === 'disconnected'
      ? 'Disconnected'
      : chainHasSubscriptions(chainId) || chainHasIntervalSubscriptions(chainId)
        ? 'Subscriptions Active'
        : !allowDisconnect(flattened)
          ? 'In-Use'
          : 'Disconnect';
  };

  // Helpers.
  const connectTooltip = ({ status }: FlattenedAPIData) =>
    status === 'connected' ? 'Connected' : 'Connect';

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
          [...chains.entries()].map(([chainId, apiData]) => (
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
                    setWorkingEndpoint={setWorkingEndpoint}
                    disabled={isWorking(chainId) || !isConnected}
                  />

                  {/* Connect button */}
                  <div className="connect">
                    <TooltipRx
                      text={connectTooltip(apiData)}
                      side="top"
                      style={{ zIndex: 99 }}
                      theme={theme}
                    >
                      <button
                        onClick={async () => await onConnectClick(chainId)}
                        disabled={
                          apiData.status === 'connected' ||
                          isWorking(chainId) ||
                          !isConnected
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
                      text={disconnectTooltip(apiData)}
                      side="top"
                      style={{ zIndex: 99 }}
                      theme={theme}
                    >
                      <button
                        onClick={async () =>
                          await onDisconnectClick(apiData.chainId)
                        }
                        disabled={
                          !allowDisconnect(apiData) ||
                          isWorking(chainId) ||
                          !isConnected
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
    </FooterWrapper>
  );
};
