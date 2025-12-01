// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import { useState } from 'react';
import { useChainEvents } from '@polkadot-live/contexts';
import { getReadablePallet } from '@polkadot-live/consts/subscriptions/chainEvents';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSplotch } from '@fortawesome/free-solid-svg-icons';
import { Header } from './Header';
import {
  FlexColumn,
  FlexRow,
  ItemsColumn,
} from '@polkadot-live/styles/wrappers';
import { SubscriptionRowAccount } from '../../ChainEvents/SubscriptionRowAccount';

export const SmartSubscriptions = () => {
  const { activeAccount, accountSubCountForPallet, getCategorisedForAccount } =
    useChainEvents();

  const [accordionValEvents, setAccordionValEvents] = useState<
    string | undefined
  >(undefined);

  return (
    <>
      <Header label="Smart" />
      {activeAccount && (
        <FlexColumn>
          <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
            <Accordion.Root
              className="AccordionRoot"
              collapsible={true}
              type="single"
              value={accordionValEvents}
              onValueChange={(val) => setAccordionValEvents(val as string)}
            >
              <FlexColumn $rowGap="2px">
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
                              {accountSubCountForPallet(pallet) > 0 && (
                                <FontAwesomeIcon
                                  style={{ color: 'var(--accent-primary)' }}
                                  icon={faSplotch}
                                />
                              )}
                            </FlexRow>
                          </UI.TriggerHeader>
                        </UI.AccordionTrigger>
                      </FlexRow>

                      <UI.AccordionContent transparent={true} topGap={'2px'}>
                        <ItemsColumn>
                          {subs.map((sub, i) => (
                            <SubscriptionRowAccount
                              key={`${pallet}-${sub.eventName}-${i}`}
                              subscription={sub}
                            />
                          ))}
                        </ItemsColumn>
                      </UI.AccordionContent>
                    </Accordion.Item>
                  )
                )}
              </FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
        </FlexColumn>
      )}
    </>
  );
};
