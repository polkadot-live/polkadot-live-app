// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import { useSideNav } from '@polkadot-live/ui/contexts';
import { useEvents } from '@app/contexts/main/Events';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { MainHeading, StatsGrid } from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { SideTriggerButton, StatItem, StatItemRow } from './Wrappers';
import type { SummaryAccordionValue } from './types';

export const Summary: React.FC = () => {
  const { setSelectedId } = useSideNav();
  const { getTotalIntervalSubscriptionCount } = useIntervalSubscriptions();
  const { getEventsCount, getReadableEventCategory, getAllEventCategoryKeys } =
    useEvents();

  const {
    getAddressesCountByChain,
    getAddressesCountBySource,
    getReadableAccountSource,
    getAllAccountSources,
    getAllAccounts,
    getSubscriptionCountForAccount,
    getTotalSubscriptionCount,
  } = useAddresses();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<SummaryAccordionValue[]>(
    ['summary-accounts', 'summary-events', 'summary-subscriptions']
  );

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
          type="multiple"
          value={accordionValue}
          onValueChange={(val) =>
            setAccordionValue(val as SummaryAccordionValue[])
          }
        >
          <FlexColumn>
            {/** Active Accounts */}
            <Accordion.Item className="AccordionItem" value="summary-accounts">
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Active Accounts</UI.TriggerHeader>
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
                  <StatsGrid>
                    <StatItem
                      title="Total"
                      total={true}
                      helpKey={'help:summary:activeAccounts'}
                      meterValue={getAddressesCountByChain()}
                    />
                    {getAllAccountSources().map((source) => {
                      if (getAddressesCountBySource(source) > 0) {
                        return (
                          <StatItem
                            key={`total_${source}_addresses`}
                            title={getReadableAccountSource(source)}
                            meterValue={getAddressesCountBySource(source)}
                          />
                        );
                      }
                    })}
                  </StatsGrid>
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
                  <StatsGrid>
                    <StatItem
                      title="Total"
                      total={true}
                      helpKey={'help:summary:events'}
                      meterValue={getEventsCount()}
                    />
                    {getAllEventCategoryKeys().map((category) => {
                      if (getEventsCount(category) > 0) {
                        return (
                          <StatItem
                            key={`total_${category}_events`}
                            title={getReadableEventCategory(category)}
                            meterValue={getEventsCount(category)}
                          />
                        );
                      }
                    })}
                  </StatsGrid>
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
