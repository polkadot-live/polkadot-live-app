// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getReadablePallet } from '@polkadot-live/consts/subscriptions/chainEvents';
import { useChainEvents } from '@polkadot-live/contexts';
import { FlexColumn, FlexRow, ItemsColumn } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { SubscriptionRow } from '../../ChainEvents/SubscriptionRow';
import { getNetworkColor } from '../../Wrappers';
import { Header } from './Header';

interface SmartSubscriptionsProps {
  clickedAccordionType: 'smart' | 'classic' | null;
  setClickedAccordionType: React.Dispatch<
    React.SetStateAction<'smart' | 'classic' | null>
  >;
}

export const SmartSubscriptions = ({
  clickedAccordionType,
  setClickedAccordionType,
}: SmartSubscriptionsProps) => {
  const { activeAccount, getCategorisedForAccount } = useChainEvents();

  const [accordionValEvents, setAccordionValEvents] = useState<string>('');

  const badgeColor = activeAccount?.chain
    ? getNetworkColor(activeAccount.chain)
    : '#6e6e6e';

  useEffect(() => {
    if (clickedAccordionType === 'classic') {
      setAccordionValEvents('');
    }
  }, [clickedAccordionType]);

  return (
    <>
      <Header label="Chain Events" />

      {activeAccount && (
        <FlexColumn>
          <UI.AccordionWrapper style={{ marginTop: '0.6rem' }}>
            <Accordion.Root
              className="AccordionRoot"
              collapsible={true}
              type="single"
              value={accordionValEvents}
              onValueChange={(val) => {
                setAccordionValEvents(val as string);
                setClickedAccordionType('smart');
              }}
            >
              <FlexColumn $rowGap="0.6rem">
                {Object.entries(getCategorisedForAccount(activeAccount)).map(
                  ([pallet, subs]) => (
                    <Accordion.Item
                      key={pallet}
                      className="AccordionItem"
                      value={pallet}
                    >
                      <FlexRow $gap={'2px'}>
                        <UI.AccordionTrigger narrow={true}>
                          <ChevronDownIcon
                            className="AccordionChevron"
                            aria-hidden
                          />
                          <UI.TriggerHeader>
                            <FlexRow>
                              <span style={{ flex: 1 }}>
                                {getReadablePallet(pallet)}
                              </span>

                              <UI.CountSummary
                                subs={subs}
                                badgeColor={badgeColor}
                              />
                            </FlexRow>
                          </UI.TriggerHeader>
                        </UI.AccordionTrigger>
                      </FlexRow>

                      <UI.AccordionContent
                        transparent={true}
                        className="AccordionContentReduce"
                      >
                        <ItemsColumn>
                          {subs.map((sub, i) => (
                            <SubscriptionRow
                              key={`${pallet}-${sub.eventName}-${i}`}
                              subscription={sub}
                            />
                          ))}
                        </ItemsColumn>
                      </UI.AccordionContent>
                    </Accordion.Item>
                  ),
                )}
              </FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
        </FlexColumn>
      )}
    </>
  );
};
