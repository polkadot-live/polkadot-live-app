// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { AccountWrapper, AccountsWrapper, HeadingWrapper } from './Wrappers';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import {
  faCaretDown,
  faCaretRight,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIcon } from '@/renderer/Utils';
import { Identicon } from '@app/library/Identicon';
import { NoAccounts } from '../NoAccounts';
import { useManage } from './provider';
import { useSubscriptions } from '@/renderer/contexts/main/Subscriptions';
import { useState } from 'react';
import type { AccountsProps } from './types';
import type { ChainID } from '@/types/chains';
import type { FlattenedAccountData } from '@/types/accounts';
import type {
  WrappedSubscriptionTasks,
  SubscriptionTask,
} from '@/types/subscriptions';

export const Accounts = ({
  addresses,
  setBreadcrumb,
  setSection,
  setTypeClicked,
}: AccountsProps) => {
  const { getChainSubscriptions, getAccountSubscriptions, chainSubscriptions } =
    useSubscriptions();
  const { setRenderedSubscriptions } = useManage();

  /// Categorise addresses by their chain ID, sort by name.
  const getSortedAddresses = () => {
    const sorted = new Map<ChainID, FlattenedAccountData[]>();

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
      chainAddresses.length === 0 && redundantEntries.push(chainId);
    }

    redundantEntries.forEach((chainId) => {
      sorted.delete(chainId);
    });

    return sorted;
  };

  /// Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      { length: Array.from(getSortedAddresses().keys()).length + 1 },
      (_, index) => index
    )
  );

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

    setTypeClicked('account');
    setRenderedSubscriptions({
      type: 'account',
      address,
      tasks: copy,
    } as WrappedSubscriptionTasks);

    setBreadcrumb(accountName);
    setSection(1);
  };

  return (
    <AccountsWrapper>
      <div
        style={{
          display: addresses.length === 0 ? 'inherit' : 'none',
          padding: '0 0.5rem',
        }}
      >
        <NoAccounts />
      </div>
      <div>
        <Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
        >
          {/* Manage Accounts */}
          {Array.from(getSortedAddresses().entries()).map(
            ([chainId, chainAddresses], k) => (
              <AccordionItem key={`${chainId}_accounts`}>
                <HeadingWrapper>
                  <AccordionHeader>
                    <div className="flex">
                      <div className="left">
                        <div className="icon-wrapper">
                          {accordionActiveIndices.includes(k) ? (
                            <FontAwesomeIcon
                              icon={faCaretDown}
                              transform={'shrink-1'}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faCaretRight}
                              transform={'shrink-1'}
                            />
                          )}
                        </div>
                        <h5>{chainId} Accounts</h5>
                      </div>
                    </div>
                  </AccordionHeader>
                </HeadingWrapper>
                <AccordionPanel>
                  <div style={{ padding: '0 0.75rem' }}>
                    <div className="flex-column">
                      {chainAddresses.map(
                        (
                          { address, name }: FlattenedAccountData,
                          j: number
                        ) => (
                          <AccountWrapper
                            whileHover={{ scale: 1.01 }}
                            key={`manage_account_${j}`}
                          >
                            <button
                              type="button"
                              onClick={() => handleClickAccount(name, address)}
                            ></button>
                            <div className="inner">
                              <div>
                                <span className="icon">
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
                          </AccountWrapper>
                        )
                      )}
                    </div>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )
          )}

          {/* Manage Chains */}
          <AccordionItem key={'chain_accounts'}>
            <HeadingWrapper>
              <AccordionHeader>
                <div className="flex">
                  <div className="left">
                    <div className="icon-wrapper">
                      {accordionActiveIndices.includes(3) ? (
                        <FontAwesomeIcon
                          icon={faCaretDown}
                          transform={'shrink-1'}
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faCaretRight}
                          transform={'shrink-1'}
                        />
                      )}
                    </div>
                    <h5>Chains</h5>
                  </div>
                </div>
              </AccordionHeader>
            </HeadingWrapper>
            <AccordionPanel>
              <div style={{ padding: '0 0.75rem' }}>
                <div className="flex-column">
                  {Array.from(chainSubscriptions.keys()).map((chain, i) => (
                    <AccountWrapper
                      whileHover={{ scale: 1.01 }}
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
                    </AccountWrapper>
                  ))}
                </div>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </AccountsWrapper>
  );
};
