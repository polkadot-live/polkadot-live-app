// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Track } from '@polkadot-live/core';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';

export interface TracksProps {
  setSection: (section: number) => void;
}

export interface TrackRowProps {
  track: Track;
}

export interface ReferendaProps {
  setSection: (section: number) => void;
}

export interface ReferendumRowProps {
  referendum: ReferendaInfo;
  index: number;
}
