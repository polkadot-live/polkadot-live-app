// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getAllEventCategories } from '@polkadot-live/consts/chains';
import { useAppSettings, useEvents } from '@polkadot-live/contexts';
import { FlexColumn } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { CategoryItem } from './Category';
import type { EventCategory } from '@polkadot-live/types';
import type { CategoriesProps } from './types';

export const Categories = ({ setSection, visible }: CategoriesProps) => {
  const { cacheGet } = useAppSettings();
  const { changeActiveCategory } = useEvents();

  const showDebugging = cacheGet('setting:show-debugging-subscriptions');

  const onCategoryClick = (category: EventCategory) => {
    changeActiveCategory(category);
    setSection(1);
  };

  return (
    <div style={{ width: '100%', paddingBottom: '1rem' }}>
      <FlexColumn $rowGap="0.75rem">
        <UI.ScreenInfoCard>
          <div>Select a category to view events.</div>
        </UI.ScreenInfoCard>
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
      </FlexColumn>
    </div>
  );
};
