// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';

import { getSupportedSources } from '@polkadot-live/consts/chains';
import { useEffect, useRef, useState } from 'react';
import { useSideNav } from '@polkadot-live/ui/contexts';
import {
  useAddresses,
  useEvents,
  useIntervalSubscriptions,
} from '@ren/contexts/main';
import { MainHeading } from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { SideTriggerButton } from './Wrappers';
import { OpenViewButton } from './OpenViewButton';
import { StatItemRow } from './StatItemRow';

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { SummaryAccordionValue } from './types';
import type { TxStatus } from '@polkadot-live/types/tx';

export const Summary: React.FC = () => {
  const { setSelectedId } = useSideNav();
  const { getTotalIntervalSubscriptionCount } = useIntervalSubscriptions();
  const { getEventsCount, getReadableEventCategory, getAllEventCategoryKeys } =
    useEvents();

  const {
    getReadableAccountSource,
    getAllAccounts,
    getSubscriptionCountForAccount,
    getTotalSubscriptionCount,
  } = useAddresses();

  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, ImportedGenericAccount[]>()
  );
  const addressMapRef = useRef<typeof addressMap>(addressMap);
  const [trigger, setTrigger] = useState<boolean>(false);

  /**
   * Extrinsic counts.
   */
  const [extrinsicCounts, setExtrinsicCounts] = useState(
    new Map<TxStatus, number>()
  );
  const extrinsicCountsRef = useRef(extrinsicCounts);

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
      // Accounts.
      const serialized = (await window.myAPI.rawAccountTask({
        action: 'raw-account:getAll',
        data: null,
      })) as string;

      const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));
      for (const [source, ser] of parsedMap.entries()) {
        const parsed: ImportedGenericAccount[] = JSON.parse(ser);
        addressMapRef.current.set(source, parsed);
      }

      // Extrinsics.
      const getCount = async (status: TxStatus) =>
        (await window.myAPI.sendExtrinsicsTaskAsync({
          action: 'extrinsics:getCount',
          data: { status },
        })) || '0';

      const counts = await Promise.all([
        getCount('pending'),
        getCount('finalized'),
      ]);

      extrinsicCountsRef.current.set('pending', Number(counts[0]));
      extrinsicCountsRef.current.set('finalized', Number(counts[1]));

      // Trigger state update.
      setTrigger(true);
    };

    fetch();
  }, []);

  /**
   * Trigger to update state.
   */
  useEffect(() => {
    if (trigger) {
      setAddressMap(addressMapRef.current);
      setExtrinsicCounts(extrinsicCountsRef.current);
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
                    onClick={() => {
                      window.myAPI.openWindow('action');
                      window.myAPI.umamiEvent('window-open-extrinsics', null);
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
