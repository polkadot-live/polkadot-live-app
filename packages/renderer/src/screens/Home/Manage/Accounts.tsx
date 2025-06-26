// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import { ChainIcon, Identicon } from '@polkadot-live/ui/components';
import { ItemEntryWrapper, ItemsColumn } from './Wrappers';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { NoAccounts, NoOpenGov } from '../NoAccounts';
import { useConnections } from '@ren/contexts/common';
import {
  useAppSettings,
  useManage,
  useIntervalSubscriptions,
  useSubscriptions,
} from '@ren/contexts/main';
import { useEffect, useState } from 'react';
import type { AccountsProps } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type {
  WrappedSubscriptionTasks,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import { ellipsisFn } from '@w3ux/utils';
import { FlexColumn } from '@polkadot-live/ui/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { getSupportedChains } from '@polkadot-live/consts/chains';

export const Accounts = ({
  addresses,
  setBreadcrumb,
  setSection,
  setTypeClicked,
  setSelectedAccount,
}: AccountsProps) => {
  const { cacheGet } = useAppSettings();
  const showDebuggingSubscriptions = cacheGet(
    'setting:show-debugging-subscriptions'
  );

  const { setRenderedSubscriptions, setDynamicIntervalTasks } = useManage();
  const { getChainSubscriptions, getAccountSubscriptions, chainSubscriptions } =
    useSubscriptions();
  const { getIntervalSubscriptionsForChain, getSortedKeys } =
    useIntervalSubscriptions();

  const { getTheme } = useConnections();
  const theme = getTheme();

  /// Categorise addresses by their chain ID, sort by name.
  const getSortedAddresses = () => {
    const sorted = new Map<ChainID | 'Empty', FlattenedAccountData[]>();

    // Insert map keys in a certain order.
    for (const chainId of Object.keys(getSupportedChains())) {
      sorted.set(chainId as ChainID, []);
    }

    // Map addresses to their chain ID.
    for (const address of addresses) {
      const chainId = address.chain;

      if (sorted.has(chainId)) {
        sorted.set(chainId, [...sorted.get(chainId)!, { ...address }]);
      } else {
        sorted.set(chainId, [{ ...address }]);
      }
    }

    // Sort addresses by their name.
    for (const [chainId, chainAddresses] of sorted.entries()) {
      sorted.set(
        chainId,
        chainAddresses.sort((x, y) => x.name.localeCompare(y.name))
      );
    }

    // Remove any empty entries.
    const redundantEntries: ChainID[] = [];
    for (const [chainId, chainAddresses] of sorted.entries()) {
      chainAddresses.length === 0 && redundantEntries.push(chainId as ChainID);
    }

    redundantEntries.forEach((chainId) => {
      sorted.delete(chainId);
    });

    // Add a single `Empty` key if there are no accounts to render.
    if (sorted.size === 0) {
      sorted.set('Empty', []);
    }

    return sorted;
  };

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>(
    ([...getSortedAddresses().keys()] as string[])
      .concat(showDebuggingSubscriptions ? ['Debug'] : [])
      .concat(getSortedKeys().length > 0 ? ['OpenGov'] : [])
  );

  /// Use indices ref to maintain open accordion panels when toggling debugging setting.
  useEffect(() => {
    setAccordionValue((prev) =>
      showDebuggingSubscriptions
        ? !prev.includes('Debug')
          ? [...prev, 'Debug']
          : [...prev]
        : [...prev.filter((v) => v !== 'Debug')]
    );
  }, [showDebuggingSubscriptions]);

  /// Utility to copy tasks.
  const copyTasks = (tasks: SubscriptionTask[]) =>
    tasks.map((t) => ({
      ...t,
      actionArgs: t.actionArgs ? [...t.actionArgs] : undefined,
    }));

  /// Set parent subscription tasks state when a chain is clicked.
  const handleClickChain = (chain: string) => {
    const tasks = getChainSubscriptions(chain as ChainID);
    const copy = copyTasks(tasks);

    setTypeClicked('chain');
    setRenderedSubscriptions({
      type: 'chain',
      tasks: copy,
    } as WrappedSubscriptionTasks);
    setBreadcrumb(chain);
    setSection(1);
  };

  /// Set account subscription tasks state when an account is clicked.
  const handleClickAccount = (
    address: string,
    chainId: ChainID,
    accountName: string
  ) => {
    const tasks = getAccountSubscriptions(`${chainId}:${address}`);
    const copy = copyTasks(tasks);

    setRenderedSubscriptions({
      type: 'account',
      address,
      tasks: copy,
    } as WrappedSubscriptionTasks);

    setTypeClicked('account');
    setBreadcrumb(accountName);
    setSection(1);
    setSelectedAccount(address);
  };

  /// Set interval subscription tasks state when chain is clicked.
  const handleClickOpenGovChain = (chainId: ChainID) => {
    const tasks = getIntervalSubscriptionsForChain(chainId);

    setTypeClicked('interval');
    setDynamicIntervalTasks(tasks, chainId);
    setBreadcrumb(`${chainId} OpenGov`);
    setSection(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
        <Accordion.Root
          style={{ marginBottom: '1rem' }}
          className="AccordionRoot"
          type="multiple"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as string[])}
        >
          <FlexColumn>
            {/* Manage Accounts */}
            {Array.from(getSortedAddresses().entries()).map(
              ([chainId, chainAddresses]) => (
                <Accordion.Item
                  key={`${chainId}_accounts`}
                  className="AccordionItem"
                  value={chainId}
                >
                  <UI.AccordionTrigger narrow={true}>
                    <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    <UI.TriggerHeader>
                      {chainId === 'Empty' ? 'Accounts' : `${chainId}`}
                    </UI.TriggerHeader>
                  </UI.AccordionTrigger>

                  <UI.AccordionContent transparent={true}>
                    {chainId === 'Empty' ? (
                      <NoAccounts />
                    ) : (
                      <ItemsColumn>
                        {chainAddresses.map(
                          (
                            { address, chain, name }: FlattenedAccountData,
                            j: number
                          ) => (
                            <ItemEntryWrapper
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              key={`manage_account_${j}`}
                              onClick={() =>
                                handleClickAccount(address, chain, name)
                              }
                            >
                              <div className="inner">
                                <div>
                                  <UI.TooltipRx
                                    text={ellipsisFn(address, 12)}
                                    theme={theme}
                                    side="right"
                                  >
                                    <span>
                                      <Identicon
                                        value={address}
                                        fontSize={'1.75rem'}
                                      />
                                    </span>
                                  </UI.TooltipRx>
                                  <div className="content">
                                    <h3>{name}</h3>
                                  </div>
                                </div>
                                <div>
                                  <ButtonText
                                    text=""
                                    iconRight={faChevronRight}
                                    iconTransform="shrink-3"
                                  />
                                </div>
                              </div>
                            </ItemEntryWrapper>
                          )
                        )}
                      </ItemsColumn>
                    )}
                  </UI.AccordionContent>
                </Accordion.Item>
              )
            )}

            {/* Manage OpenGov Subscriptions*/}
            <Accordion.Item className="AccordionItem" value={'OpenGov'}>
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>OpenGov</UI.TriggerHeader>
              </UI.AccordionTrigger>
              <UI.AccordionContent transparent={true}>
                <ItemsColumn>
                  {getSortedKeys().length === 0 ? (
                    <NoOpenGov />
                  ) : (
                    <>
                      {getSortedKeys().map((chainId, i) => (
                        <ItemEntryWrapper
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          key={`manage_chain_${i}`}
                          onClick={() => handleClickOpenGovChain(chainId)}
                        >
                          <div className="inner">
                            <div>
                              <span>
                                <ChainIcon
                                  chainId={chainId}
                                  className="chain-icon"
                                />
                              </span>
                              <div className="content">
                                <h3>{chainId}</h3>
                              </div>
                            </div>
                            <div>
                              <ButtonText
                                text=""
                                iconRight={faChevronRight}
                                iconTransform="shrink-3"
                              />
                            </div>
                          </div>
                        </ItemEntryWrapper>
                      ))}
                    </>
                  )}
                </ItemsColumn>
              </UI.AccordionContent>
            </Accordion.Item>

            {/* Manage Chains */}
            {showDebuggingSubscriptions && (
              <Accordion.Item className="AccordionItem" value={'Debug'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Debugging</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <UI.AccordionContent transparent={true}>
                  <ItemsColumn>
                    {Array.from(chainSubscriptions.keys()).map((chain, i) => (
                      <ItemEntryWrapper
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        key={`manage_chain_${i}`}
                        onClick={() => handleClickChain(chain)}
                      >
                        <div className="inner">
                          <div>
                            <span>
                              <ChainIcon
                                chainId={chain}
                                className="chain-icon"
                              />
                            </span>
                            <div className="content">
                              <h3>{chain}</h3>
                            </div>
                          </div>
                          <div>
                            <ButtonText
                              text=""
                              iconRight={faChevronRight}
                              iconTransform="shrink-3"
                            />
                          </div>
                        </div>
                      </ItemEntryWrapper>
                    ))}
                  </ItemsColumn>
                </UI.AccordionContent>
              </Accordion.Item>
            )}
          </FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
