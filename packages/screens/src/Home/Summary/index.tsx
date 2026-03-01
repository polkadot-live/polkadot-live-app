// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useConnections, useSideNav } from '@polkadot-live/contexts';
import { FlexColumn, FlexRow } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { OpenViewButton } from './OpenViewButton';
import {
  AccountsDonut,
  EventsBarChart,
  ExtrinsicsStats,
  SubscriptionsStats,
} from './Stats';
import { SideTriggerButton, SummaryTriggerStyles } from './Wrappers';
import type { SummaryAccordionItemProps, SummaryAccordionValue } from './types';

const SummaryAccordionItem = ({
  children,
  onClick,
  title,
  value,
}: SummaryAccordionItemProps) => (
  <Accordion.Item className="AccordionItem" value={value}>
    <FlexRow $gap={'2px'}>
      <UI.AccordionTrigger narrow={true}>
        <ChevronDownIcon className="AccordionChevron" aria-hidden />
        <UI.TriggerHeader>{title}</UI.TriggerHeader>
      </UI.AccordionTrigger>
      <div className="HeaderContentDropdownWrapper SummaryTriggerWrapper">
        <SideTriggerButton onClick={onClick} />
      </div>
    </FlexRow>
    <UI.AccordionContent transparent={true}>{children}</UI.AccordionContent>
  </Accordion.Item>
);

export const Summary = () => {
  const { openTab } = useConnections();
  const { setSelectedId } = useSideNav();

  const [accordionValue, setAccordionValue] =
    useState<SummaryAccordionValue>('summary-accounts');

  const viewButtons = [
    {
      title: 'Accounts',
      target: 'import',
      umamiEvent: 'window-open-accounts',
      icon: FA.faWallet,
    },
    {
      title: 'Extrinsics',
      target: 'action',
      umamiEvent: 'window-open-extrinsics',
      icon: FA.faFileSignature,
    },
    {
      title: 'OpenGov',
      target: 'openGov',
      umamiEvent: 'window-open-openGov',
      icon: FA.faTableList,
    },
    {
      title: 'Settings',
      target: 'settings',
      umamiEvent: 'window-open-settings',
      icon: FA.faGear,
    },
  ] as const;

  return (
    <FlexColumn $rowGap="1rem" style={{ padding: '2rem 1rem' }}>
      <UI.MainHeading>Summary</UI.MainHeading>

      <FlexRow $gap={'0.75rem'}>
        {viewButtons.map(({ title, target, umamiEvent, icon }) => (
          <OpenViewButton
            key={target}
            title={title}
            target={target}
            umamiEvent={umamiEvent}
            icon={icon}
          />
        ))}
      </FlexRow>

      <SummaryTriggerStyles>
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
              <SummaryAccordionItem
                title="Accounts"
                value="summary-accounts"
                onClick={() =>
                  openTab('import', {
                    event: 'window-open-accounts',
                    data: null,
                  })
                }
              >
                <AccountsDonut />
              </SummaryAccordionItem>

              <SummaryAccordionItem
                title="Events"
                value="summary-events"
                onClick={() => setSelectedId(1)}
              >
                <EventsBarChart />
              </SummaryAccordionItem>

              <SummaryAccordionItem
                title="Extrinsics"
                value="summary-extrinsics"
                onClick={() =>
                  openTab('action', {
                    event: 'window-open-extrinsics',
                    data: null,
                  })
                }
              >
                <ExtrinsicsStats />
              </SummaryAccordionItem>

              <SummaryAccordionItem
                title="Subscriptions"
                value="summary-subscriptions"
                onClick={() => setSelectedId(2)}
              >
                <SubscriptionsStats />
              </SummaryAccordionItem>
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </SummaryTriggerStyles>
    </FlexColumn>
  );
};
