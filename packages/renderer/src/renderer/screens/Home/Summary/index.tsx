// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';

import { useSideNav } from '@polkadot-live/ui/contexts';
import { useEvents } from '@app/contexts/main/Events';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { MainHeading } from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useEffect, useRef, useState } from 'react';
import { SideTriggerButton, StatItemRow } from './Wrappers';

import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { SummaryAccordionValue } from './types';

export const Summary: React.FC = () => {
  const { setSelectedId } = useSideNav();
  const { getTotalIntervalSubscriptionCount } = useIntervalSubscriptions();
  const { getEventsCount, getReadableEventCategory, getAllEventCategoryKeys } =
    useEvents();

  const {
    getReadableAccountSource,
    getAllAccountSources,
    getAllAccounts,
    getSubscriptionCountForAccount,
    getTotalSubscriptionCount,
  } = useAddresses();

  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, (LocalAddress | LedgerLocalAddress)[]>()
  );
  const addressMapRef = useRef<typeof addressMap>(addressMap);
  const [trigger, setTrigger] = useState<boolean>(false);

  /**
   * Utils.
   */
  const getTotalAccounts = () =>
    Array.from(addressMap.values()).reduce((pv, cur) => (pv += cur.length), 0);

  /**
   * Fetch stored addresss from main when component loads.
   */
  useEffect(() => {
    const fetch = async () => {
      const serialized = (await window.myAPI.rawAccountTask({
        action: 'raw-account:getAll',
        data: null,
      })) as string;

      const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));

      for (const [source, ser] of parsedMap.entries()) {
        switch (source) {
          case 'vault':
          case 'read-only':
          case 'wallet-connect': {
            const parsed: LocalAddress[] = JSON.parse(ser);
            addressMapRef.current.set(source, parsed);
            setTrigger(true);
            break;
          }
          case 'ledger': {
            const parsed: LedgerLocalAddress[] = JSON.parse(ser);
            addressMapRef.current.set(source, parsed);
            setTrigger(true);
            break;
          }
          default: {
            continue;
          }
        }
      }
    };

    fetch();
  }, []);

  /**
   * Trigger to update state.
   */
  useEffect(() => {
    if (trigger) {
      setAddressMap(addressMapRef.current);
      setTrigger(false);
    }
  }, [trigger]);

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] =
    useState<SummaryAccordionValue>('summary-accounts');

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'balances':
        return FA.faWallet;
      case 'nominationPools':
        return FA.faUsers;
      case 'nominating':
        return FA.faArrowUpRightDots;
      case 'openGov':
        return FA.faFileContract;
      default:
        return FA.faCircleNodes;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
        padding: '2rem 1rem',
      }}
    >
      {/* Title */}
      <MainHeading>Summary</MainHeading>

      <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
        <Accordion.Root
          className="AccordionRoot"
          type="single"
          value={accordionValue}
          onValueChange={(val) =>
            setAccordionValue(val as SummaryAccordionValue)
          }
        >
          <FlexColumn $rowGap={'1.5rem'}>
            {/* Active Accounts */}
            <Accordion.Item className="AccordionItem" value="summary-accounts">
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Accounts</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton
                    onClick={() => {
                      window.myAPI.openWindow('import');
                      window.myAPI.umamiEvent('window-open-accounts', null);
                    }}
                  />
                </div>
              </FlexRow>
              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <FlexColumn $rowGap={'2px'}>
                    <StatItemRow
                      style={{ backgroundColor: 'var(--background-primary)' }}
                      kind="total"
                      helpKey="help:summary:activeAccounts"
                      meterValue={getTotalAccounts()}
                    />

                    {getAllAccountSources().map((source) => {
                      if ((addressMap.get(source) || []).length > 0) {
                        return (
                          <StatItemRow
                            key={`total_${source}_accounts`}
                            kind="import"
                            category={getReadableAccountSource(source)}
                            meterValue={(addressMap.get(source) || []).length}
                          />
                        );
                      }
                    })}
                  </FlexColumn>
                </UI.StatsSectionWrapper>
              </UI.AccordionContent>
            </Accordion.Item>

            {/* Events */}
            <Accordion.Item className="AccordionItem" value="summary-events">
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Events</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton onClick={() => setSelectedId(1)} />
                </div>
              </FlexRow>
              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <FlexColumn $rowGap={'2px'}>
                    <StatItemRow
                      style={{ backgroundColor: 'var(--background-primary)' }}
                      kind="total"
                      helpKey="help:summary:events"
                      meterValue={getEventsCount()}
                    />

                    {getAllEventCategoryKeys().map((category) => (
                      <StatItemRow
                        key={`total_${category}_events`}
                        kind="event"
                        category={getReadableEventCategory(category)}
                        meterValue={getEventsCount(category)}
                        icon={getEventIcon(category)}
                      />
                    ))}
                  </FlexColumn>
                </UI.StatsSectionWrapper>
              </UI.AccordionContent>
            </Accordion.Item>

            {/* Subscriptions */}
            <Accordion.Item
              className="AccordionItem"
              value="summary-subscriptions"
            >
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Subscriptions</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton onClick={() => setSelectedId(2)} />
                </div>
              </FlexRow>

              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <FlexColumn $rowGap={'2px'}>
                    <StatItemRow
                      style={{ backgroundColor: 'var(--background-primary)' }}
                      kind="total"
                      helpKey="help:summary:subscriptions"
                      meterValue={
                        getTotalSubscriptionCount() +
                        getTotalIntervalSubscriptionCount()
                      }
                    />
                    {getAllAccounts().map((flattened) => (
                      <StatItemRow
                        key={`${flattened.address}_subscriptions_count`}
                        kind="account"
                        meterValue={getSubscriptionCountForAccount(flattened)}
                        flattened={flattened}
                      />
                    ))}
                    {getTotalIntervalSubscriptionCount() > 0 && (
                      <StatItemRow
                        kind="referenda"
                        meterValue={getTotalIntervalSubscriptionCount()}
                      />
                    )}
                  </FlexColumn>
                </UI.StatsSectionWrapper>
              </UI.AccordionContent>
            </Accordion.Item>
          </FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
