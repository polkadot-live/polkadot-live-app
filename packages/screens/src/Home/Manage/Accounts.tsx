// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { faBell, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSupportedChains } from '@polkadot-live/consts/chains';
import {
  useAppSettings,
  useChainEvents,
  useConnections,
  useManage,
  useSubscriptions,
} from '@polkadot-live/contexts';
import {
  FlexColumn,
  ItemEntryWrapper,
  ItemsColumn,
} from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ellipsisFn } from '@w3ux/utils';
import { useEffect, useState } from 'react';
import { getNetworkColor } from '../Wrappers';
import {
  AccountAddress,
  AccountCard,
  AccountCardContent,
  AccountCardHeader,
  AccountChevron,
  AccountCountBadge,
  AccountIconCircle,
  AccountName,
  AccountStatsRow,
} from './Wrappers';
import type { ActiveSubCounts } from '@polkadot-live/types';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AccountsProps } from './types';

export const Accounts = ({
  addresses,
  visible,
  setBreadcrumb,
  setTasksChainId,
  setSection,
  setTypeClicked,
}: AccountsProps) => {
  const { cacheGet } = useAppSettings();
  const { openTab } = useConnections();
  const { fetchAccountStats, setActiveAccount, syncAccounts } =
    useChainEvents();
  const { setRenderedSubscriptions } = useManage();
  const { getChainSubscriptions, getAccountSubscriptions, chainSubscriptions } =
    useSubscriptions();

  const showDebuggingSubscriptions = cacheGet(
    'setting:show-debugging-subscriptions',
  );

  const [accountStats, setAccountStats] = useState<
    Record<string, ActiveSubCounts>
  >({});

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    fetchAccountStats().then((stats) => {
      if (!cancelled) {
        setAccountStats(stats);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [visible, addresses.length]);

  const getAccountStats = (account: FlattenedAccountData) => {
    const key = `${account.chain}:${account.address}`;
    return accountStats[key] || { active: 0, osNotify: 0 };
  };

  /**
   * Categorise addresses by their chain ID, sort by name.
   */
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
        chainAddresses.sort((x, y) => x.name.localeCompare(y.name)),
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

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<string[]>(
    ([...getSortedAddresses().keys()] as string[]).concat(
      showDebuggingSubscriptions ? ['Debug'] : [],
    ),
  );

  /**
   * Set parent subscription tasks state when a chain is clicked.
   */
  const handleClickChain = (chainId: ChainID) => {
    setRenderedSubscriptions({
      type: 'chain',
      tasks: getChainSubscriptions(chainId),
    });
    setTasksChainId(chainId);
    setTypeClicked('chain');
    setBreadcrumb(chainId);
    setSection(1);
  };

  /**
   * Set account subscription tasks state when an account is clicked.
   */
  const handleClickAccount = (account: FlattenedAccountData) => {
    const { address, chain: chainId, name: accountName } = account;
    setRenderedSubscriptions({
      type: 'account',
      tasks: getAccountSubscriptions(`${chainId}:${address}`),
    });
    setTasksChainId(chainId);
    setTypeClicked('account');
    setBreadcrumb(accountName);
    setSection(1);
    // Set account for chain event subscriptons.
    setActiveAccount(account);
  };

  /**
   * Sync persisted subscription state.
   */
  useEffect(() => {
    const sync = async () => {
      const accounts = Array.from(getSortedAddresses().values()).flat();
      await syncAccounts(accounts);
    };
    sync();
  }, []);

  /**
   * Use indices ref to maintain open accordion panels when toggling debugging setting.
   */
  useEffect(() => {
    setAccordionValue((prev) =>
      showDebuggingSubscriptions
        ? !prev.includes('Debug')
          ? [...prev, 'Debug']
          : [...prev]
        : [...prev.filter((v) => v !== 'Debug')],
    );
  }, [showDebuggingSubscriptions]);

  return (
    <div style={{ width: '100%' }}>
      <UI.ScreenInfoCard>
        <div>Select an account to manage its subscriptions.</div>
      </UI.ScreenInfoCard>

      <UI.AccordionWrapper style={{ marginTop: '0.75rem' }}>
        <Accordion.Root
          style={{ marginBottom: '1rem' }}
          className="AccordionRoot"
          type="multiple"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as string[])}
        >
          <FlexColumn $rowGap="0.6rem">
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

                  <UI.AccordionContent
                    transparent={true}
                    className={'AccordionContentReduce'}
                  >
                    {chainId === 'Empty' ? (
                      <UI.NoAccounts
                        onClick={() =>
                          openTab('import', {
                            event: 'window-open-accounts',
                            data: null,
                          })
                        }
                      />
                    ) : (
                      <FlexColumn $rowGap="0.6rem">
                        {chainAddresses.map(
                          (a: FlattenedAccountData, j: number) => {
                            const color = getNetworkColor(a.chain);
                            const { active, osNotify } = getAccountStats(a);

                            return (
                              <AccountCard
                                $accentColor={color}
                                key={`manage_account_${j}`}
                                onClick={() => handleClickAccount(a)}
                              >
                                <AccountIconCircle $color={color}>
                                  <UI.Identicon
                                    value={a.address}
                                    fontSize={'2.25rem'}
                                  />
                                </AccountIconCircle>

                                <AccountCardContent>
                                  <AccountCardHeader>
                                    <AccountName>{a.name}</AccountName>
                                    <AccountAddress>
                                      {ellipsisFn(a.address, 12)}
                                    </AccountAddress>
                                  </AccountCardHeader>

                                  <AccountStatsRow
                                    $color={color}
                                    $inactive={active === 0}
                                  >
                                    <span className="stat-pill">
                                      Active
                                      <span className="stat-value">
                                        {active}
                                      </span>
                                    </span>
                                    <span className="stat-pill">
                                      <FontAwesomeIcon icon={faBell} />
                                      <span className="stat-value">
                                        {osNotify}
                                      </span>
                                    </span>
                                  </AccountStatsRow>
                                </AccountCardContent>

                                {active > 0 && (
                                  <AccountCountBadge
                                    $color={color}
                                    $active={true}
                                  >
                                    {active}
                                  </AccountCountBadge>
                                )}

                                <AccountChevron>
                                  <FontAwesomeIcon icon={faChevronRight} />
                                </AccountChevron>
                              </AccountCard>
                            );
                          },
                        )}
                      </FlexColumn>
                    )}
                  </UI.AccordionContent>
                </Accordion.Item>
              ),
            )}

            {/* Manage Chains */}
            {showDebuggingSubscriptions && (
              <Accordion.Item className="AccordionItem" value={'Debug'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Debugging</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <UI.AccordionContent transparent={true}>
                  <ItemsColumn>
                    {Array.from(chainSubscriptions.keys()).map((chainId, i) => (
                      <ItemEntryWrapper
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        key={`manage_chain_${i}`}
                        onClick={() => handleClickChain(chainId)}
                      >
                        <div className="inner">
                          <div>
                            <span>
                              <UI.ChainIcon chainId={chainId} width={16} />
                            </span>
                            <div className="content">
                              <h3>{chainId}</h3>
                            </div>
                          </div>
                          <div>
                            <UI.ButtonText
                              text=""
                              iconRight={FA.faChevronRight}
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
