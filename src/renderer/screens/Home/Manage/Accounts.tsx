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
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
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

  // Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >([0, 1]);

  // Utility to copy tasks.
  const copyTasks = (tasks: SubscriptionTask[]) =>
    tasks.map((t) => ({
      ...t,
      actionArgs: t.actionArgs ? [...t.actionArgs] : undefined,
    }));

  // Set parent subscription tasks state when a chain is clicked.
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

  // Set account subscription tasks state when an account is clicked.
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
      <Accordion
        multiple
        defaultIndex={accordionActiveIndices}
        setExternalIndices={setAccordionActiveIndices}
      >
        {/* Manage Accounts */}
        <AccordionItem>
          <HeadingWrapper>
            <AccordionHeader>
              <div className="flex">
                <div className="left">
                  <div className="icon-wrapper">
                    {accordionActiveIndices.includes(0) ? (
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
                  <h5>Accounts</h5>
                </div>
              </div>
            </AccordionHeader>
          </HeadingWrapper>
          <AccordionPanel>
            <div style={{ padding: '0 0.75rem' }}>
              {addresses.length ? (
                <div className="flex-column">
                  {addresses.map(
                    ({ address, name }: FlattenedAccountData, i: number) => (
                      <AccountWrapper
                        whileHover={{ scale: 1.01 }}
                        key={`manage_account_${i}`}
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
              ) : (
                <NoAccounts />
              )}
            </div>
          </AccordionPanel>
        </AccordionItem>

        {/* Manage Chains */}
        <AccordionItem key={1}>
          <HeadingWrapper>
            <AccordionHeader>
              <div className="flex">
                <div className="left">
                  <div className="icon-wrapper">
                    {accordionActiveIndices.includes(1) ? (
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
    </AccountsWrapper>
  );
};
