// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEvents } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { categoryColors } from '../../Wrappers';
import { CategoryItemGraph } from './Graph';
import {
  CategoryCard,
  CategoryCardBody,
  CategoryCardHeader,
  ChevronIndicator,
  CountBadge,
  GraphContainer,
  IconCircle,
} from './Wrappers';
import type { EventCategory } from '@polkadot-live/types';

interface CategoryItemProps {
  category: EventCategory;
  visible: boolean;
  onClick: () => void;
}

export const CategoryItem = ({
  category,
  visible,
  onClick,
}: CategoryItemProps) => {
  const { eventCounts, getEventCategoryIcon, fetchDailyCounts } = useEvents();
  const color = categoryColors[category];
  const count = eventCounts[category] ?? 0;

  const [dailyCounts, setDailyCounts] = useState<number[]>(
    () => Array(10).fill(0) as number[],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    fetchDailyCounts(category, 10).then((counts) => {
      if (!cancelled) {
        setDailyCounts(counts);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category, visible]);

  return (
    <CategoryCard $accentColor={color} onClick={onClick}>
      <CategoryCardHeader>
        <IconCircle $color={color}>
          <FontAwesomeIcon icon={getEventCategoryIcon(category)} />
        </IconCircle>
        <span className="category-name">{category}</span>
        <CountBadge $color={color}>{count}</CountBadge>
        <ChevronIndicator>
          <FontAwesomeIcon icon={faChevronRight} />
        </ChevronIndicator>
      </CategoryCardHeader>

      <CategoryCardBody>
        <GraphContainer>
          <CategoryItemGraph category={category} dailyCounts={dailyCounts} />
        </GraphContainer>
      </CategoryCardBody>
    </CategoryCard>
  );
};
