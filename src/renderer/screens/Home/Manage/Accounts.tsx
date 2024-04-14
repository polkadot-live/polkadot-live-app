// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NoAccounts } from '../NoAccounts';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Identicon } from '@app/library/Identicon';
import type { FlattenedAccountData } from '@/types/accounts';
import PolkadotIcon from '@app/svg/polkadotIcon.svg?react';
import { AccountWrapper, AccountsWrapper, HeadingWrapper } from './Wrappers';
import type { AnyJson } from '@/types/misc';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import type { ChainID } from '@/types/chains';
import type {
  WrappedSubscriptionTasks,
  SubscriptionTask,
} from '@/types/subscriptions';
import { useManage } from './provider';
import { getIcon } from '@/renderer/Utils';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@/renderer/library/Accordion';

export const Accounts = ({ setSection, setBreadcrumb, addresses }: AnyJson) => {
  const { getChainSubscriptions, getAccountSubscriptions, chainSubscriptions } =
    useSubscriptions();
  const { setRenderedSubscriptions } = useManage();

  // Utility: Copy tasks.
  const copyTasks = (tasks: SubscriptionTask[]) =>
    tasks.map((t) => ({
      ...t,
      actionArgs: t.actionArgs ? [...t.actionArgs] : undefined,
    }));

  // Set parent subscription tasks state when a chain is clicked.
  const handleClickChain = (chain: string) => {
    const tasks = getChainSubscriptions(chain as ChainID);
    const copy = copyTasks(tasks);

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
      <Accordion multiple defaultIndex={[0, 1]}>
        <AccordionItem key={1}>
          {/* Manage Chains */}
          <AccordionHeader>
            <HeadingWrapper>
              <h5 style={{ marginBottom: '0.5rem' }}>
                <PolkadotIcon className="icon" />
                Chains
              </h5>
            </HeadingWrapper>
          </AccordionHeader>
          <AccordionPanel>
            <div style={{ padding: '0 0.75rem' }}>
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
          </AccordionPanel>
        </AccordionItem>

        {/* Manage Accounts */}
        {addresses.length ? (
          <AccordionItem>
            <AccordionHeader>
              <HeadingWrapper>
                <h5 style={{ marginBottom: '0.5rem' }}>
                  <PolkadotIcon className="icon" />
                  Accounts
                </h5>
              </HeadingWrapper>
            </AccordionHeader>
            <AccordionPanel>
              <div style={{ padding: '0 0.75rem' }}>
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
            </AccordionPanel>
          </AccordionItem>
        ) : (
          <NoAccounts />
        )}
      </Accordion>
    </AccountsWrapper>
  );
};
