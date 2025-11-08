// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';
import {
  useAddresses,
  useConnections,
  useEvents,
  useIntervalSubscriptions,
  useSideNav,
  useSubscriptions,
  useSummary,
} from '@polkadot-live/contexts';
import { getReadableAccountSource } from '@polkadot-live/core';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import { useState } from 'react';
import { MainHeading } from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/styles/wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { SideTriggerButton } from './Wrappers';
import { OpenViewButton } from './OpenViewButton';
import { StatItemRow } from './StatItemRow';
import type { SummaryAccordionValue } from './types';

export const Summary = () => {
  const { getAllAccounts } = useAddresses();
  const { openTab } = useConnections();
  const { getEventsCount, getReadableEventCategory, getAllEventCategoryKeys } =
    useEvents();
  const { getTotalIntervalSubscriptionCount } = useIntervalSubscriptions();
  const { setSelectedId } = useSideNav();
  const { getSubscriptionCountForAccount, getTotalSubscriptionCount } =
    useSubscriptions();
  const { addressMap, extrinsicCounts } = useSummary();

  /**
   * Utils.
   */
  const getTotalAccounts = () =>
    Array.from(addressMap.values()).reduce((pv, cur) => (pv += cur.length), 0);

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

      <FlexRow $gap={'0.75rem'}>
        <OpenViewButton
          title="Accounts"
          target="import"
          umamiEvent="window-open-accounts"
          icon={FA.faWallet}
        />
        <OpenViewButton
          title="Extrinsics"
          target="action"
          umamiEvent="window-open-extrinsics"
          icon={FA.faFileSignature}
        />
        <OpenViewButton
          title="OpenGov"
          target="openGov"
          umamiEvent="window-open-openGov"
          icon={FA.faTableList}
        />
        <OpenViewButton
          title="Settings"
          target="settings"
          umamiEvent="window-open-settings"
          icon={FA.faGear}
        />
      </FlexRow>

      <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
        <Accordion.Root
          className="AccordionRoot"
          type="single"
          value={accordionValue}
          onValueChange={(val) =>
            setAccordionValue(val as SummaryAccordionValue)
          }
        >
          <FlexColumn $rowGap={'1rem'}>
            {/* Active Accounts */}
            <Accordion.Item className="AccordionItem" value="summary-accounts">
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Accounts</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton
                    onClick={() =>
                      openTab('import', {
                        event: 'window-open-accounts',
                        data: null,
                      })
                    }
                  />
                </div>
              </FlexRow>
              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <FlexColumn $rowGap={'2px'}>
                    <StatItemRow
                      style={{ backgroundColor: 'var(--background-primary)' }}
                      kind="total"
                      helpKey="help:summary:accounts"
                      meterValue={getTotalAccounts()}
                    />

                    {getSupportedSources().map((source) => {
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

            {/* Extrinsics */}
            <Accordion.Item
              className="AccordionItem"
              value="summary-extrinsics"
            >
              <FlexRow $gap={'2px'}>
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>Extrinsics</UI.TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton
                    onClick={() =>
                      openTab('action', {
                        event: 'window-open-extrinsics',
                        data: null,
                      })
                    }
                  />
                </div>
              </FlexRow>
              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <FlexColumn $rowGap={'2px'}>
                    <StatItemRow
                      style={{ backgroundColor: 'var(--background-primary)' }}
                      kind="total"
                      helpKey="help:summary:extrinsics"
                      meterValue={
                        (extrinsicCounts.get('pending') || 0) +
                        (extrinsicCounts.get('finalized') || 0)
                      }
                    />
                    <StatItemRow
                      category="Pending"
                      kind="import"
                      meterValue={extrinsicCounts.get('pending') || 0}
                    />
                    <StatItemRow
                      category="Finalized"
                      kind="import"
                      meterValue={extrinsicCounts.get('finalized') || 0}
                    />
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
