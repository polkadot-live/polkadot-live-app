// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as UI from '@polkadot-live/ui';
import * as Wrappers from '@polkadot-live/styles';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEvents } from '@polkadot-live/contexts';
import { getAllEventCategories } from '@polkadot-live/consts/chains';
import type { EventCategory } from '@polkadot-live/types';
import type { CategoriesProps } from './types';

export const Categories = ({ setSection }: CategoriesProps) => {
  const { eventCounts, getEventCategoryIcon, changeActiveCategory } =
    useEvents();

  const [accordionValue, setAccordionValue] = useState('Categories');

  const onCategoryClick = (category: EventCategory) => {
    changeActiveCategory(category);
    setSection(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <UI.ScreenInfoCard>
        <div>Select a category to view events.</div>
      </UI.ScreenInfoCard>

      <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
        <Accordion.Root
          style={{ marginBottom: '1rem' }}
          className="AccordionRoot"
          type="single"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as string)}
        >
          <Wrappers.FlexColumn>
            <Accordion.Item className="AccordionItem" value={'Categories'}>
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>Categories</UI.TriggerHeader>
              </UI.AccordionTrigger>

              <UI.AccordionContent transparent={true}>
                <Wrappers.ItemsColumn>
                  {getAllEventCategories()
                    .filter((c) => c !== 'Debugging')
                    .sort((a, b) => a.localeCompare(b))
                    .map((category) => (
                      <Wrappers.ItemEntryWrapper
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        key={`${category}-events`}
                        onClick={() => onCategoryClick(category)}
                      >
                        <div className="inner">
                          <div>
                            <span>
                              <FontAwesomeIcon
                                style={{ fontSize: '0.95rem' }}
                                icon={getEventCategoryIcon(category)}
                              />
                            </span>
                            <div className="content">
                              <h3>{category}</h3>
                            </div>
                          </div>
                          <Wrappers.FlexRow>
                            <Wrappers.FlexRow>
                              <span
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                }}
                              >
                                {eventCounts[category] ?? 0}
                              </span>
                              <UI.ButtonText
                                text=""
                                iconRight={FA.faChevronRight}
                                iconTransform="shrink-3"
                              />
                            </Wrappers.FlexRow>
                          </Wrappers.FlexRow>
                        </div>
                      </Wrappers.ItemEntryWrapper>
                    ))}
                </Wrappers.ItemsColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          </Wrappers.FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
