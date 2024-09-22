// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export interface TabsContextInterface {
  activeId: number | null;
  clickedId: number | null;
  items: number[];
  sensors: AnyData;
  setClickedId: React.Dispatch<React.SetStateAction<number | null>>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}
