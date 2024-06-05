// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Track } from '@/model/Track';
import type { ChainID } from '@/types/chains';
import type { ActiveReferendaInfo } from '@/types/openGov';

export interface TracksProps {
  setSection: (section: number) => void;
  chainId: ChainID;
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
