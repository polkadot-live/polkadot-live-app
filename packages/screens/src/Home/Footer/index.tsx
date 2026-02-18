// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEcosystemChainMap } from '@polkadot-live/consts/chains';
import {
  useApiHealth,
  useChainEvents,
  useChains,
  useConnections,
  useContextProxy,
  useIntervalSubscriptions,
  useSubscriptions,
} from '@polkadot-live/contexts';
import { FlexColumn, FlexRow, ScrollWrapper } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { PuffLoader } from 'react-spinners';
import { SelectRpc } from './SelectRpc';
import { FooterWrapper, NetworkItem } from './Wrapper';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';
import type { EcosystemID } from '@polkadot-live/types/chains';

export const Footer = () => {
  const { useCtx } = useContextProxy();
  const { appLoading, isConnecting, isAborting } = useCtx('BootstrappingCtx')();
  const { onDisconnectClick, setWorkingEndpoint } = useChains();
  const { isApiRequired } = useChainEvents();
  const { getOnlineMode, getTheme, cacheGet } = useConnections();
  const { chainHasSubscriptions } = useSubscriptions();

  const { chains, isWorking, onConnectClick, showWorkingSpinner } = useChains();
  const { chainHasIntervalSubscriptions } = useIntervalSubscriptions();
  const {
    failedConnections,
    footerIsExpanded,
    hasConnectionIssue,
    onEndpointChange,
    setFooterIsExpanded,
    setReconnectDialogOpen,
  } = useApiHealth();

  const numFailed = failedConnections.size;
  const isConnected = getOnlineMode();
  const theme = getTheme();

  const [accordionValue, setAccordionValue] = useState<EcosystemID | ''>('');

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
    cacheGet('account:importing') ||
    cacheGet('backup:importing') ||
    cacheGet('extrinsic:building')
      ? false
      : !chainHasSubscriptions(chainId) &&
        !chainHasIntervalSubscriptions(chainId) &&
        !isApiRequired(chainId);

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

  const getApiDataFor = (ecosystemId: EcosystemID) =>
    [...chains.entries()].filter(([chainId]) =>
      chainId.startsWith(ecosystemId),
    );

  const hasActiveApi = (ecosystemId: EcosystemID): boolean =>
    [...chains.entries()]
      .filter(([chainId]) => chainId.startsWith(ecosystemId))
      .some(([, apiData]) => apiData.status === 'connected');

  const connectionIssueFor = (ecosystemId: EcosystemID): boolean =>
    failedConnections.keys().some((k) => k.startsWith(ecosystemId));

  return (
    <FooterWrapper className={footerIsExpanded ? 'expanded' : undefined}>
      <section className="status">
        <div>
          {connectionsCount() ? (
            <FontAwesomeIcon icon={FA.faCircle} transform="shrink-6" />
          ) : (
            <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
          )}
        </div>

        <FlexRow className="Header">
          <h5>{getHeadingText()}</h5>
          {numFailed > 0 && (
            <UI.TooltipRx
              side="top"
              style={{ zIndex: 99 }}
              text={`${numFailed} Failed Connection${numFailed !== 1 ? 's' : ''}`}
              theme={theme}
            >
              <FontAwesomeIcon
                className="fade-loop---slow warn"
                transform={'grow-3'}
                icon={FA.faTriangleExclamation}
              />
            </UI.TooltipRx>
          )}
        </FlexRow>
        <UI.TooltipRx
          side="top"
          style={{ zIndex: 99 }}
          text={'Reconnect'}
          theme={theme}
        >
          <button
            type="button"
            style={{ paddingRight: 0 }}
            onClick={() => {
              setFooterIsExpanded(false);
              setReconnectDialogOpen(true);
            }}
          >
            <FontAwesomeIcon icon={FA.faPlugCircleExclamation} />
          </button>
        </UI.TooltipRx>
        <button
          type="button"
          onClick={() => setFooterIsExpanded(!footerIsExpanded)}
        >
          <FontAwesomeIcon
            icon={footerIsExpanded ? FA.faAngleDown : FA.faAngleUp}
            transform="grow-0"
          />
        </button>
      </section>

      {/* Dedot Connections */}
      {footerIsExpanded && (
        <ScrollWrapper>
          <section className="network-list-wrapper">
            <FlexRow $gap={'0.7rem'} className="TopHeading">
              <FontAwesomeIcon icon={FA.faGlobe} transform={'shrink-1'} />
              <h3>Networks</h3>
              {showWorkingSpinner() && (
                <div className="Spinner">
                  <PuffLoader size={16} color={'var(--text-color-primary)'} />
                </div>
              )}
            </FlexRow>

            <UI.AccordionWrapper>
              <Accordion.Root
                className="AccordionRoot"
                type="single"
                collapsible={true}
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as EcosystemID)}
              >
                <FlexColumn $rowGap={'2px'}>
                  {[...getEcosystemChainMap().entries()].map(
                    ([ecosystemId, chainIds]) => (
                      <Accordion.Item
                        key={`${ecosystemId}`}
                        className="AccordionItem AccordionItemNetwork"
                        value={ecosystemId}
                      >
                        <UI.AccordionTrigger
                          narrow={false}
                          height={'auto'}
                          className="AccordionTriggerNetwork"
                        >
                          <FlexRow style={{ width: '100%' }}>
                            <UI.ChainIcon
                              width={12}
                              chainId={chainIds[0] || 'Polkadot Relay'}
                            />
                            <UI.TriggerHeader style={{ flex: 1 }}>
                              {ecosystemId}
                            </UI.TriggerHeader>

                            {connectionIssueFor(ecosystemId) && (
                              <FontAwesomeIcon
                                className="fade-loop---slow warn"
                                icon={FA.faTriangleExclamation}
                                transform={'grow-3'}
                              />
                            )}
                            {hasActiveApi(ecosystemId) && (
                              <FontAwesomeIcon
                                icon={FA.faCircle}
                                className="fade-loop--slow success"
                              />
                            )}
                            <ChevronDownIcon
                              className="AccordionChevron"
                              aria-hidden
                            />
                          </FlexRow>
                        </UI.AccordionTrigger>
                        <UI.AccordionContent
                          transparent={true}
                          className={'AccordionContentNetwork'}
                        >
                          {getApiDataFor(ecosystemId).map(
                            ([chainId, apiData]) => (
                              <NetworkItem key={`${chainId}`}>
                                <div className="left">
                                  <h4>{chainId}</h4>

                                  {hasConnectionIssue(chainId) && (
                                    <FontAwesomeIcon
                                      className="fade-loop--slow warn"
                                      style={{
                                        paddingLeft: '0.1rem',
                                        marginTop: '-2px',
                                      }}
                                      transform={'grow-2'}
                                      icon={FA.faTriangleExclamation}
                                    />
                                  )}
                                </div>
                                <div className="right">
                                  <FlexRow $gap={'1.5rem'}>
                                    {/* RPC select box */}
                                    <SelectRpc
                                      onEndpointChange={onEndpointChange}
                                      cacheGet={cacheGet}
                                      apiData={apiData}
                                      setWorkingEndpoint={setWorkingEndpoint}
                                      disabled={
                                        isWorking(chainId) || !isConnected
                                      }
                                    />

                                    {/* Connect button */}
                                    <div className="connect">
                                      <UI.TooltipRx
                                        text={connectTooltip(apiData)}
                                        side="top"
                                        style={{ zIndex: 99 }}
                                        theme={theme}
                                      >
                                        <button
                                          type="button"
                                          onClick={async () =>
                                            await onConnectClick(chainId)
                                          }
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
                                      </UI.TooltipRx>
                                    </div>

                                    {/* Disconnect button */}
                                    <div className="disconnect">
                                      <UI.TooltipRx
                                        text={disconnectTooltip(apiData)}
                                        side="top"
                                        style={{ zIndex: 99 }}
                                        theme={theme}
                                      >
                                        <button
                                          type="button"
                                          onClick={async () =>
                                            await onDisconnectClick(
                                              apiData.chainId,
                                            )
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
                                      </UI.TooltipRx>
                                    </div>
                                  </FlexRow>
                                </div>
                              </NetworkItem>
                            ),
                          )}
                        </UI.AccordionContent>
                      </Accordion.Item>
                    ),
                  )}
                </FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          </section>
        </ScrollWrapper>
      )}
    </FooterWrapper>
  );
};
