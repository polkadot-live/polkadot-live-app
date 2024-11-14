// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  Identicon,
} from '@polkadot-live/ui/components';
import { ItemEntryWrapper, ItemsColumn } from './Wrappers';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getIcon } from '@ren/renderer/Utils';
import { NoAccounts, NoOpenGov } from '../NoAccounts';
import { useManage } from '@ren/renderer/contexts/main/Manage';
import { useSubscriptions } from '@ren/renderer/contexts/main/Subscriptions';
import { useEffect, useRef, useState } from 'react';
import { useIntervalSubscriptions } from '@ren/renderer/contexts/main/IntervalSubscriptions';
import { useTooltip } from '@polkadot-live/ui/contexts';
import type { AccountsProps } from './types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type {
  WrappedSubscriptionTasks,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import { useAppSettings } from '@ren/renderer/contexts/main/AppSettings';
import { ellipsisFn } from '@w3ux/utils';

export const Accounts = ({
  addresses,
  setBreadcrumb,
  setSection,
  setTypeClicked,
}: AccountsProps) => {
  const { setTooltipTextAndOpen } = useTooltip();
  const { showDebuggingSubscriptions } = useAppSettings();
  const { setRenderedSubscriptions, setDynamicIntervalTasks } = useManage();
  const { getChainSubscriptions, getAccountSubscriptions, chainSubscriptions } =
    useSubscriptions();
  const { getIntervalSubscriptionsForChain, getSortedKeys } =
    useIntervalSubscriptions();

  /// Categorise addresses by their chain ID, sort by name.
  const getSortedAddresses = () => {
    const sorted = new Map<ChainID | 'Empty', FlattenedAccountData[]>();

    // Insert map keys in a certain order.
    for (const chainId of ['Polkadot', 'Kusama', 'Westend'] as ChainID[]) {
      sorted.set(chainId, []);
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

  /// Active accordion indices for subscription categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      {
        length:
          Array.from(getSortedAddresses().keys()).length +
          (showDebuggingSubscriptions ? 2 : 1),
      },
      (_, index) => index
    )
  );
  const indicesRef = useRef(accordionActiveIndices);

  /// Use indices ref to maintain open accordion panels when toggling debugging setting.
  useEffect(() => {
    const targetIndex = Array.from(getSortedAddresses().keys()).length + 1;

    if (showDebuggingSubscriptions) {
      setAccordionActiveIndices([...indicesRef.current, targetIndex]);
    } else {
      indicesRef.current = [...indicesRef.current].filter(
        (i) => i !== targetIndex
      );
      setAccordionActiveIndices(indicesRef.current);
    }
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
  const handleClickAccount = (accountName: string, address: string) => {
    const tasks = getAccountSubscriptions(address);
    const copy = copyTasks(tasks);

    setRenderedSubscriptions({
      type: 'account',
      address,
      tasks: copy,
    } as WrappedSubscriptionTasks);

    setTypeClicked('account');
    setBreadcrumb(accountName);
    setSection(1);
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
      <Accordion
        multiple
        defaultIndex={accordionActiveIndices}
        indicesRef={indicesRef}
        panelPadding={'0.5rem 0.25rem'}
        gap={'0.5rem'}
      >
        {/* Manage Accounts */}
        {Array.from(getSortedAddresses().entries()).map(
          ([chainId, chainAddresses], k) => (
            <AccordionItem key={`${chainId}_accounts`}>
              <AccordionCaretHeader
                title={chainId === 'Empty' ? 'Accounts' : `${chainId} Accounts`}
                itemIndex={k}
              />
              <AccordionPanel>
                {chainId === 'Empty' ? (
                  <NoAccounts />
                ) : (
                  <ItemsColumn>
                    {chainAddresses.map(
                      ({ address, name }: FlattenedAccountData, j: number) => (
                        <ItemEntryWrapper
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          key={`manage_account_${j}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleClickAccount(name, address)}
                          ></button>
                          <div className="inner">
                            <div>
                              <span
                                style={{
                                  zIndex: 2,
                                  cursor: 'default',
                                }}
                                className="icon tooltip tooltip-trigger-element"
                                data-tooltip-text={ellipsisFn(address, 16)}
                                onMouseMove={() =>
                                  setTooltipTextAndOpen(
                                    ellipsisFn(address, 16),
                                    'right'
                                  )
                                }
                              >
                                <Identicon value={address} size={26} />
                              </span>
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
              </AccordionPanel>
            </AccordionItem>
          )
        )}

        {/* Manage OpenGov Subscriptions*/}
        <AccordionItem key={'openGov_accounts'}>
          <AccordionCaretHeader
            title={'OpenGov'}
            itemIndex={Array.from(getSortedAddresses().keys()).length}
          />
          <AccordionPanel>
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
                    >
                      <button
                        type="button"
                        onClick={() => handleClickOpenGovChain(chainId)}
                      ></button>
                      <div className="inner">
                        <div>
                          <span>{getIcon(chainId, 'chain-icon')}</span>
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
          </AccordionPanel>
        </AccordionItem>

        {/* Manage Chains */}
        {showDebuggingSubscriptions && (
          <AccordionItem key={'debugging_accounts'}>
            <AccordionCaretHeader
              title={'Debugging'}
              itemIndex={Array.from(getSortedAddresses().keys()).length + 1}
            />
            <AccordionPanel>
              <ItemsColumn>
                {Array.from(chainSubscriptions.keys()).map((chain, i) => (
                  <ItemEntryWrapper
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={`manage_chain_${i}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleClickChain(chain)}
                    ></button>
                    <div className="inner">
                      <div>
                        <span>{getIcon(chain, 'chain-icon')}</span>
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
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
