// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ButtonText } from '@polkadot-cloud/react';
import { Identicon } from '@app/library/Identicon';
import type { FlattenedAccountData } from '@/types/accounts';
import PolkadotIcon from '@app/svg/polkadotIcon.svg?react';
import { AccountWrapper, AccountsWrapper, HeadingWrapper } from './Wrappers';
import type { AnyJson } from '@/types/misc';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import type { ChainID } from '@/types/chains';

export const Accounts = ({
  setSection,
  setBreadcrumb,
  setSubscriptionTasks,
  addresses,
}: AnyJson) => {
  const chains = ['Polkadot', 'Westend'];
  const { getChainSubscriptions } = useSubscriptions();

  // temporary solution to visualize account subscriptions.
  const getPermissionsForAccount = () => {
    return [
      {
        action: 'subscribe:query.system.account',
        actionArgs: ['<address>'],
        chainId: 'Polkadot',
        status: 'disable',
        label: 'Transfers',
      },
      {
        action: 'subscribe:query.system.account',
        actionArgs: ['<address>'],
        chainId: 'Polkadot',
        status: 'disable',
        label: 'Pool Rewards',
      },
    ];
  };

  const handleClickChain = (chain: string) => {
    const tasks = getChainSubscriptions(chain as ChainID);

    setBreadcrumb(chain);
    setSubscriptionTasks(tasks);
    setSection(1);
  };

  const handleClickAccount = (accountName: string) => {
    const tasks = getPermissionsForAccount();

    setSubscriptionTasks(tasks);
    setBreadcrumb(accountName);
    setSection(1);
  };

  return (
    <AccountsWrapper>
      <HeadingWrapper>
        <h5 style={{ marginBottom: '0.5rem' }}>
          <PolkadotIcon className="icon" />
          Chains
        </h5>
      </HeadingWrapper>
      <div style={{ padding: '0 0.75rem' }}>
        {chains.map((chain, i) => (
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
                <span>
                  <PolkadotIcon className="chain-icon" />
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
          </AccountWrapper>
        ))}
      </div>

      <HeadingWrapper>
        <h5 style={{ marginBottom: '0.5rem' }}>
          <PolkadotIcon className="icon" />
          Polkadot Accounts
        </h5>
      </HeadingWrapper>
      <div style={{ padding: '0 0.75rem' }}>
        {addresses
          .filter(({ type }: FlattenedAccountData) => type === 0)
          .map(({ address, name }: FlattenedAccountData, i: number) => (
            <AccountWrapper
              whileHover={{ scale: 1.01 }}
              key={`manage_account_${i}`}
            >
              <button
                type="button"
                onClick={() => handleClickAccount(name)}
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
          ))}
      </div>
    </AccountsWrapper>
  );
};
