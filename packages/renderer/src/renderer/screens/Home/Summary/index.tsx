// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSideNav } from '@polkadot-live/ui/contexts';
import { useEvents } from '@app/contexts/main/Events';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { useHelp } from '@app/contexts/common/Help';
import {
  MainHeading,
  StatsGrid,
  StatItem,
  ShiftingMeter,
} from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { TriggerHeader } from '../../Action/Wrappers';
import { useState } from 'react';
import type { SummaryAccordionValue } from './types';
import { SideTriggerButton } from './Wrappers';

export const Summary: React.FC = () => {
  const { setSelectedId } = useSideNav();
  const { openHelp } = useHelp();
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
                  <TriggerHeader>Active Accounts</TriggerHeader>
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
                    <StatItem className="total-item">
                      <div>
                        <h3>Total</h3>
                        <div
                          className="help"
                          onClick={() =>
                            openHelp('help:summary:activeAccounts')
                          }
                        >
                          <FontAwesomeIcon icon={faInfo} />
                        </div>
                      </div>
                      <span>
                        <ShiftingMeter
                          color={'var(--text-highlight)'}
                          value={getAddressesCountByChain()}
                          size={1.26}
                        />
                      </span>
                    </StatItem>
                    {getAllAccountSources().map((source) => {
                      if (getAddressesCountBySource(source) > 0) {
                        return (
                          <StatItem key={`total_${source}_addresses`}>
                            <h3>{getReadableAccountSource(source)}</h3>
                            <span>
                              <ShiftingMeter
                                value={getAddressesCountBySource(source)}
                                size={1.2}
                              />
                            </span>
                          </StatItem>
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
                  <TriggerHeader>Events</TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton onClick={() => setSelectedId(1)} />
                </div>
              </FlexRow>
              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <StatsGrid>
                    <StatItem className="total-item">
                      <div>
                        <h3>Total</h3>
                        <div
                          className="help"
                          onClick={() => openHelp('help:summary:events')}
                        >
                          <FontAwesomeIcon icon={faInfo} />
                        </div>
                      </div>
                      <span>
                        <ShiftingMeter
                          color={'var(--text-highlight)'}
                          value={getEventsCount()}
                          size={1.26}
                        />
                      </span>
                    </StatItem>
                    {getAllEventCategoryKeys().map((category) => {
                      if (getEventsCount(category) > 0) {
                        return (
                          <StatItem key={`total_${category}_events`}>
                            <h3>{getReadableEventCategory(category)}</h3>
                            <span>
                              <ShiftingMeter
                                value={getEventsCount(category)}
                                size={1.2}
                              />
                            </span>
                          </StatItem>
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
                  <TriggerHeader>Subscriptions</TriggerHeader>
                </UI.AccordionTrigger>
                <div className="HeaderContentDropdownWrapper">
                  <SideTriggerButton onClick={() => setSelectedId(2)} />
                </div>
              </FlexRow>

              <UI.AccordionContent transparent={true}>
                <UI.StatsSectionWrapper>
                  <StatsGrid>
                    <StatItem className="total-item">
                      <div>
                        <h3>Total</h3>
                        <div
                          className="help"
                          onClick={() => openHelp('help:summary:subscriptions')}
                        >
                          <FontAwesomeIcon icon={faInfo} />
                        </div>
                      </div>
                      <span>
                        <ShiftingMeter
                          color={'var(--text-highlight)'}
                          value={
                            getTotalSubscriptionCount() +
                            getTotalIntervalSubscriptionCount()
                          }
                          size={1.26}
                        />
                      </span>
                    </StatItem>
                    {getAllAccounts().map((flattened) => (
                      <StatItem
                        key={`${flattened.address}_subscriptions_count`}
                      >
                        <h3>{flattened.name}</h3>
                        <span>
                          <ShiftingMeter
                            value={getSubscriptionCountForAccount(flattened)}
                            size={1.2}
                          />
                        </span>
                      </StatItem>
                    ))}
                    {getTotalIntervalSubscriptionCount() > 0 && (
                      <StatItem>
                        <h3>Referenda</h3>
                        <span>
                          <ShiftingMeter
                            value={getTotalIntervalSubscriptionCount()}
                            size={1.2}
                          />
                        </span>
                      </StatItem>
                    )}
                  </StatsGrid>
                </UI.StatsSectionWrapper>
              </UI.AccordionContent>
            </Accordion.Item>
          </FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
