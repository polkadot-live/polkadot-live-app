// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getAllEventCategories } from '@polkadot-live/consts/chains';
import { useAppSettings, useEvents } from '@polkadot-live/contexts';
import { FlexColumn } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { CategoryItem } from './CategoryItem';
import type { EventCategory } from '@polkadot-live/types';
import type { CategoriesProps } from './types';

export const Categories = ({ setSection, visible }: CategoriesProps) => {
  const { cacheGet } = useAppSettings();
  const { changeActiveCategory } = useEvents();

  const [accordionValue, setAccordionValue] = useState('Categories');

  const showDebugging = cacheGet('setting:show-debugging-subscriptions');

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
          <FlexColumn>
            <Accordion.Item className="AccordionItem" value={'Categories'}>
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>Categories</UI.TriggerHeader>
              </UI.AccordionTrigger>

              <UI.AccordionContent transparent={true}>
                <FlexColumn $rowGap={'0.75rem'}>
                  {getAllEventCategories()
                    .filter((c) => showDebugging || c !== 'Debugging')
                    .sort((a, b) => a.localeCompare(b))
                    .map((category) => (
                      <CategoryItem
                        key={`${category}-events`}
                        category={category}
                        visible={visible}
                        onClick={() => onCategoryClick(category)}
                      />
                    ))}
                </FlexColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          </FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
