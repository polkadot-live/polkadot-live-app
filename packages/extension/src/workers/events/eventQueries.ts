// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { EventCallback } from '@polkadot-live/types/reporter';

export const getAllEvents = async (): Promise<EventCallback[]> => {
  const map = await DbController.getAllObjects('events');
  return Array.from((map as Map<string, EventCallback>).values()).map((e) => e);
};
