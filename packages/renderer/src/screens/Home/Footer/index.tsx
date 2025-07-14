// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Accordion from '@radix-ui/react-accordion';
import * as FA from '@fortawesome/free-solid-svg-icons';

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { getEcosystemChainMap } from '@polkadot-live/consts/chains';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useBootstrapping,
  useChains,
  useIntervalSubscriptions,
  useSubscriptions,
} from '@ren/contexts/main';
import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import { FooterWrapper, NetworkItem } from './Wrapper';
import { SelectRpc } from './SelectRpc';
import { FlexColumn, FlexRow, ScrollWrapper } from '@polkadot-live/ui/styles';
import { PuffLoader } from 'react-spinners';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import type { EcosystemID } from 'packages/types/src/chains';
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

  const { getOnlineMode, getTheme, cacheGet } = useConnections();
  const isConnected = cacheGet('mode:connected');
  const theme = getTheme();

  const { chainHasIntervalSubscriptions } = useIntervalSubscriptions();
  const { chainHasSubscriptions } = useSubscriptions();

  // Flag controlling whether footer is expanded.
  const [expanded, setExpanded] = useState<boolean>(false);
  const [accordionValue, setAccordionValue] = useState<EcosystemID[]>([
    'Polkadot',
  ]);

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
        <div>
          {connectionsCount() ? (
            <FontAwesomeIcon icon={FA.faCircle} transform="shrink-6" />
          ) : (
            <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
          )}
        </div>

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

          {expanded && (
            <UI.AccordionWrapper>
              <Accordion.Root
                className="AccordionRoot"
                type="multiple"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as EcosystemID[])}
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
                          {[...chains.entries()]
                            .filter(([chainId]) =>
                              chainId.startsWith(ecosystemId)
                            )
                            .map(([chainId, apiData]) => (
                              <NetworkItem key={`${chainId}`}>
                                <div className="left">
                                  <h4>{chainId}</h4>
                                </div>
                                <div className="right">
                                  <FlexRow $gap={'1.5rem'}>
                                    {/* RPC select box */}
                                    <SelectRpc
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
                                          onClick={async () =>
                                            await onDisconnectClick(
                                              apiData.chainId
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
                            ))}
                        </UI.AccordionContent>
                      </Accordion.Item>
                    )
                  )}
                </FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          )}
        </section>
      </ScrollWrapper>
    </FooterWrapper>
  );
};
