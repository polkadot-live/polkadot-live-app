// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { TrackItem } from './Wrappers';
import type { Track } from '@/model/Track';

interface TrackRowProps {
  track: Track;
}

export const TrackRow = ({ track }: TrackRowProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TrackItem>
      <div className="content-wrapper">
        <div className="left">
          <span>{track.trackId}</span>
          <span>{track.label}</span>
        </div>
        <div className="right">
          <span>{track.maxDeciding}</span>
          <button onClick={() => setExpanded(!expanded)}>Toggle Expand</button>
        </div>
      </div>
      {expanded ? <p>Is expanded</p> : <p>Not expanded</p>}
    </TrackItem>
  );
};
