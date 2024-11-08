// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Track } from '@/model/Track';
import type { ActiveReferendaInfo } from '@/types/openGov';

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
  referendum: ActiveReferendaInfo;
  index: number;
}
